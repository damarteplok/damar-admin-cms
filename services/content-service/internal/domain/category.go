package domain

import (
	"context"
	"time"
)

// Category represents a blog post category entity
type Category struct {
	ID        int64
	Name      string
	Slug      string
	CreatedAt *time.Time
	UpdatedAt *time.Time
}

// CategoryRepository defines the interface for category data access
type CategoryRepository interface {
	GetByID(ctx context.Context, id int64) (*Category, error)
	GetBySlug(ctx context.Context, slug string) (*Category, error)
	GetAll(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*Category, int64, error)
	Create(ctx context.Context, category *Category) (*Category, error)
	Update(ctx context.Context, category *Category) (*Category, error)
	Delete(ctx context.Context, id int64) error
	SlugExists(ctx context.Context, slug string, excludeID *int64) (bool, error)
}

// CategoryService defines business logic for categories
type CategoryService interface {
	GetCategoryByID(ctx context.Context, id int64) (*Category, error)
	GetCategoryBySlug(ctx context.Context, slug string) (*Category, error)
	GetAllCategories(ctx context.Context, page, perPage int, search, sortBy, sortOrder string) ([]*Category, int64, error)
	CreateCategory(ctx context.Context, category *Category) (*Category, error)
	UpdateCategory(ctx context.Context, category *Category) (*Category, error)
	DeleteCategory(ctx context.Context, id int64) error
}
