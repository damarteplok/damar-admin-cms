package grpc

import (
	"context"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/services/content-service/pkg/types"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/content"
	"github.com/damarteplok/damar-admin-cms/shared/validation"
)

type CategoryGRPCServer struct {
	service domain.CategoryService
	pb.UnimplementedContentServiceServer
}

func NewCategoryGRPCServer(service domain.CategoryService) *CategoryGRPCServer {
	return &CategoryGRPCServer{service: service}
}

func (s *CategoryGRPCServer) GetCategoryByID(ctx context.Context, req *pb.GetCategoryByIDRequest) (*pb.GetCategoryByIDResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.GetCategoryByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	category, err := s.service.GetCategoryByID(ctx, req.Id)
	if err != nil {
		return &pb.GetCategoryByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetCategoryByIDResponse{
		Success: true,
		Message: "Category retrieved successfully",
		Data:    domainCategoryToPb(category),
	}, nil
}

func (s *CategoryGRPCServer) GetCategoryBySlug(ctx context.Context, req *pb.GetCategoryBySlugRequest) (*pb.GetCategoryBySlugResponse, error) {
	if err := validation.ValidateStruct(&types.SlugValidation{Slug: req.Slug}); err != nil {
		return &pb.GetCategoryBySlugResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	category, err := s.service.GetCategoryBySlug(ctx, req.Slug)
	if err != nil {
		return &pb.GetCategoryBySlugResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetCategoryBySlugResponse{
		Success: true,
		Message: "Category retrieved successfully",
		Data:    domainCategoryToPb(category),
	}, nil
}

func (s *CategoryGRPCServer) GetAllCategories(ctx context.Context, req *pb.GetAllCategoriesRequest) (*pb.GetAllCategoriesResponse, error) {
	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 10
	}

	categories, total, err := s.service.GetAllCategories(ctx, int(page), int(perPage), req.Search, req.SortBy, req.SortOrder)
	if err != nil {
		return &pb.GetAllCategoriesResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbCategories := make([]*pb.Category, len(categories))
	for i, category := range categories {
		pbCategories[i] = domainCategoryToPb(category)
	}

	return &pb.GetAllCategoriesResponse{
		Success: true,
		Message: "Categories retrieved successfully",
		Data: &pb.GetAllCategoriesData{
			Categories: pbCategories,
			Total:      int32(total),
			Page:       page,
			PerPage:    perPage,
		},
	}, nil
}

func (s *CategoryGRPCServer) CreateCategory(ctx context.Context, req *pb.CreateCategoryRequest) (*pb.CreateCategoryResponse, error) {
	if err := validation.ValidateStruct(&types.CreateCategoryValidation{
		Name: req.Name,
		Slug: req.Slug,
	}); err != nil {
		return &pb.CreateCategoryResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	category := &domain.Category{
		Name: req.Name,
		Slug: req.Slug,
	}

	createdCategory, err := s.service.CreateCategory(ctx, category)
	if err != nil {
		return &pb.CreateCategoryResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateCategoryResponse{
		Success: true,
		Message: "Category created successfully",
		Data:    domainCategoryToPb(createdCategory),
	}, nil
}

func (s *CategoryGRPCServer) UpdateCategory(ctx context.Context, req *pb.UpdateCategoryRequest) (*pb.UpdateCategoryResponse, error) {
	if err := validation.ValidateStruct(&types.UpdateCategoryValidation{
		ID:   req.Id,
		Name: req.Name,
		Slug: req.Slug,
	}); err != nil {
		return &pb.UpdateCategoryResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	category := &domain.Category{
		ID:   req.Id,
		Name: req.Name,
		Slug: req.Slug,
	}

	updatedCategory, err := s.service.UpdateCategory(ctx, category)
	if err != nil {
		return &pb.UpdateCategoryResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateCategoryResponse{
		Success: true,
		Message: "Category updated successfully",
		Data:    domainCategoryToPb(updatedCategory),
	}, nil
}

func (s *CategoryGRPCServer) DeleteCategory(ctx context.Context, req *pb.DeleteCategoryRequest) (*pb.DeleteCategoryResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.DeleteCategoryResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	err := s.service.DeleteCategory(ctx, req.Id)
	if err != nil {
		return &pb.DeleteCategoryResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteCategoryResponse{
		Success: true,
		Message: "Category deleted successfully",
	}, nil
}

// Helper function to convert domain model to protobuf
func domainCategoryToPb(category *domain.Category) *pb.Category {
	if category == nil {
		return nil
	}

	pbCategory := &pb.Category{
		Id:   category.ID,
		Name: category.Name,
		Slug: category.Slug,
	}

	if category.CreatedAt != nil {
		pbCategory.CreatedAt = category.CreatedAt.Unix()
	}

	if category.UpdatedAt != nil {
		pbCategory.UpdatedAt = category.UpdatedAt.Unix()
	}

	return pbCategory
}
