package main

import (
	"context"
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/infrastructure/grpc"
	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/infrastructure/repository"
	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/service"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/database"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/content"
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

	grpcPort := env.GetInt("GRPC_PORT", 50057)

	logger.Info("Starting Content Service",
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

	// Create publisher for content events
	publisher, err := amqp.NewPublisher(rabbitmqConn, "damar.events")
	if err != nil {
		logger.Fatal("Failed to create RabbitMQ publisher", zap.Error(err))
	}

	logger.Info("Successfully connected to RabbitMQ")

	// Initialize repositories
	blogPostRepo := repository.NewBlogPostRepository(pool)
	categoryRepo := repository.NewCategoryRepository(pool)
	announcementRepo := repository.NewAnnouncementRepository(pool)

	// Initialize services
	blogPostService := service.NewBlogPostService(blogPostRepo, publisher)
	categoryService := service.NewCategoryService(categoryRepo)
	announcementService := service.NewAnnouncementService(announcementRepo)

	// Initialize gRPC handlers
	blogPostHandler := grpc.NewBlogPostGRPCServer(blogPostService)
	categoryHandler := grpc.NewCategoryGRPCServer(categoryService)
	announcementHandler := grpc.NewAnnouncementGRPCServer(announcementService)

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", grpcPort))
	if err != nil {
		logger.Fatal("Failed to listen", zap.Int("port", grpcPort), zap.Error(err))
	}

	grpcServer := grpcLib.NewServer()

	// Register all handlers (they implement the same service interface)
	// Use a combined handler that delegates to the appropriate service
	combinedHandler := &CombinedContentServer{
		blogPostHandler:     blogPostHandler,
		categoryHandler:     categoryHandler,
		announcementHandler: announcementHandler,
	}
	pb.RegisterContentServiceServer(grpcServer, combinedHandler)

	logger.Info("Content service gRPC server listening", zap.Int("port", grpcPort))

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

// CombinedContentServer combines blog post, category, and announcement handlers
type CombinedContentServer struct {
	blogPostHandler     *grpc.BlogPostGRPCServer
	categoryHandler     *grpc.CategoryGRPCServer
	announcementHandler *grpc.AnnouncementGRPCServer
	pb.UnimplementedContentServiceServer
}

// Blog Post methods
func (s *CombinedContentServer) GetBlogPostByID(ctx context.Context, req *pb.GetBlogPostByIDRequest) (*pb.GetBlogPostByIDResponse, error) {
	return s.blogPostHandler.GetBlogPostByID(ctx, req)
}

func (s *CombinedContentServer) GetBlogPostBySlug(ctx context.Context, req *pb.GetBlogPostBySlugRequest) (*pb.GetBlogPostBySlugResponse, error) {
	return s.blogPostHandler.GetBlogPostBySlug(ctx, req)
}

func (s *CombinedContentServer) GetAllBlogPosts(ctx context.Context, req *pb.GetAllBlogPostsRequest) (*pb.GetAllBlogPostsResponse, error) {
	return s.blogPostHandler.GetAllBlogPosts(ctx, req)
}

func (s *CombinedContentServer) CreateBlogPost(ctx context.Context, req *pb.CreateBlogPostRequest) (*pb.CreateBlogPostResponse, error) {
	return s.blogPostHandler.CreateBlogPost(ctx, req)
}

func (s *CombinedContentServer) UpdateBlogPost(ctx context.Context, req *pb.UpdateBlogPostRequest) (*pb.UpdateBlogPostResponse, error) {
	return s.blogPostHandler.UpdateBlogPost(ctx, req)
}

func (s *CombinedContentServer) PublishBlogPost(ctx context.Context, req *pb.PublishBlogPostRequest) (*pb.PublishBlogPostResponse, error) {
	return s.blogPostHandler.PublishBlogPost(ctx, req)
}

func (s *CombinedContentServer) UnpublishBlogPost(ctx context.Context, req *pb.UnpublishBlogPostRequest) (*pb.UnpublishBlogPostResponse, error) {
	return s.blogPostHandler.UnpublishBlogPost(ctx, req)
}

func (s *CombinedContentServer) DeleteBlogPost(ctx context.Context, req *pb.DeleteBlogPostRequest) (*pb.DeleteBlogPostResponse, error) {
	return s.blogPostHandler.DeleteBlogPost(ctx, req)
}

func (s *CombinedContentServer) SearchBlogPosts(ctx context.Context, req *pb.SearchBlogPostsRequest) (*pb.SearchBlogPostsResponse, error) {
	return s.blogPostHandler.SearchBlogPosts(ctx, req)
}

// Category methods
func (s *CombinedContentServer) GetCategoryByID(ctx context.Context, req *pb.GetCategoryByIDRequest) (*pb.GetCategoryByIDResponse, error) {
	return s.categoryHandler.GetCategoryByID(ctx, req)
}

func (s *CombinedContentServer) GetCategoryBySlug(ctx context.Context, req *pb.GetCategoryBySlugRequest) (*pb.GetCategoryBySlugResponse, error) {
	return s.categoryHandler.GetCategoryBySlug(ctx, req)
}

func (s *CombinedContentServer) GetAllCategories(ctx context.Context, req *pb.GetAllCategoriesRequest) (*pb.GetAllCategoriesResponse, error) {
	return s.categoryHandler.GetAllCategories(ctx, req)
}

func (s *CombinedContentServer) CreateCategory(ctx context.Context, req *pb.CreateCategoryRequest) (*pb.CreateCategoryResponse, error) {
	return s.categoryHandler.CreateCategory(ctx, req)
}

func (s *CombinedContentServer) UpdateCategory(ctx context.Context, req *pb.UpdateCategoryRequest) (*pb.UpdateCategoryResponse, error) {
	return s.categoryHandler.UpdateCategory(ctx, req)
}

func (s *CombinedContentServer) DeleteCategory(ctx context.Context, req *pb.DeleteCategoryRequest) (*pb.DeleteCategoryResponse, error) {
	return s.categoryHandler.DeleteCategory(ctx, req)
}

// Announcement methods
func (s *CombinedContentServer) GetAnnouncementByID(ctx context.Context, req *pb.GetAnnouncementByIDRequest) (*pb.GetAnnouncementByIDResponse, error) {
	return s.announcementHandler.GetAnnouncementByID(ctx, req)
}

func (s *CombinedContentServer) GetAllAnnouncements(ctx context.Context, req *pb.GetAllAnnouncementsRequest) (*pb.GetAllAnnouncementsResponse, error) {
	return s.announcementHandler.GetAllAnnouncements(ctx, req)
}

func (s *CombinedContentServer) CreateAnnouncement(ctx context.Context, req *pb.CreateAnnouncementRequest) (*pb.CreateAnnouncementResponse, error) {
	return s.announcementHandler.CreateAnnouncement(ctx, req)
}

func (s *CombinedContentServer) UpdateAnnouncement(ctx context.Context, req *pb.UpdateAnnouncementRequest) (*pb.UpdateAnnouncementResponse, error) {
	return s.announcementHandler.UpdateAnnouncement(ctx, req)
}

func (s *CombinedContentServer) DeleteAnnouncement(ctx context.Context, req *pb.DeleteAnnouncementRequest) (*pb.DeleteAnnouncementResponse, error) {
	return s.announcementHandler.DeleteAnnouncement(ctx, req)
}

func (s *CombinedContentServer) GetActiveAnnouncements(ctx context.Context, req *pb.GetActiveAnnouncementsRequest) (*pb.GetActiveAnnouncementsResponse, error) {
	return s.announcementHandler.GetActiveAnnouncements(ctx, req)
}
