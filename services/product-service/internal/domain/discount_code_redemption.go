package domain

import (
	"context"
	"time"
)

type DiscountCodeRedemption struct {
	ID             int64     `json:"id"`
	DiscountCodeID int64     `json:"discount_code_id"`
	UserID         int64     `json:"user_id"`
	SubscriptionID *int64    `json:"subscription_id"`
	OrderID        *int64    `json:"order_id"`
	RedeemedAt     time.Time `json:"redeemed_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type DiscountCodeRedemptionRepository interface {
	GetByID(ctx context.Context, id int64) (*DiscountCodeRedemption, error)
	GetByDiscountCode(ctx context.Context, discountCodeID int64) ([]*DiscountCodeRedemption, error)
	GetByUser(ctx context.Context, userID int64) ([]*DiscountCodeRedemption, error)
	Create(ctx context.Context, redemption *DiscountCodeRedemption) error
	GetAll(ctx context.Context, page, perPage int) ([]*DiscountCodeRedemption, int, error)
}

type DiscountCodeRedemptionService interface {
	GetByID(ctx context.Context, id int64) (*DiscountCodeRedemption, error)
	GetByDiscountCode(ctx context.Context, discountCodeID int64) ([]*DiscountCodeRedemption, error)
	GetByUser(ctx context.Context, userID int64) ([]*DiscountCodeRedemption, error)
	RedeemCode(ctx context.Context, discountCodeID, userID int64, subscriptionID, orderID *int64) error
	GetAll(ctx context.Context, page, perPage int) ([]*DiscountCodeRedemption, int, error)
}
