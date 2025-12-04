package domain

import (
	"context"
	"time"
)

type Plan struct {
	ID                 int64
	Name               string
	Slug               string
	IntervalID         int64
	ProductID          int64
	IsActive           bool
	HasTrial           bool
	TrialIntervalID    *int64 // nullable
	IntervalCount      int32
	TrialIntervalCount int32
	Description        string
	Type               string // flat_rate, per_unit, tiered
	MaxUsersPerTenant  int32
	MeterID            *int64 // nullable
	IsVisible          bool
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

type PlanRepository interface {
	GetByID(ctx context.Context, id int64) (*Plan, error)
	GetBySlug(ctx context.Context, slug string) (*Plan, error)
	GetByProduct(ctx context.Context, productID int64) ([]*Plan, error)
	Create(ctx context.Context, plan *Plan) error
	Update(ctx context.Context, plan *Plan) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int, activeOnly, visibleOnly bool) ([]*Plan, int, error)
}

type PlanService interface {
	GetByID(ctx context.Context, id int64) (*Plan, error)
	GetBySlug(ctx context.Context, slug string) (*Plan, error)
	GetByProduct(ctx context.Context, productID int64) ([]*Plan, error)
	Create(ctx context.Context, plan *Plan) error
	Update(ctx context.Context, plan *Plan) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int, activeOnly, visibleOnly bool) ([]*Plan, int, error)
}
