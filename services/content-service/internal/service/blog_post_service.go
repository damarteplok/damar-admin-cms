package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/contracts"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"go.uber.org/zap"
)

type BlogPostService struct {
	repo      domain.BlogPostRepository
	publisher *amqp.Publisher
}

func NewBlogPostService(repo domain.BlogPostRepository, publisher *amqp.Publisher) domain.BlogPostService {
	return &BlogPostService{
		repo:      repo,
		publisher: publisher,
	}
}

func (s *BlogPostService) GetBlogPostByID(ctx context.Context, id int64) (*domain.BlogPost, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *BlogPostService) GetBlogPostBySlug(ctx context.Context, slug string) (*domain.BlogPost, error) {
	return s.repo.GetBySlug(ctx, slug)
}

func (s *BlogPostService) GetAllBlogPosts(ctx context.Context, page, perPage int, search string, publishedOnly bool, categoryID *int64, sortBy, sortOrder string) ([]*domain.BlogPost, int64, error) {
	// Set defaults
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}

	return s.repo.GetAll(ctx, page, perPage, search, publishedOnly, categoryID, sortBy, sortOrder)
}

func (s *BlogPostService) CreateBlogPost(ctx context.Context, post *domain.BlogPost) (*domain.BlogPost, error) {
	// Business validation: Generate slug if not provided
	if post.Slug == "" {
		post.Slug = generateSlug(post.Title)
	}

	// Business validation: Check if slug already exists
	exists, err := s.repo.SlugExists(ctx, post.Slug, nil)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("slug already exists")
	}

	// Validate slug format
	if !isValidSlug(post.Slug) {
		return nil, errors.New("invalid slug format: must contain only lowercase letters, numbers, and hyphens")
	}

	// Create blog post
	createdPost, err := s.repo.Create(ctx, post)
	if err != nil {
		return nil, err
	}

	// Publish content.event.draft_created event
	if s.publisher != nil {
		s.publishEvent(ctx, contracts.ContentEventDraftCreated, createdPost)
	}

	return createdPost, nil
}

func (s *BlogPostService) UpdateBlogPost(ctx context.Context, post *domain.BlogPost) (*domain.BlogPost, error) {
	// Business validation: Check if post exists
	existing, err := s.repo.GetByID(ctx, post.ID)
	if err != nil {
		return nil, fmt.Errorf("blog post not found: %w", err)
	}
	if existing == nil {
		return nil, errors.New("blog post not found")
	}

	// Business validation: Check slug uniqueness if changed
	if post.Slug != existing.Slug {
		exists, err := s.repo.SlugExists(ctx, post.Slug, &post.ID)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, errors.New("slug already exists")
		}

		// Validate slug format
		if !isValidSlug(post.Slug) {
			return nil, errors.New("invalid slug format: must contain only lowercase letters, numbers, and hyphens")
		}
	}

	// Update blog post
	updatedPost, err := s.repo.Update(ctx, post)
	if err != nil {
		return nil, err
	}

	return updatedPost, nil
}

func (s *BlogPostService) DeleteBlogPost(ctx context.Context, id int64) error {
	// Business validation: Check if post exists
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("blog post not found: %w", err)
	}
	if existing == nil {
		return errors.New("blog post not found")
	}

	err = s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	// Publish content.event.deleted event
	if s.publisher != nil {
		s.publishEvent(ctx, contracts.ContentEventDeleted, existing)
	}

	return nil
}

func (s *BlogPostService) PublishBlogPost(ctx context.Context, id int64) (*domain.BlogPost, error) {
	// Business validation: Check if post exists
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("blog post not found: %w", err)
	}
	if existing == nil {
		return nil, errors.New("blog post not found")
	}

	// Business validation: Check if already published
	if existing.IsPublished {
		return nil, errors.New("blog post is already published")
	}

	// Publish the post
	publishedAt := time.Now()
	publishedPost, err := s.repo.Publish(ctx, id, publishedAt)
	if err != nil {
		return nil, err
	}

	// Publish content.event.published event
	if s.publisher != nil {
		s.publishEvent(ctx, contracts.ContentEventPublished, publishedPost)
	}

	return publishedPost, nil
}

func (s *BlogPostService) UnpublishBlogPost(ctx context.Context, id int64) (*domain.BlogPost, error) {
	// Business validation: Check if post exists
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("blog post not found: %w", err)
	}
	if existing == nil {
		return nil, errors.New("blog post not found")
	}

	// Business validation: Check if already unpublished
	if !existing.IsPublished {
		return nil, errors.New("blog post is not published")
	}

	// Unpublish the post
	unpublishedPost, err := s.repo.Unpublish(ctx, id)
	if err != nil {
		return nil, err
	}

	// Publish content.event.unpublished event
	if s.publisher != nil {
		s.publishEvent(ctx, contracts.ContentEventUnpublished, unpublishedPost)
	}

	return unpublishedPost, nil
}

func (s *BlogPostService) SearchBlogPosts(ctx context.Context, query string, page, perPage int, publishedOnly bool) ([]*domain.BlogPost, int64, error) {
	// Set defaults
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}

	if query == "" {
		return []*domain.BlogPost{}, 0, nil
	}

	return s.repo.Search(ctx, query, page, perPage, publishedOnly)
}

// Helper functions

func (s *BlogPostService) publishEvent(ctx context.Context, routingKey string, post *domain.BlogPost) {
	eventData := map[string]interface{}{
		"post_id":      post.ID,
		"title":        post.Title,
		"slug":         post.Slug,
		"is_published": post.IsPublished,
	}
	dataBytes, _ := json.Marshal(eventData)
	message := contracts.AmqpMessage{
		OwnerID: fmt.Sprintf("%d", post.ID),
		Data:    dataBytes,
	}

	if err := s.publisher.Publish(ctx, routingKey, message); err != nil {
		logger.Error("Failed to publish content event",
			zap.String("routing_key", routingKey),
			zap.Int64("post_id", post.ID),
			zap.Error(err))
	} else {
		logger.Info("Published content event",
			zap.String("routing_key", routingKey),
			zap.Int64("post_id", post.ID),
			zap.String("slug", post.Slug))
	}
}

func generateSlug(title string) string {
	// Convert to lowercase
	slug := strings.ToLower(title)

	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove special characters, keep only alphanumeric and hyphens
	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")

	// Remove consecutive hyphens
	reg = regexp.MustCompile("-+")
	slug = reg.ReplaceAllString(slug, "-")

	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")

	return slug
}

func isValidSlug(slug string) bool {
	// Slug must contain only lowercase letters, numbers, and hyphens
	// Must not start or end with hyphen
	// Must not have consecutive hyphens
	match, _ := regexp.MatchString(`^[a-z0-9]+(-[a-z0-9]+)*$`, slug)
	return match
}
