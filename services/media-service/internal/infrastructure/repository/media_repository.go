package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/media-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/minio/minio-go/v7"
	"go.uber.org/zap"
)

type MediaRepository struct {
	db         *pgxpool.Pool
	minio      *minio.Client
	bucketName string
}

func NewMediaRepository(db *pgxpool.Pool, minioClient *minio.Client, bucketName string) domain.MediaRepository {
	return &MediaRepository{
		db:         db,
		minio:      minioClient,
		bucketName: bucketName,
	}
}

func (r *MediaRepository) Upload(ctx context.Context, media *domain.Media, content io.Reader) (*domain.Media, error) {
	// Construct object path: {model_type}/{model_id}/{uuid}/{file_name}
	objectPath := fmt.Sprintf("%s/%d/%s/%s", media.ModelType, media.ModelID, media.UUID, media.FileName)

	// Read content into buffer to enable retry capability
	contentBytes, err := io.ReadAll(content)
	if err != nil {
		return nil, fmt.Errorf("failed to read content: %w", err)
	}

	// Upload to MinIO
	_, err = r.minio.PutObject(
		ctx,
		r.bucketName,
		objectPath,
		bytes.NewReader(contentBytes),
		int64(len(contentBytes)),
		minio.PutObjectOptions{
			ContentType: *media.MimeType,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to upload to MinIO: %w", err)
	}

	// Store the object path in disk field
	media.Disk = objectPath

	// Marshal JSON fields
	manipulationsJSON, _ := json.Marshal(media.Manipulations)
	customPropertiesJSON, _ := json.Marshal(media.CustomProperties)
	generatedConversionsJSON, _ := json.Marshal(media.GeneratedConversions)
	responsiveImagesJSON, _ := json.Marshal(media.ResponsiveImages)

	// Save metadata to database
	query := `
		INSERT INTO media (
			model_type, model_id, uuid, collection_name, name, file_name, 
			mime_type, disk, conversions_disk, size, manipulations, 
			custom_properties, generated_conversions, responsive_images, 
			order_column, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err = r.db.QueryRow(
		ctx,
		query,
		media.ModelType,
		media.ModelID,
		media.UUID,
		media.CollectionName,
		media.Name,
		media.FileName,
		media.MimeType,
		media.Disk,
		media.ConversionsDisk,
		media.Size,
		manipulationsJSON,
		customPropertiesJSON,
		generatedConversionsJSON,
		responsiveImagesJSON,
		media.OrderColumn,
	).Scan(&media.ID, &media.CreatedAt, &media.UpdatedAt)
	if err != nil {
		// Rollback: Delete from MinIO if database insert fails
		logger.Warn("Database insert failed, rolling back MinIO upload",
			zap.String("object_path", objectPath),
			zap.Error(err))

		removeErr := r.minio.RemoveObject(ctx, r.bucketName, objectPath, minio.RemoveObjectOptions{})
		if removeErr != nil {
			logger.Error("Failed to rollback MinIO upload",
				zap.String("object_path", objectPath),
				zap.Error(removeErr))
		}

		return nil, fmt.Errorf("failed to save media metadata: %w", err)
	}

	return media, nil
}

func (r *MediaRepository) GetByID(ctx context.Context, id int64) (*domain.Media, error) {
	query := `
		SELECT id, model_type, model_id, uuid, collection_name, name, file_name,
		       mime_type, disk, conversions_disk, size, manipulations,
		       custom_properties, generated_conversions, responsive_images,
		       order_column, created_at, updated_at
		FROM media
		WHERE id = $1
	`

	media := &domain.Media{}
	var manipulationsJSON, customPropertiesJSON, generatedConversionsJSON, responsiveImagesJSON []byte

	err := r.db.QueryRow(ctx, query, id).Scan(
		&media.ID,
		&media.ModelType,
		&media.ModelID,
		&media.UUID,
		&media.CollectionName,
		&media.Name,
		&media.FileName,
		&media.MimeType,
		&media.Disk,
		&media.ConversionsDisk,
		&media.Size,
		&manipulationsJSON,
		&customPropertiesJSON,
		&generatedConversionsJSON,
		&responsiveImagesJSON,
		&media.OrderColumn,
		&media.CreatedAt,
		&media.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get media by ID: %w", err)
	}

	// Unmarshal JSON fields
	json.Unmarshal(manipulationsJSON, &media.Manipulations)
	json.Unmarshal(customPropertiesJSON, &media.CustomProperties)
	json.Unmarshal(generatedConversionsJSON, &media.GeneratedConversions)
	json.Unmarshal(responsiveImagesJSON, &media.ResponsiveImages)

	return media, nil
}

func (r *MediaRepository) GetByUUID(ctx context.Context, uuid string) (*domain.Media, error) {
	query := `
		SELECT id, model_type, model_id, uuid, collection_name, name, file_name,
		       mime_type, disk, conversions_disk, size, manipulations,
		       custom_properties, generated_conversions, responsive_images,
		       order_column, created_at, updated_at
		FROM media
		WHERE uuid = $1
	`

	media := &domain.Media{}
	var manipulationsJSON, customPropertiesJSON, generatedConversionsJSON, responsiveImagesJSON []byte

	err := r.db.QueryRow(ctx, query, uuid).Scan(
		&media.ID,
		&media.ModelType,
		&media.ModelID,
		&media.UUID,
		&media.CollectionName,
		&media.Name,
		&media.FileName,
		&media.MimeType,
		&media.Disk,
		&media.ConversionsDisk,
		&media.Size,
		&manipulationsJSON,
		&customPropertiesJSON,
		&generatedConversionsJSON,
		&responsiveImagesJSON,
		&media.OrderColumn,
		&media.CreatedAt,
		&media.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get media by UUID: %w", err)
	}

	// Unmarshal JSON fields
	json.Unmarshal(manipulationsJSON, &media.Manipulations)
	json.Unmarshal(customPropertiesJSON, &media.CustomProperties)
	json.Unmarshal(generatedConversionsJSON, &media.GeneratedConversions)
	json.Unmarshal(responsiveImagesJSON, &media.ResponsiveImages)

	return media, nil
}

func (r *MediaRepository) GetByModel(ctx context.Context, modelType string, modelID int64, collectionName string, page, perPage int) ([]*domain.Media, int64, error) {
	logger.Info("GetByModel called",
		zap.String("model_type", modelType),
		zap.Int64("model_id", modelID),
		zap.String("collection_name", collectionName),
		zap.Int("page", page),
		zap.Int("per_page", perPage),
	)

	offset := (page - 1) * perPage

	// Build query with optional collection filter (case-insensitive model_type)
	whereClause := "WHERE LOWER(model_type) = LOWER($1) AND model_id = $2"
	args := []interface{}{modelType, modelID}
	argCount := 2

	if collectionName != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND collection_name = $%d", argCount)
		args = append(args, collectionName)
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM media %s", whereClause)
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count media: %w", err)
	}

	// Get paginated results
	argCount++
	limitArg := argCount
	argCount++
	offsetArg := argCount
	query := fmt.Sprintf(`
		SELECT id, model_type, model_id, uuid, collection_name, name, file_name,
		       mime_type, disk, conversions_disk, size, manipulations,
		       custom_properties, generated_conversions, responsive_images,
		       order_column, created_at, updated_at
		FROM media
		%s
		ORDER BY order_column ASC NULLS LAST, created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, limitArg, offsetArg)

	args = append(args, perPage, offset)

	logger.Debug("Executing select query",
		zap.String("query", query),
		zap.Any("args", args),
	)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		logger.Error("Failed to query media", zap.Error(err))
		return nil, 0, fmt.Errorf("failed to get media by model: %w", err)
	}
	defer rows.Close()

	var mediaList []*domain.Media
	for rows.Next() {
		media := &domain.Media{}
		var manipulationsJSON, customPropertiesJSON, generatedConversionsJSON, responsiveImagesJSON []byte

		err := rows.Scan(
			&media.ID,
			&media.ModelType,
			&media.ModelID,
			&media.UUID,
			&media.CollectionName,
			&media.Name,
			&media.FileName,
			&media.MimeType,
			&media.Disk,
			&media.ConversionsDisk,
			&media.Size,
			&manipulationsJSON,
			&customPropertiesJSON,
			&generatedConversionsJSON,
			&responsiveImagesJSON,
			&media.OrderColumn,
			&media.CreatedAt,
			&media.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan media: %w", err)
		}

		// Unmarshal JSON fields
		json.Unmarshal(manipulationsJSON, &media.Manipulations)
		json.Unmarshal(customPropertiesJSON, &media.CustomProperties)
		json.Unmarshal(generatedConversionsJSON, &media.GeneratedConversions)
		json.Unmarshal(responsiveImagesJSON, &media.ResponsiveImages)

		mediaList = append(mediaList, media)
	}

	return mediaList, total, nil
}

func (r *MediaRepository) HardDelete(ctx context.Context, id int64) error {
	// First get the media record to know the MinIO object path
	media, err := r.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get media for deletion: %w", err)
	}
	if media == nil {
		return fmt.Errorf("media not found")
	}

	// Delete from MinIO first
	err = r.minio.RemoveObject(ctx, r.bucketName, media.Disk, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete from MinIO: %w", err)
	}

	// Delete from database
	query := `DELETE FROM media WHERE id = $1`
	_, err = r.db.Exec(ctx, query, id)
	if err != nil {
		// Log error but don't fail - file is already gone from MinIO
		logger.Error("Failed to delete media from database after MinIO deletion",
			zap.Int64("media_id", id),
			zap.String("object_path", media.Disk),
			zap.Error(err))
		return fmt.Errorf("failed to delete media from database: %w", err)
	}

	return nil
}

func (r *MediaRepository) GetPresignedURL(ctx context.Context, media *domain.Media, expirySeconds int) (string, int64, error) {
	// Generate pre-signed URL with expiry
	expiry := time.Duration(expirySeconds) * time.Second

	url, err := r.minio.PresignedGetObject(ctx, r.bucketName, media.Disk, expiry, nil)
	if err != nil {
		return "", 0, fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	expiresAt := time.Now().Add(expiry).Unix()

	return url.String(), expiresAt, nil
}

func (r *MediaRepository) GetAll(ctx context.Context, page, perPage int, modelType, collectionName string) ([]*domain.Media, int64, error) {
	offset := (page - 1) * perPage

	// Build query with optional filters
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argCount := 0

	if modelType != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND model_type = $%d", argCount)
		args = append(args, modelType)
	}

	if collectionName != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND collection_name = $%d", argCount)
		args = append(args, collectionName)
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM media %s", whereClause)
	var total int64
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count media: %w", err)
	}

	// Get paginated results
	argCount++
	limitArg := argCount
	argCount++
	offsetArg := argCount
	query := fmt.Sprintf(`
		SELECT id, model_type, model_id, uuid, collection_name, name, file_name,
		       mime_type, disk, conversions_disk, size, manipulations,
		       custom_properties, generated_conversions, responsive_images,
		       order_column, created_at, updated_at
		FROM media
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, limitArg, offsetArg)

	args = append(args, perPage, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get all media: %w", err)
	}
	defer rows.Close()

	var mediaList []*domain.Media
	for rows.Next() {
		media := &domain.Media{}
		var manipulationsJSON, customPropertiesJSON, generatedConversionsJSON, responsiveImagesJSON []byte

		err := rows.Scan(
			&media.ID,
			&media.ModelType,
			&media.ModelID,
			&media.UUID,
			&media.CollectionName,
			&media.Name,
			&media.FileName,
			&media.MimeType,
			&media.Disk,
			&media.ConversionsDisk,
			&media.Size,
			&manipulationsJSON,
			&customPropertiesJSON,
			&generatedConversionsJSON,
			&responsiveImagesJSON,
			&media.OrderColumn,
			&media.CreatedAt,
			&media.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan media: %w", err)
		}

		// Unmarshal JSON fields
		json.Unmarshal(manipulationsJSON, &media.Manipulations)
		json.Unmarshal(customPropertiesJSON, &media.CustomProperties)
		json.Unmarshal(generatedConversionsJSON, &media.GeneratedConversions)
		json.Unmarshal(responsiveImagesJSON, &media.ResponsiveImages)

		mediaList = append(mediaList, media)
	}

	return mediaList, total, nil
}

// GeneratePresignedURL generates a pre-signed URL for accessing media from MinIO
func (r *MediaRepository) GeneratePresignedURL(ctx context.Context, modelType string, modelID int64, uuid, fileName string, expirySeconds int) (string, error) {
	// Must match upload path: {model_type}/{model_id}/{uuid}/{file_name}
	objectPath := fmt.Sprintf("%s/%d/%s/%s", modelType, modelID, uuid, fileName)

	expiry := time.Duration(expirySeconds) * time.Second
	if expiry == 0 {
		expiry = 15 * time.Minute // Default 15 minutes
	}

	presignedURL, err := r.minio.PresignedGetObject(ctx, r.bucketName, objectPath, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedURL.String(), nil
}
