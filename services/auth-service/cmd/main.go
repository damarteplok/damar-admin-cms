package main

import (
	"context"
	"fmt"
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
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
	"go.uber.org/zap"
	grpcLib "google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// Initialize logger
	environment := env.GetString("ENVIRONMENT", "development")
	if err := logger.Initialize(environment); err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer logger.Sync()

	ctx := context.Background()

	// Set default DB_NAME if not provided
	if os.Getenv("DB_NAME") == "" {
		os.Setenv("DB_NAME", "damar_admin_cms")
	}

	grpcPort := env.GetInt("GRPC_PORT", 50052)
	userServiceAddr := env.GetString("USER_SERVICE_ADDR", "localhost:50051")
	jwtSecret := env.GetString("JWT_SECRET", "your-secret-key-change-in-production")

	logger.Info("Starting Auth Service",
		zap.Int("port", grpcPort),
		zap.String("environment", environment),
		zap.String("user_service", userServiceAddr),
	)

	// Connect to database
	pool, err := database.NewPostgresPool(ctx)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer pool.Close()

	logger.Info("Successfully connected to database")

	// Connect to user-service
	userConn, err := grpcLib.Dial(
		userServiceAddr,
		grpcLib.WithTransportCredentials(insecure.NewCredentials()),
		grpcLib.WithBlock(),
		grpcLib.WithTimeout(5*time.Second),
	)
	if err != nil {
		logger.Fatal("Failed to connect to user-service",
			zap.String("address", userServiceAddr),
			zap.Error(err),
		)
	}
	defer userConn.Close()

	logger.Info("Successfully connected to user-service", zap.String("address", userServiceAddr))

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
		logger.Fatal("Failed to listen", zap.Int("port", grpcPort), zap.Error(err))
	}

	grpcServer := grpcLib.NewServer()
	pb.RegisterAuthServiceServer(grpcServer, authHandler)

	logger.Info("Auth service gRPC server listening", zap.Int("port", grpcPort))

	go func() {
		if err := grpcServer.Serve(lis); err != nil {
			logger.Fatal("Failed to serve gRPC", zap.Error(err))
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down auth service...")
	grpcServer.GracefulStop()
	logger.Info("Auth service stopped")
}
