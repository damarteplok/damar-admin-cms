package graph

import (
	"context"
	"fmt"
	"strconv"

	"github.com/damarteplok/damar-admin-cms/services/api-gateway/graph/model"
	contentPb "github.com/damarteplok/damar-admin-cms/shared/proto/content"
	mediaPb "github.com/damarteplok/damar-admin-cms/shared/proto/media"
	userPb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
	"github.com/damarteplok/damar-admin-cms/shared/util"
)

// Helper function to convert protobuf media to GraphQL model
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
		IsPublic: m.IsPublic,
		PublicURL: func() *string {
			if m.PublicUrl != "" {
				return &m.PublicUrl
			}
			return nil
		}(),
		URL:       &url,
		CreatedAt: int32(m.CreatedAt),
		UpdatedAt: int32(m.UpdatedAt),
	}
}

// ============================================================================
// BLOG HELPER FUNCTIONS
// ============================================================================

// convertPbBlogPostToModel converts protobuf BlogPost to GraphQL model
func convertPbBlogPostToModel(pb *contentPb.BlogPost) *model.BlogPost {
	blogPost := &model.BlogPost{
		ID:          fmt.Sprintf("%d", pb.Id),
		Title:       pb.Title,
		Slug:        pb.Slug,
		Body:        pb.Body,
		IsPublished: pb.IsPublished,
		UserID:      fmt.Sprintf("%d", pb.UserId),
		CreatedAt:   int32(pb.CreatedAt),
		UpdatedAt:   int32(pb.UpdatedAt),
	}

	if pb.PublishedAt > 0 {
		publishedAt := int32(pb.PublishedAt)
		blogPost.PublishedAt = &publishedAt
	}

	if pb.AuthorId > 0 {
		authorID := fmt.Sprintf("%d", pb.AuthorId)
		blogPost.AuthorID = &authorID
	}

	if pb.BlogPostCategoryId > 0 {
		categoryID := fmt.Sprintf("%d", pb.BlogPostCategoryId)
		blogPost.BlogPostCategoryID = &categoryID
	}

	if pb.Description != "" {
		blogPost.Description = &pb.Description
	}

	return blogPost
}

// convertPbCategoryToModel converts protobuf Category to GraphQL model
func convertPbCategoryToModel(pb *contentPb.Category) *model.Category {
	var description *string
	if pb.Description != "" {
		description = &pb.Description
	}

	return &model.Category{
		ID:          fmt.Sprintf("%d", pb.Id),
		Name:        pb.Name,
		Slug:        pb.Slug,
		Description: description,
		CreatedAt:   int32(pb.CreatedAt),
		UpdatedAt:   int32(pb.UpdatedAt),
	}
}

// pbAnnouncementToModel converts protobuf Announcement to GraphQL model
func pbAnnouncementToModel(pb *contentPb.Announcement) *model.Announcement {
	announcement := &model.Announcement{
		ID:                  fmt.Sprintf("%d", pb.Id),
		Title:               pb.Title,
		Content:             pb.Content,
		IsActive:            pb.IsActive,
		IsDismissible:       pb.IsDismissible,
		ShowForCustomers:    pb.ShowForCustomers,
		ShowOnFrontend:      pb.ShowOnFrontend,
		ShowOnUserDashboard: pb.ShowOnUserDashboard,
		CreatedAt:           int32(pb.CreatedAt),
		UpdatedAt:           int32(pb.UpdatedAt),
	}

	if pb.StartsAt > 0 {
		startsAt := int32(pb.StartsAt)
		announcement.StartsAt = &startsAt
	}

	if pb.EndsAt > 0 {
		endsAt := int32(pb.EndsAt)
		announcement.EndsAt = &endsAt
	}

	return announcement
}

// getUserByID fetches user by ID for blog post author
func (r *queryResolver) getUserByID(ctx context.Context, userID string) (*model.User, error) {
	id, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	userResp, err := r.UserClient.GetUserByID(ctx, &userPb.GetUserByIDRequest{
		Id: id,
	})
	if err != nil {
		return nil, err
	}

	if !userResp.Success {
		return nil, fmt.Errorf("failed to get user: %s", userResp.Message)
	}

	user := userResp.Data
	emailVerifiedAt := int32(user.EmailVerifiedAt)
	lastLoginAt := int32(user.LastLoginAt)
	createdAt := int32(user.CreatedAt)
	updatedAt := int32(user.UpdatedAt)

	return &model.User{
		ID:              fmt.Sprintf("%d", user.Id),
		Name:            user.Name,
		Email:           user.Email,
		PublicName:      &user.PublicName,
		IsAdmin:         user.IsAdmin,
		IsBlocked:       user.IsBlocked,
		PhoneNumber:     &user.PhoneNumber,
		Position:        &user.Position,
		EmailVerified:   user.EmailVerified,
		EmailVerifiedAt: &emailVerifiedAt,
		LastLoginAt:     &lastLoginAt,
		CreatedAt:       &createdAt,
		UpdatedAt:       &updatedAt,
	}, nil
}

// getCategoryByID fetches category by ID
func (r *queryResolver) getCategoryByID(ctx context.Context, categoryID string) (*model.Category, error) {
	id, err := strconv.ParseInt(categoryID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid category ID: %v", err)
	}

	resp, err := r.ContentClient.GetCategoryByID(ctx, &contentPb.GetCategoryByIDRequest{
		Id: id,
	})
	if err != nil {
		return nil, err
	}

	if !resp.Success {
		return nil, fmt.Errorf("failed to get category: %s", resp.Message)
	}

	return convertPbCategoryToModel(resp.Data), nil
}
