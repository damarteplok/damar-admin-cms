package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type planMeterService struct {
	repo domain.PlanMeterRepository
}

func NewPlanMeterService(repo domain.PlanMeterRepository) domain.PlanMeterService {
	return &planMeterService{repo: repo}
}

func (s *planMeterService) GetByID(ctx context.Context, id int64) (*domain.PlanMeter, error) {
	if id <= 0 {
		return nil, errors.New("invalid plan meter ID")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *planMeterService) Create(ctx context.Context, meter *domain.PlanMeter) error {
	if meter == nil {
		return errors.New("plan meter cannot be nil")
	}
	if meter.Name == "" {
		return errors.New("meter name is required")
	}
	return s.repo.Create(ctx, meter)
}

func (s *planMeterService) Update(ctx context.Context, meter *domain.PlanMeter) error {
	if meter == nil {
		return errors.New("plan meter cannot be nil")
	}
	if meter.ID <= 0 {
		return errors.New("invalid plan meter ID")
	}

	existing, err := s.repo.GetByID(ctx, meter.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("plan meter not found")
	}

	return s.repo.Update(ctx, meter)
}

func (s *planMeterService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid plan meter ID")
	}

	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("plan meter not found")
	}

	return s.repo.Delete(ctx, id)
}

func (s *planMeterService) GetAll(ctx context.Context, page, perPage int) ([]*domain.PlanMeter, int, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}
	if perPage > 100 {
		perPage = 100
	}
	return s.repo.GetAll(ctx, page, perPage)
}
