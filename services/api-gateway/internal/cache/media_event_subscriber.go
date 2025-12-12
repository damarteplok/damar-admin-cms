package cache

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/contracts"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"go.uber.org/zap"
)

// MediaEventSubscriber handles media events for cache invalidation
type MediaEventSubscriber struct {
	cacheService *MediaCacheService
	amqpConn     *amqp.Connection
}

// NewMediaEventSubscriber creates a new media event subscriber
func NewMediaEventSubscriber(cacheService *MediaCacheService, amqpConn *amqp.Connection) *MediaEventSubscriber {
	return &MediaEventSubscriber{
		cacheService: cacheService,
		amqpConn:     amqpConn,
	}
}

// Start begins listening to media events
func (s *MediaEventSubscriber) Start(ctx context.Context) error {
	// Create consumers for media events
	uploadedConsumer, err := amqp.NewConsumer(
		s.amqpConn,
		"api-gateway-media-uploaded",
		"damar.events",
		contracts.RoutingKeyMediaEventUploaded,
	)
	if err != nil {
		return fmt.Errorf("failed to create uploaded consumer: %w", err)
	}

	deletedConsumer, err := amqp.NewConsumer(
		s.amqpConn,
		"api-gateway-media-deleted",
		"damar.events",
		contracts.RoutingKeyMediaEventDeleted,
	)
	if err != nil {
		return fmt.Errorf("failed to create deleted consumer: %w", err)
	}

	// Start consuming in goroutines
	go func() {
		if err := uploadedConsumer.Consume(func(body []byte) error {
			var msg contracts.AmqpMessage
			if err := json.Unmarshal(body, &msg); err != nil {
				logger.Warn("Failed to unmarshal AMQP message", zap.Error(err))
				return nil
			}
			return s.onMediaUploaded(msg)
		}); err != nil {
			logger.Error("Failed to consume uploaded events", zap.Error(err))
		}
	}()

	go func() {
		if err := deletedConsumer.Consume(func(body []byte) error {
			var msg contracts.AmqpMessage
			if err := json.Unmarshal(body, &msg); err != nil {
				logger.Warn("Failed to unmarshal AMQP message", zap.Error(err))
				return nil
			}
			return s.onMediaDeleted(msg)
		}); err != nil {
			logger.Error("Failed to consume deleted events", zap.Error(err))
		}
	}()

	logger.Info("Media event subscriber started for cache invalidation")
	return nil
}

// onMediaUploaded handles media.event.uploaded events
func (s *MediaEventSubscriber) onMediaUploaded(msg contracts.AmqpMessage) error {
	logger.Debug("Received media.event.uploaded",
		zap.String("owner_id", msg.OwnerID),
		zap.ByteString("data", msg.Data),
	)

	// Parse Data as JSON
	var data map[string]interface{}
	if err := json.Unmarshal(msg.Data, &data); err != nil {
		logger.Warn("Failed to parse media event data", zap.Error(err))
		return nil
	}

	// Extract model_type and model_id from event
	modelType, ok := data["model_type"].(string)
	if !ok {
		logger.Warn("Invalid model_type in media event", zap.Any("data", data))
		return nil
	}

	modelID := extractModelID(data)
	if modelID == "" {
		logger.Warn("Invalid model_id in media event", zap.Any("data", data))
		return nil
	}

	collectionName := ""
	if col, ok := data["collection"].(string); ok {
		collectionName = col
	}

	// Invalidate cache for this model
	ctx := context.Background()
	if err := s.cacheService.InvalidateModelMedia(ctx, modelType, modelID, collectionName); err != nil {
		logger.Error("Failed to invalidate cache on media upload",
			zap.Error(err),
			zap.String("model_type", modelType),
			zap.String("model_id", modelID),
		)
	}

	// If it's a user avatar, also invalidate user avatar cache
	if modelType == "user" && collectionName == "avatar" {
		if err := s.cacheService.InvalidateUserAvatar(ctx, modelID); err != nil {
			logger.Error("Failed to invalidate user avatar cache",
				zap.Error(err),
				zap.String("user_id", modelID),
			)
		}
	}

	return nil
}

// onMediaDeleted handles media.event.deleted events
func (s *MediaEventSubscriber) onMediaDeleted(msg contracts.AmqpMessage) error {
	logger.Debug("Received media.event.deleted",
		zap.String("owner_id", msg.OwnerID),
		zap.ByteString("data", msg.Data),
	)

	// Parse Data as JSON
	var data map[string]interface{}
	if err := json.Unmarshal(msg.Data, &data); err != nil {
		logger.Warn("Failed to parse media event data", zap.Error(err))
		return nil
	}

	// Extract model_type and model_id from event
	modelType, ok := data["model_type"].(string)
	if !ok {
		logger.Warn("Invalid model_type in media event", zap.Any("data", data))
		return nil
	}

	modelID := extractModelID(data)
	if modelID == "" {
		logger.Warn("Invalid model_id in media event", zap.Any("data", data))
		return nil
	}

	collectionName := ""
	if col, ok := data["collection"].(string); ok {
		collectionName = col
	}

	// Invalidate cache for this model
	ctx := context.Background()
	if err := s.cacheService.InvalidateModelMedia(ctx, modelType, modelID, collectionName); err != nil {
		logger.Error("Failed to invalidate cache on media delete",
			zap.Error(err),
			zap.String("model_type", modelType),
			zap.String("model_id", modelID),
		)
	}

	// If it's a user avatar, also invalidate user avatar cache
	if modelType == "user" && collectionName == "avatar" {
		if err := s.cacheService.InvalidateUserAvatar(ctx, modelID); err != nil {
			logger.Error("Failed to invalidate user avatar cache",
				zap.Error(err),
				zap.String("user_id", modelID),
			)
		}
	}

	return nil
}

// extractModelID extracts model ID from event data, handling both string and numeric types
func extractModelID(data map[string]interface{}) string {
	// Try as string first
	if modelID, ok := data["model_id"].(string); ok {
		return modelID
	}

	// Try as float64 (JSON numbers)
	if modelIDFloat, ok := data["model_id"].(float64); ok {
		return fmt.Sprintf("%.0f", modelIDFloat)
	}

	// Try as int64
	if modelIDInt, ok := data["model_id"].(int64); ok {
		return fmt.Sprintf("%d", modelIDInt)
	}

	// Try as int
	if modelIDInt, ok := data["model_id"].(int); ok {
		return fmt.Sprintf("%d", modelIDInt)
	}

	return ""
}
