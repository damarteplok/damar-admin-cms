package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/api-gateway/graph/model"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	mediaPb "github.com/damarteplok/damar-admin-cms/shared/proto/media"
	"github.com/damarteplok/damar-admin-cms/shared/util"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// MediaCacheService handles media caching operations
type MediaCacheService struct {
	redis       *redis.Client
	mediaClient mediaPb.MediaServiceClient
	ttl         time.Duration
}

// NewMediaCacheService creates a new media cache service
func NewMediaCacheService(redis *redis.Client, mediaClient mediaPb.MediaServiceClient, ttl time.Duration) *MediaCacheService {
	return &MediaCacheService{
		redis:       redis,
		mediaClient: mediaClient,
		ttl:         ttl,
	}
}

// GetUserAvatar retrieves user avatar with caching
func (s *MediaCacheService) GetUserAvatar(ctx context.Context, userID string) (*model.Media, error) {
	logger.Info("GetUserAvatar called",
		zap.String("user_id", userID),
	)

	if s.redis == nil {
		logger.Debug("No redis cache, fetching directly")
		// No cache, fetch directly
		return s.fetchUserAvatar(ctx, userID)
	}

	cacheKey := fmt.Sprintf("user:%s:avatar", userID)

	// Try cache first
	cached, err := s.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var media model.Media
		if err := json.Unmarshal([]byte(cached), &media); err == nil {
			logger.Debug("Cache hit for user avatar",
				zap.String("user_id", userID),
				zap.String("cache_key", cacheKey),
			)
			return &media, nil
		}
	}

	// Cache miss, fetch from media service
	logger.Debug("Cache miss for user avatar",
		zap.String("user_id", userID),
		zap.String("cache_key", cacheKey),
	)

	media, err := s.fetchUserAvatar(ctx, userID)
	if err != nil {
		return nil, err
	}

	if media == nil {
		return nil, nil
	}

	// Store in cache
	if err := s.setCache(ctx, cacheKey, media); err != nil {
		logger.Warn("Failed to cache user avatar",
			zap.Error(err),
			zap.String("user_id", userID),
		)
	}

	return media, nil
}

// GetModelMedia retrieves media for any model type with caching
func (s *MediaCacheService) GetModelMedia(ctx context.Context, modelType string, modelID string, collectionName string) ([]*model.Media, error) {
	if s.redis == nil {
		// No cache, fetch directly
		return s.fetchModelMedia(ctx, modelType, modelID, collectionName)
	}

	cacheKey := fmt.Sprintf("media:%s:%s:%s", modelType, modelID, collectionName)

	// Try cache first
	cached, err := s.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var mediaList []*model.Media
		if err := json.Unmarshal([]byte(cached), &mediaList); err == nil {
			logger.Debug("Cache hit for model media",
				zap.String("model_type", modelType),
				zap.String("model_id", modelID),
				zap.String("cache_key", cacheKey),
			)
			return mediaList, nil
		}
	}

	// Cache miss, fetch from media service
	logger.Debug("Cache miss for model media",
		zap.String("model_type", modelType),
		zap.String("model_id", modelID),
		zap.String("cache_key", cacheKey),
	)

	mediaList, err := s.fetchModelMedia(ctx, modelType, modelID, collectionName)
	if err != nil {
		return nil, err
	}

	// Store in cache
	if err := s.setCache(ctx, cacheKey, mediaList); err != nil {
		logger.Warn("Failed to cache model media",
			zap.Error(err),
			zap.String("model_type", modelType),
			zap.String("model_id", modelID),
		)
	}

	return mediaList, nil
}

// InvalidateUserAvatar removes user avatar from cache
func (s *MediaCacheService) InvalidateUserAvatar(ctx context.Context, userID string) error {
	if s.redis == nil {
		return nil
	}

	cacheKey := fmt.Sprintf("user:%s:avatar", userID)
	if err := s.redis.Del(ctx, cacheKey).Err(); err != nil {
		logger.Warn("Failed to invalidate user avatar cache",
			zap.Error(err),
			zap.String("user_id", userID),
		)
		return err
	}

	logger.Debug("Invalidated user avatar cache",
		zap.String("user_id", userID),
		zap.String("cache_key", cacheKey),
	)

	return nil
}

// InvalidateModelMedia removes model media from cache
func (s *MediaCacheService) InvalidateModelMedia(ctx context.Context, modelType string, modelID string, collectionName string) error {
	if s.redis == nil {
		return nil
	}

	cacheKey := fmt.Sprintf("media:%s:%s:%s", modelType, modelID, collectionName)
	if err := s.redis.Del(ctx, cacheKey).Err(); err != nil {
		logger.Warn("Failed to invalidate model media cache",
			zap.Error(err),
			zap.String("model_type", modelType),
			zap.String("model_id", modelID),
		)
		return err
	}

	logger.Debug("Invalidated model media cache",
		zap.String("model_type", modelType),
		zap.String("model_id", modelID),
		zap.String("cache_key", cacheKey),
	)

	return nil
}

// fetchUserAvatar fetches user avatar from media service
func (s *MediaCacheService) fetchUserAvatar(ctx context.Context, userID string) (*model.Media, error) {
	logger.Info("fetchUserAvatar called",
		zap.String("user_id", userID),
	)

	userIDInt, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		logger.Error("Failed to parse user ID",
			zap.Error(err),
			zap.String("user_id", userID),
		)
		return nil, fmt.Errorf("invalid user ID: %w", err)
	}

	logger.Debug("Calling media-service GetFilesByModel",
		zap.Int64("user_id_int", userIDInt),
		zap.String("model_type", "user"),
		zap.String("collection_name", "avatar"),
	)

	resp, err := s.mediaClient.GetFilesByModel(ctx, &mediaPb.GetFilesByModelRequest{
		ModelType:      "user",
		ModelId:        userIDInt,
		CollectionName: "avatar",
		Page:           1,
		PerPage:        1,
	})
	if err != nil {
		logger.Error("Failed to call media-service",
			zap.Error(err),
			zap.Int64("user_id", userIDInt),
		)
		return nil, err
	}

	logger.Info("GetFilesByModel response",
		zap.Bool("has_data", resp.Data != nil),
		zap.Int("media_count", func() int {
			if resp.Data != nil {
				return len(resp.Data.Media)
			}
			return 0
		}()),
	)

	if resp.Data == nil || len(resp.Data.Media) == 0 {
		logger.Warn("No avatar found for user",
			zap.String("user_id", userID),
		)
		return nil, nil
	}

	media := pbMediaToModel(resp.Data.Media[0])
	logger.Info("Avatar found",
		zap.String("user_id", userID),
		zap.String("media_id", media.ID),
		zap.String("uuid", media.UUID),
		zap.String("file_name", media.FileName),
	)

	return media, nil
}

// fetchModelMedia fetches media from media service
func (s *MediaCacheService) fetchModelMedia(ctx context.Context, modelType string, modelID string, collectionName string) ([]*model.Media, error) {
	modelIDInt, err := strconv.ParseInt(modelID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid model ID: %w", err)
	}

	resp, err := s.mediaClient.GetFilesByModel(ctx, &mediaPb.GetFilesByModelRequest{
		ModelType:      modelType,
		ModelId:        modelIDInt,
		CollectionName: collectionName,
		Page:           1,
		PerPage:        10,
	})
	if err != nil {
		return nil, err
	}

	if resp.Data == nil || len(resp.Data.Media) == 0 {
		return make([]*model.Media, 0), nil
	}

	mediaList := make([]*model.Media, len(resp.Data.Media))
	for i, pbMedia := range resp.Data.Media {
		mediaList[i] = pbMediaToModel(pbMedia)
	}

	return mediaList, nil
}

// setCache stores data in cache
func (s *MediaCacheService) setCache(ctx context.Context, key string, value interface{}) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return s.redis.Set(ctx, key, data, s.ttl).Err()
}

// pbMediaToModel converts protobuf media to GraphQL model
func pbMediaToModel(m *mediaPb.Media) *model.Media {
	if m == nil {
		return nil
	}

	// Use presigned URL from proto if available, otherwise construct it
	var url string
	if m.PresignedUrl != "" {
		url = m.PresignedUrl
	} else {
		url = util.ConstructMediaURL(m.Uuid, m.FileName)
	}

	return &model.Media{
		ID:             fmt.Sprintf("%d", m.Id),
		ModelType:      m.ModelType,
		ModelID:        fmt.Sprintf("%d", m.ModelId),
		UUID:           m.Uuid,
		CollectionName: m.CollectionName,
		Name:           m.Name,
		FileName:       m.FileName,
		MimeType: func() *string {
			if m.MimeType != "" {
				return &m.MimeType
			}
			return nil
		}(),
		Disk: m.Disk,
		ConversionsDisk: func() *string {
			if m.ConversionsDisk != "" {
				return &m.ConversionsDisk
			}
			return nil
		}(),
		Size:                 int32(m.Size),
		Manipulations:        m.Manipulations,
		CustomProperties:     m.CustomProperties,
		GeneratedConversions: m.GeneratedConversions,
		ResponsiveImages:     m.ResponsiveImages,
		OrderColumn: func() *int32 {
			if m.OrderColumn != 0 {
				v := int32(m.OrderColumn)
				return &v
			}
			return nil
		}(),
		URL:       &url,
		CreatedAt: int32(m.CreatedAt),
		UpdatedAt: int32(m.UpdatedAt),
	}
}
