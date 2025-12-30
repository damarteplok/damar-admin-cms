package service

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/damarteplok/damar-admin-cms/services/content-service/internal/domain"
)

type CategoryService struct {
	repo domain.CategoryRepository
}

func NewCategoryService(repo domain.CategoryRepository) domain.CategoryService {
	return &CategoryService{
		repo: repo,
	}
}

func (s *CategoryService) GetCategoryByID(ctx context.Context, id int64) (*domain.Category, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *CategoryService) GetCategoryBySlug(ctx context.Context, slug string) (*domain.Category, error) {
	return s.repo.GetBySlug(ctx, slug)
}

func (s *CategoryService) GetAllCategories(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*domain.Category, int64, error) {
	// Set defaults
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}

	return s.repo.GetAll(ctx, page, perPage, search, sortBy, sortOrder)
}

func (s *CategoryService) CreateCategory(ctx context.Context, category *domain.Category) (*domain.Category, error) {
	// Business validation: Generate slug if not provided
	if category.Slug == "" {
		category.Slug = generateCategorySlug(category.Name)
	}

	// Business validation: Check if slug already exists
	exists, err := s.repo.SlugExists(ctx, category.Slug, nil)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("slug already exists")
	}

	// Validate slug format
	if !isValidCategorySlug(category.Slug) {
		return nil, errors.New("invalid slug format: must contain only lowercase letters, numbers, and hyphens")
	}

	return s.repo.Create(ctx, category)
}

func (s *CategoryService) UpdateCategory(ctx context.Context, category *domain.Category) (*domain.Category, error) {
	// Business validation: Check if category exists
	existing, err := s.repo.GetByID(ctx, category.ID)
	if err != nil {
		return nil, fmt.Errorf("category not found: %w", err)
	}
	if existing == nil {
		return nil, errors.New("category not found")
	}

	// Business validation: Check slug uniqueness if changed
	if category.Slug != existing.Slug {
		exists, err := s.repo.SlugExists(ctx, category.Slug, &category.ID)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, errors.New("slug already exists")
		}

		// Validate slug format
		if !isValidCategorySlug(category.Slug) {
			return nil, errors.New("invalid slug format: must contain only lowercase letters, numbers, and hyphens")
		}
	}

	return s.repo.Update(ctx, category)
}

func (s *CategoryService) DeleteCategory(ctx context.Context, id int64) error {
	// Business validation: Check if category exists
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("category not found: %w", err)
	}
	if existing == nil {
		return errors.New("category not found")
	}

	// Repository will check if category is in use by blog posts
	return s.repo.Delete(ctx, id)
}

// Helper functions

func generateCategorySlug(name string) string {
	// Convert to lowercase
	slug := strings.ToLower(name)

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

func isValidCategorySlug(slug string) bool {
	// Slug must contain only lowercase letters, numbers, and hyphens
	// Must not start or end with hyphen
	// Must not have consecutive hyphens
	match, _ := regexp.MatchString(`^[a-z0-9]+(-[a-z0-9]+)*$`, slug)
	return match
}
