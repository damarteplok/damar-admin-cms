package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/infrastructure/grpc"
	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/infrastructure/jwt"
	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/infrastructure/repository"
	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/service"
	"github.com/damarteplok/damar-admin-cms/shared/database"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
	grpcLib "google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	ctx := context.Background()

	// Set default DB_NAME if not provided
	if os.Getenv("DB_NAME") == "" {
		os.Setenv("DB_NAME", "damar_admin_cms_auth")
	}

	grpcPort := env.GetInt("GRPC_PORT", 50052)
	userServiceAddr := env.GetString("USER_SERVICE_ADDR", "localhost:50051")
	jwtSecret := env.GetString("JWT_SECRET", "your-secret-key-change-in-production")

	// Connect to database
	pool, err := database.NewPostgresPool(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	log.Println("Successfully connected to database")

	// Connect to user-service
	userConn, err := grpcLib.Dial(
		userServiceAddr,
		grpcLib.WithTransportCredentials(insecure.NewCredentials()),
		grpcLib.WithBlock(),
		grpcLib.WithTimeout(5*time.Second),
	)
	if err != nil {
		log.Fatalf("Failed to connect to user-service at %s: %v", userServiceAddr, err)
	}
	defer userConn.Close()

	log.Printf("Successfully connected to user-service at %s", userServiceAddr)

	// Initialize dependencies
	tokenManager := jwt.NewTokenManager(jwtSecret, 1*time.Hour, 7*24*time.Hour)
	refreshTokenRepo := repository.NewRefreshTokenRepository(pool)
	passwordResetRepo := repository.NewPasswordResetTokenRepository(pool)
	emailVerificationRepo := repository.NewEmailVerificationTokenRepository(pool)
	authService := service.NewAuthService(refreshTokenRepo, passwordResetRepo, emailVerificationRepo, tokenManager, userConn)
	authHandler := grpc.NewAuthGRPCServer(authService)

	// Setup gRPC server
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", grpcPort))
	if err != nil {
		log.Fatalf("Failed to listen on port %d: %v", grpcPort, err)
	}

	grpcServer := grpcLib.NewServer()
	pb.RegisterAuthServiceServer(grpcServer, authHandler)

	log.Printf("Auth service gRPC server listening on :%d", grpcPort)

	go func() {
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("Failed to serve gRPC: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down auth service...")
	grpcServer.GracefulStop()
	log.Println("Auth service stopped")
}
