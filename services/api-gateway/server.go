package main

import (
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/damarteplok/damar-admin-cms/services/api-gateway/graph"
	"github.com/damarteplok/damar-admin-cms/services/api-gateway/internal/middleware"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	authPb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
	userPb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
	"github.com/vektah/gqlparser/v2/ast"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	port := env.GetString("PORT", "8080")

	authAddr := env.GetString("AUTH_SERVICE_ADDR", "localhost:50052")
	userAddr := env.GetString("USER_SERVICE_ADDR", "localhost:50051")

	authConn, err := grpc.NewClient(authAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to auth service: %v", err)
	}
	defer authConn.Close()

	userConn, err := grpc.NewClient(userAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to user service: %v", err)
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

	log.Println("╔═══════════════════════════════════════════════════════════╗")
	log.Println("║                                                           ║")
	log.Println("║       🚀 GraphQL API Gateway is running! 🚀               ║")
	log.Println("║                                                           ║")
	log.Println("╚═══════════════════════════════════════════════════════════╝")
	log.Printf("📍 GraphQL Playground: http://localhost:%s/", port)
	log.Printf("📍 Alternative URLs:")
	log.Printf("   - http://localhost:%s/playground", port)
	log.Printf("   - http://localhost:%s/graphql", port)
	log.Printf("🔗 GraphQL Endpoint: http://localhost:%s/query", port)
	log.Println("════════════════════════════════════════════════════════════")

	log.Fatal(http.ListenAndServe(":"+port, nil))
}
