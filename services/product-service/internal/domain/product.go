package domain

import (
	"context"
	"time"
)

type Product struct {
	ID          int64
	Name        string
	Slug        string
	Description string
	Metadata    map[string]interface{} // JSON object
	Features    map[string]interface{} // JSON object
	IsPopular   bool
	IsDefault   bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type ProductRepository interface {
	GetByID(ctx context.Context, id int64) (*Product, error)
	GetBySlug(ctx context.Context, slug string) (*Product, error)
	Create(ctx context.Context, product *Product) error
	Update(ctx context.Context, product *Product) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int) ([]*Product, int, error)
}

type ProductService interface {
	GetByID(ctx context.Context, id int64) (*Product, error)
	GetBySlug(ctx context.Context, slug string) (*Product, error)
	Create(ctx context.Context, product *Product) error
	Update(ctx context.Context, product *Product) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int) ([]*Product, int, error)
}
