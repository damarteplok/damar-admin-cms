package main

import (
	"net/http"

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
	userPb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
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

	authAddr := env.GetString("AUTH_SERVICE_ADDR", "localhost:50052")
	userAddr := env.GetString("USER_SERVICE_ADDR", "localhost:50051")

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

	authClient := authPb.NewAuthServiceClient(authConn)
	userClient := userPb.NewUserServiceClient(userConn)

	resolver := &graph.Resolver{
		AuthClient: authClient,
		UserClient: userClient,
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	authMiddleware := middleware.AuthMiddleware(authClient)

	http.Handle("/", playground.Handler("GraphQL Playground", "/query"))
	http.Handle("/playground", playground.Handler("GraphQL Playground", "/query"))
	http.Handle("/graphql", playground.Handler("GraphQL Playground", "/query"))
	http.Handle("/query", authMiddleware(srv))

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
	)

	logger.Info("Starting HTTP server", zap.String("port", port))
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		logger.Fatal("HTTP server failed", zap.Error(err))
	}
}
