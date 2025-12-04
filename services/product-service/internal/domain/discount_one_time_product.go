package domain

import (
	"context"
	"time"
)

type DiscountOneTimeProduct struct {
	ID         int64     `json:"id"`
	DiscountID int64     `json:"discount_id"`
	ProductID  int64     `json:"product_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type DiscountOneTimeProductRepository interface {
	GetByDiscount(ctx context.Context, discountID int64) ([]*DiscountOneTimeProduct, error)
	GetByProduct(ctx context.Context, productID int64) ([]*DiscountOneTimeProduct, error)
	Create(ctx context.Context, dotp *DiscountOneTimeProduct) error
	Delete(ctx context.Context, id int64) error
	DeleteByDiscount(ctx context.Context, discountID int64) error
	DeleteByProduct(ctx context.Context, productID int64) error
}

type DiscountOneTimeProductService interface {
	GetByDiscount(ctx context.Context, discountID int64) ([]*DiscountOneTimeProduct, error)
	GetByProduct(ctx context.Context, productID int64) ([]*DiscountOneTimeProduct, error)
	AddProductToDiscount(ctx context.Context, discountID, productID int64) error
	RemoveProductFromDiscount(ctx context.Context, discountID, productID int64) error
	AssignProductsToDiscount(ctx context.Context, discountID int64, productIDs []int64) error
}
