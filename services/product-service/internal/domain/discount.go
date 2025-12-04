package domain

import (
	"context"
	"time"
)

type Discount struct {
	ID                             int64      `json:"id"`
	Name                           string     `json:"name"`
	Type                           string     `json:"type"`
	Amount                         float64    `json:"amount"`
	IsActive                       bool       `json:"is_active"`
	Description                    *string    `json:"description"`
	ValidUntil                     *time.Time `json:"valid_until"`
	ActionType                     *string    `json:"action_type"`
	MaxRedemptions                 *int32     `json:"max_redemptions"`
	MaxRedemptionsPerUser          *int32     `json:"max_redemptions_per_user"`
	Redemptions                    int32      `json:"redemptions"`
	IsRecurring                    bool       `json:"is_recurring"`
	DurationInMonths               *int32     `json:"duration_in_months"`
	MaximumRecurringIntervals      *int32     `json:"maximum_recurring_intervals"`
	RedeemType                     *int32     `json:"redeem_type"`
	BonusDays                      *int32     `json:"bonus_days"`
	IsEnabledForAllPlans           bool       `json:"is_enabled_for_all_plans"`
	IsEnabledForAllOneTimeProducts bool       `json:"is_enabled_for_all_one_time_products"`
	CreatedAt                      time.Time  `json:"created_at"`
	UpdatedAt                      time.Time  `json:"updated_at"`
}

type DiscountRepository interface {
	GetByID(ctx context.Context, id int64) (*Discount, error)
	Create(ctx context.Context, discount *Discount) error
	Update(ctx context.Context, discount *Discount) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int, activeOnly bool) ([]*Discount, int, error)
}

type DiscountService interface {
	GetByID(ctx context.Context, id int64) (*Discount, error)
	Create(ctx context.Context, discount *Discount) error
	Update(ctx context.Context, discount *Discount) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int, activeOnly bool) ([]*Discount, int, error)
}
