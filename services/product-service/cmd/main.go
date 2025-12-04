package main

import (
	"context"
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/infrastructure/grpc"
	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/infrastructure/repository"
	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/service"
	"github.com/damarteplok/damar-admin-cms/shared/database"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/product"
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

	grpcPort := env.GetInt("GRPC_PORT", 50054)

	logger.Info("Starting Product Service",
		zap.Int("port", grpcPort),
		zap.String("environment", environment),
	)

	pool, err := database.NewPostgresPool(ctx)
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer pool.Close()

	logger.Info("Successfully connected to database")

	// Initialize repositories
	productRepo := repository.NewProductRepository(pool)
	planRepo := repository.NewPlanRepository(pool)
	planPriceRepo := repository.NewPlanPriceRepository(pool)
	planMeterRepo := repository.NewPlanMeterRepository(pool)

	// Initialize discount repositories
	discountRepo := repository.NewDiscountRepository(pool)
	discountCodeRepo := repository.NewDiscountCodeRepository(pool)
	discountCodeRedemptionRepo := repository.NewDiscountCodeRedemptionRepository(pool)
	discountPlanRepo := repository.NewDiscountPlanRepository(pool)
	discountOneTimeProductRepo := repository.NewDiscountOneTimeProductRepository(pool)
	discountPaymentProviderDataRepo := repository.NewDiscountPaymentProviderDataRepository(pool)

	// Initialize services
	productService := service.NewProductService(productRepo)
	planService := service.NewPlanService(planRepo, productRepo)
	planPriceService := service.NewPlanPriceService(planPriceRepo, planRepo)
	planMeterService := service.NewPlanMeterService(planMeterRepo)

	// Initialize discount services
	discountService := service.NewDiscountService(discountRepo)
	discountCodeService := service.NewDiscountCodeService(discountCodeRepo, discountRepo)
	discountCodeRedemptionService := service.NewDiscountCodeRedemptionService(
		discountCodeRedemptionRepo,
		discountCodeRepo,
		discountPlanRepo,
	)
	discountPlanService := service.NewDiscountPlanService(discountPlanRepo, discountRepo, planRepo)
	discountOneTimeProductService := service.NewDiscountOneTimeProductService(
		discountOneTimeProductRepo,
		discountRepo,
		productRepo,
	)
	discountPaymentProviderDataService := service.NewDiscountPaymentProviderDataService(
		discountPaymentProviderDataRepo,
		discountRepo,
	)

	// Initialize gRPC handler
	productHandler := grpc.NewProductHandler(
		productService,
		planService,
		planPriceService,
		planMeterService,
		discountService,
		discountCodeService,
		discountCodeRedemptionService,
		discountPlanService,
		discountOneTimeProductService,
		discountPaymentProviderDataService,
	)

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", grpcPort))
	if err != nil {
		logger.Fatal("Failed to listen", zap.Int("port", grpcPort), zap.Error(err))
	}

	grpcServer := grpcLib.NewServer()
	pb.RegisterProductServiceServer(grpcServer, productHandler)

	logger.Info("Product service gRPC server listening", zap.Int("port", grpcPort))

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
