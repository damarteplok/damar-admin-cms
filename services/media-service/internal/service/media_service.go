package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/media-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/contracts"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type MediaService struct {
	repo      domain.MediaRepository
	publisher *amqp.Publisher
}

func NewMediaService(repo domain.MediaRepository, publisher *amqp.Publisher) domain.MediaService {
	return &MediaService{
		repo:      repo,
		publisher: publisher,
	}
}

func (s *MediaService) UploadFile(ctx context.Context, req *domain.UploadRequest) (*domain.Media, error) {
	// Input validation is handled at gRPC layer

	// Business logic: Generate UUID for the file
	fileUUID := uuid.New().String()

	// Create media entity
	media := &domain.Media{
		ModelType:            req.ModelType,
		ModelID:              req.ModelID,
		UUID:                 fileUUID,
		CollectionName:       req.CollectionName,
		Name:                 req.Name,
		FileName:             req.FileName,
		MimeType:             &req.MimeType,
		Disk:                 req.Disk,
		Size:                 req.Size,
		Manipulations:        make(map[string]interface{}),
		CustomProperties:     make(map[string]interface{}),
		GeneratedConversions: make(map[string]interface{}),
		ResponsiveImages:     make(map[string]interface{}),
	}

	// Upload to repository (handles both MinIO and DB)
	uploadedMedia, err := s.repo.Upload(ctx, media, req.Content)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	// Publish media.uploaded event
	if s.publisher != nil {
		eventData := map[string]interface{}{
			"media_id":        uploadedMedia.ID,
			"uuid":            uploadedMedia.UUID,
			"model_type":      uploadedMedia.ModelType,
			"model_id":        uploadedMedia.ModelID,
			"collection_name": uploadedMedia.CollectionName,
			"file_name":       uploadedMedia.FileName,
			"mime_type":       uploadedMedia.MimeType,
			"size":            uploadedMedia.Size,
		}
		dataBytes, _ := json.Marshal(eventData)
		message := contracts.AmqpMessage{
			OwnerID: fmt.Sprintf("%d", uploadedMedia.ModelID),
			Data:    dataBytes,
		}

		if err := s.publisher.Publish(ctx, "media.event.uploaded", message); err != nil {
			logger.Error("Failed to publish media.uploaded event",
				zap.Int64("media_id", uploadedMedia.ID),
				zap.Error(err))
		} else {
			logger.Info("Published media.uploaded event",
				zap.Int64("media_id", uploadedMedia.ID),
				zap.String("file_name", uploadedMedia.FileName))
		}
	}

	return uploadedMedia, nil
}

func (s *MediaService) GetFileByID(ctx context.Context, id int64) (*domain.Media, error) {
	// Input validation is handled at gRPC layer

	media, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}
	if media == nil {
		return nil, errors.New("file not found")
	}

	return media, nil
}

func (s *MediaService) GetFileByUUID(ctx context.Context, uuid string) (*domain.Media, error) {
	// Input validation is handled at gRPC layer

	media, err := s.repo.GetByUUID(ctx, uuid)
	if err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}
	if media == nil {
		return nil, errors.New("file not found")
	}

	return media, nil
}

func (s *MediaService) GetFilesByModel(ctx context.Context, modelType string, modelID int64, collectionName string, page, perPage int) ([]*domain.Media, int64, error) {
	// Input validation is handled at gRPC layer

	// Set defaults for pagination
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	return s.repo.GetByModel(ctx, modelType, modelID, collectionName, page, perPage)
}

func (s *MediaService) DeleteFile(ctx context.Context, id int64) error {
	// Input validation is handled at gRPC layer

	// Business validation: Check if file exists
	media, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("file not found: %w", err)
	}
	if media == nil {
		return errors.New("file not found")
	}

	// Hard delete from storage and database
	if err := s.repo.HardDelete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	// Publish media.deleted event
	if s.publisher != nil {
		eventData := map[string]interface{}{
			"media_id":        media.ID,
			"uuid":            media.UUID,
			"model_type":      media.ModelType,
			"model_id":        media.ModelID,
			"collection_name": media.CollectionName,
			"file_name":       media.FileName,
		}
		dataBytes, _ := json.Marshal(eventData)
		message := contracts.AmqpMessage{
			OwnerID: fmt.Sprintf("%d", media.ModelID),
			Data:    dataBytes,
		}

		if err := s.publisher.Publish(ctx, "media.event.deleted", message); err != nil {
			logger.Error("Failed to publish media.deleted event",
				zap.Int64("media_id", media.ID),
				zap.Error(err))
		} else {
			logger.Info("Published media.deleted event",
				zap.Int64("media_id", media.ID),
				zap.String("file_name", media.FileName))
		}
	}

	return nil
}

func (s *MediaService) GetFileURL(ctx context.Context, id int64, expirySeconds int) (string, int64, error) {
	// Input validation is handled at gRPC layer

	// Business validation: Check if file exists
	media, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return "", 0, fmt.Errorf("file not found: %w", err)
	}
	if media == nil {
		return "", 0, errors.New("file not found")
	}

	// Default expiry: 15 minutes (900 seconds)
	if expirySeconds <= 0 {
		expirySeconds = 900
	}

	// Generate pre-signed URL
	url, expiresAt, err := s.repo.GetPresignedURL(ctx, media, expirySeconds)
	if err != nil {
		return "", 0, fmt.Errorf("failed to generate URL: %w", err)
	}

	return url, expiresAt, nil
}

func (s *MediaService) GetAllMedia(ctx context.Context, page, perPage int, modelType, collectionName string) ([]*domain.Media, int64, error) {
	// Input validation is handled at gRPC layer

	// Set defaults for pagination
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	return s.repo.GetAll(ctx, page, perPage, modelType, collectionName)
}

// GeneratePresignedURL generates a pre-signed URL for accessing media from MinIO
func (s *MediaService) GeneratePresignedURL(ctx context.Context, modelType string, modelID int64, uuid, fileName string, expirySeconds int) (string, error) {
	return s.repo.GeneratePresignedURL(ctx, modelType, modelID, uuid, fileName, expirySeconds)
}
