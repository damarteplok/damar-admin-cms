package grpc

import (
	"context"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/services/content-service/pkg/types"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/content"
	"github.com/damarteplok/damar-admin-cms/shared/validation"
)

type BlogPostGRPCServer struct {
	service domain.BlogPostService
	pb.UnimplementedContentServiceServer
}

func NewBlogPostGRPCServer(service domain.BlogPostService) *BlogPostGRPCServer {
	return &BlogPostGRPCServer{service: service}
}

func (s *BlogPostGRPCServer) GetBlogPostByID(ctx context.Context, req *pb.GetBlogPostByIDRequest) (*pb.GetBlogPostByIDResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.GetBlogPostByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	post, err := s.service.GetBlogPostByID(ctx, req.Id)
	if err != nil {
		return &pb.GetBlogPostByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetBlogPostByIDResponse{
		Success: true,
		Message: "Blog post retrieved successfully",
		Data:    domainBlogPostToPb(post),
	}, nil
}

func (s *BlogPostGRPCServer) GetBlogPostBySlug(ctx context.Context, req *pb.GetBlogPostBySlugRequest) (*pb.GetBlogPostBySlugResponse, error) {
	if err := validation.ValidateStruct(&types.SlugValidation{Slug: req.Slug}); err != nil {
		return &pb.GetBlogPostBySlugResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	post, err := s.service.GetBlogPostBySlug(ctx, req.Slug)
	if err != nil {
		return &pb.GetBlogPostBySlugResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetBlogPostBySlugResponse{
		Success: true,
		Message: "Blog post retrieved successfully",
		Data:    domainBlogPostToPb(post),
	}, nil
}

func (s *BlogPostGRPCServer) GetAllBlogPosts(ctx context.Context, req *pb.GetAllBlogPostsRequest) (*pb.GetAllBlogPostsResponse, error) {
	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 10
	}

	var categoryID *int64
	if req.CategoryId > 0 {
		categoryID = &req.CategoryId
	}

	posts, total, err := s.service.GetAllBlogPosts(ctx, int(page), int(perPage), req.Search, req.PublishedOnly, categoryID, req.SortBy, req.SortOrder)
	if err != nil {
		return &pb.GetAllBlogPostsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPosts := make([]*pb.BlogPost, len(posts))
	for i, post := range posts {
		pbPosts[i] = domainBlogPostToPb(post)
	}

	return &pb.GetAllBlogPostsResponse{
		Success: true,
		Message: "Blog posts retrieved successfully",
		Data: &pb.GetAllBlogPostsData{
			BlogPosts: pbPosts,
			Total:     int32(total),
			Page:      page,
			PerPage:   perPage,
		},
	}, nil
}

func (s *BlogPostGRPCServer) CreateBlogPost(ctx context.Context, req *pb.CreateBlogPostRequest) (*pb.CreateBlogPostResponse, error) {
	if err := validation.ValidateStruct(&types.CreateBlogPostValidation{
		Title:       req.Title,
		Slug:        req.Slug,
		Body:        req.Body,
		Description: req.Description,
		UserID:      req.UserId,
	}); err != nil {
		return &pb.CreateBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	var authorID *int64
	if req.AuthorId > 0 {
		authorID = &req.AuthorId
	}

	var categoryID *int64
	if req.BlogPostCategoryId > 0 {
		categoryID = &req.BlogPostCategoryId
	}

	var description *string
	if req.Description != "" {
		description = &req.Description
	}

	var publishedAt *time.Time
	if req.PublishedAt > 0 {
		t := time.Unix(req.PublishedAt, 0)
		publishedAt = &t
	}

	post := &domain.BlogPost{
		Title:              req.Title,
		Slug:               req.Slug,
		Body:               req.Body,
		Description:        description,
		UserID:             req.UserId,
		AuthorID:           authorID,
		BlogPostCategoryID: categoryID,
		IsPublished:        req.IsPublished,
		PublishedAt:        publishedAt,
	}

	createdPost, err := s.service.CreateBlogPost(ctx, post)
	if err != nil {
		return &pb.CreateBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateBlogPostResponse{
		Success: true,
		Message: "Blog post created successfully",
		Data:    domainBlogPostToPb(createdPost),
	}, nil
}

func (s *BlogPostGRPCServer) UpdateBlogPost(ctx context.Context, req *pb.UpdateBlogPostRequest) (*pb.UpdateBlogPostResponse, error) {
	if err := validation.ValidateStruct(&types.UpdateBlogPostValidation{
		ID:          req.Id,
		Title:       req.Title,
		Slug:        req.Slug,
		Body:        req.Body,
		Description: req.Description,
	}); err != nil {
		return &pb.UpdateBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	var authorID *int64
	if req.AuthorId > 0 {
		authorID = &req.AuthorId
	}

	var categoryID *int64
	if req.BlogPostCategoryId > 0 {
		categoryID = &req.BlogPostCategoryId
	}

	var description *string
	if req.Description != "" {
		description = &req.Description
	}

	var publishedAt *time.Time
	if req.PublishedAt > 0 {
		t := time.Unix(req.PublishedAt, 0)
		publishedAt = &t
	}

	post := &domain.BlogPost{
		ID:                 req.Id,
		Title:              req.Title,
		Slug:               req.Slug,
		Body:               req.Body,
		Description:        description,
		AuthorID:           authorID,
		BlogPostCategoryID: categoryID,
		IsPublished:        req.IsPublished,
		PublishedAt:        publishedAt,
	}

	updatedPost, err := s.service.UpdateBlogPost(ctx, post)
	if err != nil {
		return &pb.UpdateBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateBlogPostResponse{
		Success: true,
		Message: "Blog post updated successfully",
		Data:    domainBlogPostToPb(updatedPost),
	}, nil
}

func (s *BlogPostGRPCServer) PublishBlogPost(ctx context.Context, req *pb.PublishBlogPostRequest) (*pb.PublishBlogPostResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.PublishBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	publishedPost, err := s.service.PublishBlogPost(ctx, req.Id)
	if err != nil {
		return &pb.PublishBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.PublishBlogPostResponse{
		Success: true,
		Message: "Blog post published successfully",
		Data:    domainBlogPostToPb(publishedPost),
	}, nil
}

func (s *BlogPostGRPCServer) UnpublishBlogPost(ctx context.Context, req *pb.UnpublishBlogPostRequest) (*pb.UnpublishBlogPostResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.UnpublishBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	unpublishedPost, err := s.service.UnpublishBlogPost(ctx, req.Id)
	if err != nil {
		return &pb.UnpublishBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UnpublishBlogPostResponse{
		Success: true,
		Message: "Blog post unpublished successfully",
		Data:    domainBlogPostToPb(unpublishedPost),
	}, nil
}

func (s *BlogPostGRPCServer) DeleteBlogPost(ctx context.Context, req *pb.DeleteBlogPostRequest) (*pb.DeleteBlogPostResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.DeleteBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	err := s.service.DeleteBlogPost(ctx, req.Id)
	if err != nil {
		return &pb.DeleteBlogPostResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteBlogPostResponse{
		Success: true,
		Message: "Blog post deleted successfully",
	}, nil
}

func (s *BlogPostGRPCServer) SearchBlogPosts(ctx context.Context, req *pb.SearchBlogPostsRequest) (*pb.SearchBlogPostsResponse, error) {
	if req.Query == "" {
		return &pb.SearchBlogPostsResponse{
			Success: true,
			Message: "No search query provided",
			Data: &pb.GetAllBlogPostsData{
				BlogPosts: []*pb.BlogPost{},
				Total:     0,
				Page:      1,
				PerPage:   10,
			},
		}, nil
	}

	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 10
	}

	posts, total, err := s.service.SearchBlogPosts(ctx, req.Query, int(page), int(perPage), req.PublishedOnly)
	if err != nil {
		return &pb.SearchBlogPostsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPosts := make([]*pb.BlogPost, len(posts))
	for i, post := range posts {
		pbPosts[i] = domainBlogPostToPb(post)
	}

	return &pb.SearchBlogPostsResponse{
		Success: true,
		Message: "Search completed successfully",
		Data: &pb.GetAllBlogPostsData{
			BlogPosts: pbPosts,
			Total:     int32(total),
			Page:      page,
			PerPage:   perPage,
		},
	}, nil
}

// Helper function to convert domain model to protobuf
func domainBlogPostToPb(post *domain.BlogPost) *pb.BlogPost {
	if post == nil {
		return nil
	}

	pbPost := &pb.BlogPost{
		Id:          post.ID,
		Title:       post.Title,
		Slug:        post.Slug,
		Body:        post.Body,
		IsPublished: post.IsPublished,
		UserId:      post.UserID,
	}

	if post.PublishedAt != nil {
		pbPost.PublishedAt = post.PublishedAt.Unix()
	}

	if post.AuthorID != nil {
		pbPost.AuthorId = *post.AuthorID
	}

	if post.BlogPostCategoryID != nil {
		pbPost.BlogPostCategoryId = *post.BlogPostCategoryID
	}

	if post.Description != nil {
		pbPost.Description = *post.Description
	}

	if post.CreatedAt != nil {
		pbPost.CreatedAt = post.CreatedAt.Unix()
	}

	if post.UpdatedAt != nil {
		pbPost.UpdatedAt = post.UpdatedAt.Unix()
	}

	return pbPost
}
