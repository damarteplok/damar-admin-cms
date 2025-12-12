package main

import (
	"context"
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/damarteplok/damar-admin-cms/services/media-service/internal/infrastructure/grpc"
	"github.com/damarteplok/damar-admin-cms/services/media-service/internal/infrastructure/repository"
	"github.com/damarteplok/damar-admin-cms/services/media-service/internal/service"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/database"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/media"
	"github.com/damarteplok/damar-admin-cms/shared/storage"
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

	grpcPort := env.GetInt("GRPC_PORT", 50056)

	logger.Info("Starting Media Service",
		zap.Int("port", grpcPort),
		zap.String("environment", environment),
	)

	// Connect to PostgreSQL
	pool, err := database.NewPostgresPool(ctx)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer pool.Close()
	logger.Info("Successfully connected to database")

	// Connect to MinIO
	minioClient, err := storage.NewMinIOClient(ctx)
	if err != nil {
		logger.Fatal("Failed to connect to MinIO", zap.Error(err))
	}
	logger.Info("Successfully connected to MinIO")

	// Get bucket name from environment
	bucketName := env.GetString("MINIO_BUCKET_NAME", "aos")

	// Ensure bucket exists
	if err := storage.EnsureBucket(ctx, minioClient, bucketName); err != nil {
		logger.Fatal("Failed to ensure bucket exists", zap.String("bucket", bucketName), zap.Error(err))
	}
	logger.Info("MinIO bucket ready", zap.String("bucket", bucketName))

	// Connect to RabbitMQ
	rabbitmqURL := env.GetString("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
	rabbitmqConn, err := amqp.NewConnection(rabbitmqURL)
	if err != nil {
		logger.Fatal("Failed to connect to RabbitMQ", zap.Error(err))
	}
	defer rabbitmqConn.Close()

	// Create publisher for media events
	publisher, err := amqp.NewPublisher(rabbitmqConn, "damar.events")
	if err != nil {
		logger.Fatal("Failed to create RabbitMQ publisher", zap.Error(err))
	}
	logger.Info("Successfully connected to RabbitMQ")

	// Initialize layers (repository -> service -> handler)
	mediaRepo := repository.NewMediaRepository(pool, minioClient, bucketName)
	mediaService := service.NewMediaService(mediaRepo, publisher)
	mediaHandler := grpc.NewMediaGRPCServer(mediaService)

	// Start gRPC server
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", grpcPort))
	if err != nil {
		logger.Fatal("Failed to listen", zap.Int("port", grpcPort), zap.Error(err))
	}

	grpcServer := grpcLib.NewServer()
	pb.RegisterMediaServiceServer(grpcServer, mediaHandler)

	logger.Info("Media service gRPC server listening", zap.Int("port", grpcPort))

	// Start server in goroutine
	go func() {
		if err := grpcServer.Serve(lis); err != nil {
			logger.Fatal("Failed to serve gRPC", zap.Error(err))
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")
	grpcServer.GracefulStop()
	logger.Info("Server stopped")
}
