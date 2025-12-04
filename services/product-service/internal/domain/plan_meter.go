package domain

import (
	"context"
	"time"
)

type PlanMeter struct {
	ID        int64
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type PlanMeterRepository interface {
	GetByID(ctx context.Context, id int64) (*PlanMeter, error)
	Create(ctx context.Context, meter *PlanMeter) error
	Update(ctx context.Context, meter *PlanMeter) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int) ([]*PlanMeter, int, error)
}

type PlanMeterService interface {
	GetByID(ctx context.Context, id int64) (*PlanMeter, error)
	Create(ctx context.Context, meter *PlanMeter) error
	Update(ctx context.Context, meter *PlanMeter) error
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int) ([]*PlanMeter, int, error)
}
