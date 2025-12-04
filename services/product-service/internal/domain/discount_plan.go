package domain

import (
	"context"
	"time"
)

type DiscountPlan struct {
	ID         int64     `json:"id"`
	DiscountID int64     `json:"discount_id"`
	PlanID     int64     `json:"plan_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type DiscountPlanRepository interface {
	GetByDiscount(ctx context.Context, discountID int64) ([]*DiscountPlan, error)
	GetByPlan(ctx context.Context, planID int64) ([]*DiscountPlan, error)
	Create(ctx context.Context, dp *DiscountPlan) error
	Delete(ctx context.Context, id int64) error
	DeleteByDiscount(ctx context.Context, discountID int64) error
	DeleteByPlan(ctx context.Context, planID int64) error
}

type DiscountPlanService interface {
	GetByDiscount(ctx context.Context, discountID int64) ([]*DiscountPlan, error)
	GetByPlan(ctx context.Context, planID int64) ([]*DiscountPlan, error)
	AddPlanToDiscount(ctx context.Context, discountID, planID int64) error
	RemovePlanFromDiscount(ctx context.Context, discountID, planID int64) error
	AssignPlansToDiscount(ctx context.Context, discountID int64, planIDs []int64) error
}
