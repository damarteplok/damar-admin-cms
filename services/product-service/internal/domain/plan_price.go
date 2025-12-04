package domain

import (
	"context"
	"time"
)

type PlanPrice struct {
	ID           int64
	PlanID       int64
	CurrencyID   int64
	Price        int32
	PricePerUnit int32
	Type         string                 // flat_rate, per_unit, tiered
	Tiers        map[string]interface{} // JSON object for tiered pricing
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type PlanPriceRepository interface {
	GetByID(ctx context.Context, id int64) (*PlanPrice, error)
	GetByPlan(ctx context.Context, planID int64) ([]*PlanPrice, error)
	Create(ctx context.Context, planPrice *PlanPrice) error
	Update(ctx context.Context, planPrice *PlanPrice) error
	Delete(ctx context.Context, id int64) error
}

type PlanPriceService interface {
	GetByID(ctx context.Context, id int64) (*PlanPrice, error)
	GetByPlan(ctx context.Context, planID int64) ([]*PlanPrice, error)
	Create(ctx context.Context, planPrice *PlanPrice) error
	Update(ctx context.Context, planPrice *PlanPrice) error
	Delete(ctx context.Context, id int64) error
}
