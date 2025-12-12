package domain

import (
	"context"
	"io"
	"time"
)

// Media represents a media file entity
type Media struct {
	ID                   int64
	ModelType            string
	ModelID              int64
	UUID                 string
	CollectionName       string
	Name                 string
	FileName             string
	MimeType             *string
	Disk                 string
	ConversionsDisk      *string
	Size                 int64
	Manipulations        map[string]interface{}
	CustomProperties     map[string]interface{}
	GeneratedConversions map[string]interface{}
	ResponsiveImages     map[string]interface{}
	OrderColumn          *int32
	CreatedAt            *time.Time
	UpdatedAt            *time.Time
}

// UploadRequest represents a file upload request
type UploadRequest struct {
	Content        io.Reader
	FileName       string
	MimeType       string
	Size           int64
	ModelType      string
	ModelID        int64
	CollectionName string
	Name           string
	Disk           string
}

// MediaRepository defines the interface for media data access
type MediaRepository interface {
	Upload(ctx context.Context, media *Media, content io.Reader) (*Media, error)
	GetByID(ctx context.Context, id int64) (*Media, error)
	GetByUUID(ctx context.Context, uuid string) (*Media, error)
	GetByModel(ctx context.Context, modelType string, modelID int64, collectionName string, page, perPage int) ([]*Media, int64, error)
	HardDelete(ctx context.Context, id int64) error
	GetPresignedURL(ctx context.Context, media *Media, expirySeconds int) (string, int64, error)
	GetAll(ctx context.Context, page, perPage int, modelType, collectionName string) ([]*Media, int64, error)
	GeneratePresignedURL(ctx context.Context, modelType string, modelID int64, uuid, fileName string, expirySeconds int) (string, error)
}

// MediaService defines business logic for media
type MediaService interface {
	UploadFile(ctx context.Context, req *UploadRequest) (*Media, error)
	GetFileByID(ctx context.Context, id int64) (*Media, error)
	GetFileByUUID(ctx context.Context, uuid string) (*Media, error)
	GetFilesByModel(ctx context.Context, modelType string, modelID int64, collectionName string, page, perPage int) ([]*Media, int64, error)
	DeleteFile(ctx context.Context, id int64) error
	GetFileURL(ctx context.Context, id int64, expirySeconds int) (string, int64, error)
	GetAllMedia(ctx context.Context, page, perPage int, modelType, collectionName string) ([]*Media, int64, error)
	GeneratePresignedURL(ctx context.Context, modelType string, modelID int64, uuid, fileName string, expirySeconds int) (string, error)
}
