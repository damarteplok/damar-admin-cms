package main

import (
	"context"
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/infrastructure/grpc"
	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/infrastructure/repository"
	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/service"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/database"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
	"go.uber.org/zap"
	grpcLib "google.golang.org/grpc"
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

	grpcPort := env.GetInt("GRPC_PORT", 50051)

	logger.Info("Starting User Service",
		zap.Int("port", grpcPort),
		zap.String("environment", environment),
	)

	pool, err := database.NewPostgresPool(ctx)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer pool.Close()

	logger.Info("Successfully connected to database")

	// Connect to RabbitMQ
	rabbitmqURL := env.GetString("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
	rabbitmqConn, err := amqp.NewConnection(rabbitmqURL)
	if err != nil {
		logger.Fatal("Failed to connect to RabbitMQ", zap.Error(err))
	}
	defer rabbitmqConn.Close()

	// Create publisher for user events
	publisher, err := amqp.NewPublisher(rabbitmqConn, "damar.events")
	if err != nil {
		logger.Fatal("Failed to create RabbitMQ publisher", zap.Error(err))
	}

	logger.Info("Successfully connected to RabbitMQ")

	userRepo := repository.NewUserRepository(pool)
	userService := service.NewUserService(userRepo, publisher)
	userHandler := grpc.NewUserGRPCServer(userService)

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", grpcPort))
	if err != nil {
		logger.Fatal("Failed to listen", zap.Int("port", grpcPort), zap.Error(err))
	}

	grpcServer := grpcLib.NewServer()
	pb.RegisterUserServiceServer(grpcServer, userHandler)

	logger.Info("User service gRPC server listening", zap.Int("port", grpcPort))

	go func() {
		if err := grpcServer.Serve(lis); err != nil {
			logger.Fatal("Failed to serve gRPC", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")
	grpcServer.GracefulStop()
	logger.Info("Server stopped")
}
