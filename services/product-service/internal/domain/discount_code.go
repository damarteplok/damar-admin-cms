package domain

import (
	"context"
	"time"
)

// DiscountCode represents discount_codes table
type DiscountCode struct {
	ID         int64      `json:"id"`
	DiscountID int64      `json:"discount_id"`
	Code       string     `json:"code"`
	ValidFrom  *time.Time `json:"valid_from"`
	ValidUntil *time.Time `json:"valid_until"`
	MaxUses    *int32     `json:"max_uses"`
	TimesUsed  int32      `json:"times_used"`
	IsActive   bool       `json:"is_active"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// DiscountCodeRepository defines data access operations for discount codes
type DiscountCodeRepository interface {
	GetByID(ctx context.Context, id int64) (*DiscountCode, error)
	GetByCode(ctx context.Context, code string) (*DiscountCode, error)
	GetByDiscount(ctx context.Context, discountID int64) ([]*DiscountCode, error)
	Create(ctx context.Context, code *DiscountCode) error
	Update(ctx context.Context, code *DiscountCode) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int, activeOnly bool) ([]*DiscountCode, int, error)
	IncrementUsage(ctx context.Context, id int64) error
}

// DiscountCodeService defines business logic operations for discount codes
type DiscountCodeService interface {
	GetByID(ctx context.Context, id int64) (*DiscountCode, error)
	GetByCode(ctx context.Context, code string) (*DiscountCode, error)
	GetByDiscount(ctx context.Context, discountID int64) ([]*DiscountCode, error)
	Create(ctx context.Context, code *DiscountCode) error
	Update(ctx context.Context, code *DiscountCode) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int, activeOnly bool) ([]*DiscountCode, int, error)
	ValidateCode(ctx context.Context, code string) (bool, string, error)
}
