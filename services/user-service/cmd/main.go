package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/infrastructure/grpc"
	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/infrastructure/repository"
	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/service"
	"github.com/damarteplok/damar-admin-cms/shared/database"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
	grpcLib "google.golang.org/grpc"
)

func main() {
	ctx := context.Background()

	// Set default DB_NAME if not provided
	if os.Getenv("DB_NAME") == "" {
		os.Setenv("DB_NAME", "damar_admin_cms_user")
	}

	grpcPort := env.GetInt("GRPC_PORT", 50051)

	pool, err := database.NewPostgresPool(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	log.Println("Successfully connected to database")

	userRepo := repository.NewUserRepository(pool)
	userService := service.NewUserService(userRepo)
	userHandler := grpc.NewUserGRPCServer(userService)

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", grpcPort))
	if err != nil {
		log.Fatalf("Failed to listen on port %d: %v", grpcPort, err)
	}

	grpcServer := grpcLib.NewServer()
	pb.RegisterUserServiceServer(grpcServer, userHandler)

	log.Printf("User service gRPC server listening on :%d", grpcPort)

	go func() {
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("Failed to serve gRPC: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down user service...")
	grpcServer.GracefulStop()
	log.Println("User service stopped")
}
