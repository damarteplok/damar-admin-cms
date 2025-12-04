package main

import (
	"net/http"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/damarteplok/damar-admin-cms/services/api-gateway/graph"
	"github.com/damarteplok/damar-admin-cms/services/api-gateway/internal/middleware"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	authPb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
	productPb "github.com/damarteplok/damar-admin-cms/shared/proto/product"
	tenantPb "github.com/damarteplok/damar-admin-cms/shared/proto/tenant"
	userPb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
	"github.com/damarteplok/damar-admin-cms/shared/redis"
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/vektah/gqlparser/v2/ast"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// Initialize logger
	environment := env.GetString("ENVIRONMENT", "development")
	if err := logger.Initialize(environment); err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer logger.Sync()

	port := env.GetString("PORT", "8080")

	logger.Info("Starting API Gateway",
		zap.String("port", port),
		zap.String("environment", environment),
	)

	// Initialize Redis for APQ
	redisAddr := env.GetString("REDIS_ADDR", "localhost:6379")
	redisClient, err := redis.NewClient(redisAddr, "", 0)
	if err != nil {
		logger.Warn("Failed to connect to Redis, falling back to in-memory cache",
			zap.Error(err),
			zap.String("redis_addr", redisAddr),
		)
		redisClient = nil
	}
	if redisClient != nil {
		defer redisClient.Close()
		logger.Info("Connected to Redis", zap.String("addr", redisAddr))
	}

	authAddr := env.GetString("AUTH_SERVICE_ADDR", "localhost:50052")
	userAddr := env.GetString("USER_SERVICE_ADDR", "localhost:50051")
	tenantAddr := env.GetString("TENANT_SERVICE_ADDR", "localhost:50053")
	productAddr := env.GetString("PRODUCT_SERVICE_ADDR", "localhost:50054")

	authConn, err := grpc.NewClient(authAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		logger.Fatal("Failed to connect to auth service", zap.Error(err))
	}
	defer authConn.Close()

	userConn, err := grpc.NewClient(userAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		logger.Fatal("Failed to connect to user service", zap.Error(err))
	}
	defer userConn.Close()

	tenantConn, err := grpc.NewClient(tenantAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		logger.Fatal("Failed to connect to tenant service", zap.Error(err))
	}
	defer tenantConn.Close()

	productConn, err := grpc.NewClient(productAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		logger.Fatal("Failed to connect to product service", zap.Error(err))
	}
	defer productConn.Close()

	authClient := authPb.NewAuthServiceClient(authConn)
	userClient := userPb.NewUserServiceClient(userConn)
	tenantClient := tenantPb.NewTenantServiceClient(tenantConn)
	productClient := productPb.NewProductServiceClient(productConn)

	resolver := &graph.Resolver{
		AuthClient:    authClient,
		UserClient:    userClient,
		TenantClient:  tenantClient,
		ProductClient: productClient,
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})

	// Use Redis for APQ if available, otherwise fallback to LRU cache
	if redisClient != nil {
		apqCache := redis.NewAPQCache(redisClient.Client, 24*time.Hour)
		srv.Use(extension.AutomaticPersistedQuery{
			Cache: apqCache,
		})
		logger.Info("APQ enabled with Redis cache")
	} else {
		srv.Use(extension.AutomaticPersistedQuery{
			Cache: lru.New[string](100),
		})
		logger.Info("APQ enabled with LRU cache (in-memory)")
	}

	// Setup router with middleware
	router := chi.NewRouter()

	// Core middleware stack
	router.Use(chiMiddleware.RequestID)
	router.Use(chiMiddleware.RealIP)
	router.Use(chiMiddleware.Logger)
	router.Use(chiMiddleware.Recoverer)
	router.Use(chiMiddleware.Timeout(60 * time.Second))

	// CORS configuration
	allowedOrigins := env.GetString("CORS_ALLOWED_ORIGINS", "*")
	var corsOrigins []string
	if allowedOrigins == "*" {
		corsOrigins = []string{"*"}
	} else {
		corsOrigins = strings.Split(allowedOrigins, ",")
	}

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   corsOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Request-ID"},
		ExposedHeaders:   []string{"Link", "X-Request-ID"},
		AllowCredentials: allowedOrigins != "*", // credentials not allowed with wildcard
		MaxAge:           300,                   // 5 minutes
	}))

	// Compress responses
	router.Use(chiMiddleware.Compress(5))

	// Security headers
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("X-Frame-Options", "DENY")
			w.Header().Set("X-XSS-Protection", "1; mode=block")
			w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
			if environment == "production" {
				w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
			}
			next.ServeHTTP(w, r)
		})
	})

	// Health check endpoint
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","service":"api-gateway"}`))
	})

	// GraphQL Playground routes
	router.Get("/", playground.Handler("GraphQL Playground", "/query"))
	router.Get("/playground", playground.Handler("GraphQL Playground", "/query"))
	router.Get("/graphql", playground.Handler("GraphQL Playground", "/query"))

	// GraphQL API endpoint with auth middleware
	authMiddleware := middleware.AuthMiddleware(authClient)
	router.Handle("/query", authMiddleware(srv))

	logger.Info("╔═══════════════════════════════════════════════════════════╗")
	logger.Info("║                                                           ║")
	logger.Info("║       🚀 GraphQL API Gateway is running! 🚀               ║")
	logger.Info("║                                                           ║")
	logger.Info("╚═══════════════════════════════════════════════════════════╝")
	logger.Info("GraphQL Playground URLs",
		zap.String("main", "http://localhost:"+port+"/"),
		zap.String("playground", "http://localhost:"+port+"/playground"),
		zap.String("graphql", "http://localhost:"+port+"/graphql"),
		zap.String("endpoint", "http://localhost:"+port+"/query"),
		zap.String("health", "http://localhost:"+port+"/health"),
	)
	logger.Info("Middleware enabled",
		zap.String("cors_origins", allowedOrigins),
		zap.Bool("compression", true),
		zap.Bool("security_headers", true),
	)

	logger.Info("Starting HTTP server", zap.String("port", port))
	if err := http.ListenAndServe(":"+port, router); err != nil {
		logger.Fatal("HTTP server failed", zap.Error(err))
	}
}
