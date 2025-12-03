package events

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/notification-service/internal/service"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/contracts"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"go.uber.org/zap"
)

type EventConsumer struct {
	conn         *amqp.Connection
	emailService *service.EmailService
}

func NewEventConsumer(conn *amqp.Connection, emailService *service.EmailService) *EventConsumer {
	return &EventConsumer{
		conn:         conn,
		emailService: emailService,
	}
}

// ConsumeUserRegistered consumes user.registered events
func (ec *EventConsumer) ConsumeUserRegistered(ctx context.Context) error {
	consumer, err := amqp.NewConsumer(
		ec.conn,
		"notification.user.registered",
		"damar.events",
		contracts.UserEventRegistered,
	)
	if err != nil {
		return fmt.Errorf("failed to create consumer: %w", err)
	}

	logger.Info("Started consuming user.registered events")

	return consumer.Consume(func(body []byte) error {
		var message contracts.AmqpMessage
		if err := json.Unmarshal(body, &message); err != nil {
			logger.Error("Failed to unmarshal user.registered message", zap.Error(err))
			return err
		}

		// Parse event data
		var eventData map[string]interface{}
		if err := json.Unmarshal(message.Data, &eventData); err != nil {
			logger.Error("Failed to unmarshal event data", zap.Error(err))
			return err
		}

		email, _ := eventData["email"].(string)
		name, _ := eventData["name"].(string)
		userID := message.OwnerID

		logger.Info("Processing user.registered event",
			zap.String("user_id", userID),
			zap.String("email", email),
			zap.String("name", name))

		// Send welcome email without verification token
		// Verification email is sent separately via auth.event.verification_requested
		if err := ec.emailService.SendWelcomeEmail(email, name, ""); err != nil {
			logger.Error("Failed to send welcome email",
				zap.String("email", email),
				zap.Error(err))
			return err
		}

		logger.Info("Welcome email sent successfully",
			zap.String("email", email))

		return nil
	})
}

// ConsumePasswordResetRequested consumes auth.event.password_reset_requested events
func (ec *EventConsumer) ConsumePasswordResetRequested(ctx context.Context) error {
	consumer, err := amqp.NewConsumer(
		ec.conn,
		"notification.password.reset",
		"damar.events",
		contracts.AuthEventPasswordResetRequested,
	)
	if err != nil {
		return fmt.Errorf("failed to create consumer: %w", err)
	}

	logger.Info("Started consuming password reset events")

	return consumer.Consume(func(body []byte) error {
		var message contracts.AmqpMessage
		if err := json.Unmarshal(body, &message); err != nil {
			logger.Error("Failed to unmarshal password reset message", zap.Error(err))
			return err
		}

		var eventData map[string]interface{}
		if err := json.Unmarshal(message.Data, &eventData); err != nil {
			logger.Error("Failed to unmarshal event data", zap.Error(err))
			return err
		}

		email, _ := eventData["email"].(string)
		name, _ := eventData["name"].(string)
		resetToken, _ := eventData["reset_token"].(string)

		logger.Info("Processing password reset event",
			zap.String("email", email))

		if err := ec.emailService.SendPasswordResetEmail(email, name, resetToken); err != nil {
			logger.Error("Failed to send password reset email",
				zap.String("email", email),
				zap.Error(err))
			return err
		}

		logger.Info("Password reset email sent successfully",
			zap.String("email", email))

		return nil
	})
}

// ConsumeVerificationRequested consumes auth.event.verification_requested events
func (ec *EventConsumer) ConsumeVerificationRequested(ctx context.Context) error {
	consumer, err := amqp.NewConsumer(
		ec.conn,
		"notification.email.verification",
		"damar.events",
		contracts.AuthEventVerificationRequested,
	)
	if err != nil {
		return fmt.Errorf("failed to create consumer: %w", err)
	}

	logger.Info("Started consuming email verification events")

	return consumer.Consume(func(body []byte) error {
		var message contracts.AmqpMessage
		if err := json.Unmarshal(body, &message); err != nil {
			logger.Error("Failed to unmarshal verification message", zap.Error(err))
			return err
		}

		var eventData map[string]interface{}
		if err := json.Unmarshal(message.Data, &eventData); err != nil {
			logger.Error("Failed to unmarshal event data", zap.Error(err))
			return err
		}

		email, _ := eventData["email"].(string)
		name, _ := eventData["name"].(string)
		verificationToken, _ := eventData["verification_token"].(string)

		logger.Info("Processing email verification event",
			zap.String("email", email))

		if err := ec.emailService.SendEmailVerification(email, name, verificationToken); err != nil {
			logger.Error("Failed to send verification email",
				zap.String("email", email),
				zap.Error(err))
			return err
		}

		logger.Info("Verification email sent successfully",
			zap.String("email", email))

		return nil
	})
}
