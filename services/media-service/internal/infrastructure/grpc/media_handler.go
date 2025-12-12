package grpc

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/media-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/services/media-service/pkg/types"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/media"
	"github.com/damarteplok/damar-admin-cms/shared/validation"
)

type MediaGRPCServer struct {
	service domain.MediaService
	pb.UnimplementedMediaServiceServer
}

func NewMediaGRPCServer(service domain.MediaService) *MediaGRPCServer {
	return &MediaGRPCServer{service: service}
}

func (s *MediaGRPCServer) UploadFile(ctx context.Context, req *pb.UploadFileRequest) (*pb.UploadFileResponse, error) {
	// Validate request
	if err := validation.ValidateStruct(&types.UploadFileValidation{
		FileName:       req.FileName,
		MimeType:       req.MimeType,
		Size:           req.Size,
		ModelType:      req.ModelType,
		ModelID:        req.ModelId,
		CollectionName: req.CollectionName,
		Disk:           req.Disk,
	}); err != nil {
		return &pb.UploadFileResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	// Create upload request
	uploadReq := &domain.UploadRequest{
		Content:        bytes.NewReader(req.Content),
		FileName:       req.FileName,
		MimeType:       req.MimeType,
		Size:           req.Size,
		ModelType:      req.ModelType,
		ModelID:        req.ModelId,
		CollectionName: req.CollectionName,
		Name:           req.Name,
		Disk:           req.Disk,
	}

	// Upload file
	media, err := s.service.UploadFile(ctx, uploadReq)
	if err != nil {
		return &pb.UploadFileResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UploadFileResponse{
		Success: true,
		Message: "File uploaded successfully",
		Data:    domainMediaToPb(media),
	}, nil
}

func (s *MediaGRPCServer) GetFileByID(ctx context.Context, req *pb.GetFileByIDRequest) (*pb.GetFileByIDResponse, error) {
	// Validate request
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.GetFileByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	media, err := s.service.GetFileByID(ctx, req.Id)
	if err != nil {
		return &pb.GetFileByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}
	if media == nil {
		return &pb.GetFileByIDResponse{
			Success: false,
			Message: "File not found",
		}, nil
	}

	return &pb.GetFileByIDResponse{
		Success: true,
		Message: "File retrieved successfully",
		Data:    domainMediaToPb(media),
	}, nil
}

func (s *MediaGRPCServer) GetFileByUUID(ctx context.Context, req *pb.GetFileByUUIDRequest) (*pb.GetFileByUUIDResponse, error) {
	// Validate request
	if err := validation.ValidateStruct(&types.UUIDValidation{UUID: req.Uuid}); err != nil {
		return &pb.GetFileByUUIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	media, err := s.service.GetFileByUUID(ctx, req.Uuid)
	if err != nil {
		return &pb.GetFileByUUIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}
	if media == nil {
		return &pb.GetFileByUUIDResponse{
			Success: false,
			Message: "File not found",
		}, nil
	}

	return &pb.GetFileByUUIDResponse{
		Success: true,
		Message: "File retrieved successfully",
		Data:    domainMediaToPb(media),
	}, nil
}

func (s *MediaGRPCServer) GetFilesByModel(ctx context.Context, req *pb.GetFilesByModelRequest) (*pb.GetFilesByModelResponse, error) {
	// Validate request
	if err := validation.ValidateStruct(&types.GetFilesByModelValidation{
		ModelType: req.ModelType,
		ModelID:   req.ModelId,
	}); err != nil {
		return &pb.GetFilesByModelResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	if err := validation.ValidateStruct(&types.PaginationValidation{
		Page:    req.Page,
		PerPage: req.PerPage,
	}); err != nil {
		return &pb.GetFilesByModelResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	// Set defaults
	page := int(req.Page)
	perPage := int(req.PerPage)
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	mediaList, total, err := s.service.GetFilesByModel(ctx, req.ModelType, req.ModelId, req.CollectionName, page, perPage)
	if err != nil {
		return &pb.GetFilesByModelResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbMediaList := make([]*pb.Media, len(mediaList))
	for i, media := range mediaList {
		// Generate presigned URL for each media (24 hour expiry for avatars)
		presignedURL, err := s.service.GeneratePresignedURL(ctx, media.ModelType, media.ModelID, media.UUID, media.FileName, 86400)
		if err != nil {
			// Log error but don't fail the request
			presignedURL = ""
		}
		pbMediaList[i] = domainMediaToPbWithURL(media, presignedURL)
	}

	return &pb.GetFilesByModelResponse{
		Success: true,
		Message: fmt.Sprintf("Retrieved %d files", len(mediaList)),
		Data: &pb.GetFilesByModelData{
			Media:   pbMediaList,
			Total:   int32(total),
			Page:    int32(page),
			PerPage: int32(perPage),
		},
	}, nil
}

func (s *MediaGRPCServer) DeleteFile(ctx context.Context, req *pb.DeleteFileRequest) (*pb.DeleteFileResponse, error) {
	// Validate request
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.DeleteFileResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	err := s.service.DeleteFile(ctx, req.Id)
	if err != nil {
		return &pb.DeleteFileResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteFileResponse{
		Success: true,
		Message: "File deleted successfully",
	}, nil
}

func (s *MediaGRPCServer) GetFileURL(ctx context.Context, req *pb.GetFileURLRequest) (*pb.GetFileURLResponse, error) {
	// Validate request
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.GetFileURLResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	expirySeconds := int(req.ExpirySeconds)
	if expirySeconds <= 0 {
		expirySeconds = 900 // Default 15 minutes
	}

	url, expiresAt, err := s.service.GetFileURL(ctx, req.Id, expirySeconds)
	if err != nil {
		return &pb.GetFileURLResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetFileURLResponse{
		Success: true,
		Message: "URL generated successfully",
		Data: &pb.GetFileURLData{
			Url:       url,
			ExpiresAt: expiresAt,
		},
	}, nil
}

func (s *MediaGRPCServer) GetAllMedia(ctx context.Context, req *pb.GetAllMediaRequest) (*pb.GetAllMediaResponse, error) {
	// Validate pagination
	if err := validation.ValidateStruct(&types.PaginationValidation{
		Page:    req.Page,
		PerPage: req.PerPage,
	}); err != nil {
		return &pb.GetAllMediaResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	// Set defaults
	page := int(req.Page)
	perPage := int(req.PerPage)
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	mediaList, total, err := s.service.GetAllMedia(ctx, page, perPage, req.ModelType, req.CollectionName)
	if err != nil {
		return &pb.GetAllMediaResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbMediaList := make([]*pb.Media, len(mediaList))
	for i, media := range mediaList {
		pbMediaList[i] = domainMediaToPb(media)
	}

	return &pb.GetAllMediaResponse{
		Success: true,
		Message: fmt.Sprintf("Retrieved %d files", len(mediaList)),
		Data: &pb.GetAllMediaData{
			Media:   pbMediaList,
			Total:   int32(total),
			Page:    int32(page),
			PerPage: int32(perPage),
		},
	}, nil
}

// Helper function to convert domain.Media to pb.Media
func domainMediaToPb(media *domain.Media) *pb.Media {
	if media == nil {
		return nil
	}

	// Convert maps to JSON strings
	manipulations, _ := json.Marshal(media.Manipulations)
	customProperties, _ := json.Marshal(media.CustomProperties)
	generatedConversions, _ := json.Marshal(media.GeneratedConversions)
	responsiveImages, _ := json.Marshal(media.ResponsiveImages)

	mimeType := ""
	if media.MimeType != nil {
		mimeType = *media.MimeType
	}

	conversionsDisk := ""
	if media.ConversionsDisk != nil {
		conversionsDisk = *media.ConversionsDisk
	}

	orderColumn := int32(0)
	if media.OrderColumn != nil {
		orderColumn = *media.OrderColumn
	}

	createdAt := int64(0)
	if media.CreatedAt != nil {
		createdAt = media.CreatedAt.Unix()
	}

	updatedAt := int64(0)
	if media.UpdatedAt != nil {
		updatedAt = media.UpdatedAt.Unix()
	}

	return &pb.Media{
		Id:                   media.ID,
		ModelType:            media.ModelType,
		ModelId:              media.ModelID,
		Uuid:                 media.UUID,
		CollectionName:       media.CollectionName,
		Name:                 media.Name,
		FileName:             media.FileName,
		MimeType:             mimeType,
		Disk:                 media.Disk,
		ConversionsDisk:      conversionsDisk,
		Size:                 media.Size,
		Manipulations:        string(manipulations),
		CustomProperties:     string(customProperties),
		GeneratedConversions: string(generatedConversions),
		ResponsiveImages:     string(responsiveImages),
		OrderColumn:          orderColumn,
		CreatedAt:            createdAt,
		UpdatedAt:            updatedAt,
		PresignedUrl:         "",
	}
}

// domainMediaToPbWithURL converts domain media to protobuf with presigned URL
func domainMediaToPbWithURL(media *domain.Media, presignedURL string) *pb.Media {
	pbMedia := domainMediaToPb(media)
	if pbMedia != nil {
		pbMedia.PresignedUrl = presignedURL
	}
	return pbMedia
}
