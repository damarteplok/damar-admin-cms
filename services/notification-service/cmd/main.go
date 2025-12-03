package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/damarteplok/damar-admin-cms/services/notification-service/internal/infrastructure/events"
	"github.com/damarteplok/damar-admin-cms/services/notification-service/internal/infrastructure/smtp"
	"github.com/damarteplok/damar-admin-cms/services/notification-service/internal/service"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/env"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"go.uber.org/zap"
)

func main() {
	// Initialize logger
	environment := env.GetString("ENVIRONMENT", "development")
	if err := logger.Initialize(environment); err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer logger.Sync()

	ctx := context.Background()

	logger.Info("Starting Notification Service", zap.String("environment", environment))

	// Connect to RabbitMQ
	rabbitmqURL := env.GetString("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
	rabbitmqConn, err := amqp.NewConnection(rabbitmqURL)
	if err != nil {
		logger.Fatal("Failed to connect to RabbitMQ", zap.Error(err))
	}
	defer rabbitmqConn.Close()

	logger.Info("Successfully connected to RabbitMQ")

	// Initialize SMTP client
	smtpHost := env.GetString("SMTP_HOST", "localhost")
	smtpPort := env.GetInt("SMTP_PORT", 1025)
	smtpUser := env.GetString("SMTP_USER", "")
	smtpPassword := env.GetString("SMTP_PASSWORD", "")
	smtpFrom := env.GetString("SMTP_FROM", "noreply@damar-admin-cms.local")
	smtpFromName := env.GetString("SMTP_FROM_NAME", "Damar Admin CMS")

	smtpClient := smtp.NewSMTPClient(smtpHost, smtpPort, smtpUser, smtpPassword, smtpFrom, smtpFromName)
	logger.Info("SMTP client initialized",
		zap.String("host", smtpHost),
		zap.Int("port", smtpPort))

	// Initialize services
	appURL := env.GetString("APP_URL", "http://localhost:8080")
	frontendURL := env.GetString("FRONTEND_URL", "http://localhost:3000")
	emailService := service.NewEmailService(smtpClient, appURL, frontendURL)

	// Start event consumers
	eventConsumer := events.NewEventConsumer(rabbitmqConn, emailService)

	// Start consuming events in goroutines
	go func() {
		if err := eventConsumer.ConsumeUserRegistered(ctx); err != nil {
			logger.Fatal("Failed to consume user.registered events", zap.Error(err))
		}
	}()

	go func() {
		if err := eventConsumer.ConsumePasswordResetRequested(ctx); err != nil {
			logger.Fatal("Failed to consume password reset events", zap.Error(err))
		}
	}()

	go func() {
		if err := eventConsumer.ConsumeVerificationRequested(ctx); err != nil {
			logger.Fatal("Failed to consume verification events", zap.Error(err))
		}
	}()

	logger.Info("Notification service started and consuming events")

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down notification service...")
	logger.Info("Notification service stopped")
}
