package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type planPriceService struct {
	repo     domain.PlanPriceRepository
	planRepo domain.PlanRepository
}

func NewPlanPriceService(repo domain.PlanPriceRepository, planRepo domain.PlanRepository) domain.PlanPriceService {
	return &planPriceService{
		repo:     repo,
		planRepo: planRepo,
	}
}

func (s *planPriceService) GetByID(ctx context.Context, id int64) (*domain.PlanPrice, error) {
	if id <= 0 {
		return nil, errors.New("invalid plan price ID")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *planPriceService) GetByPlan(ctx context.Context, planID int64) ([]*domain.PlanPrice, error) {
	if planID <= 0 {
		return nil, errors.New("invalid plan ID")
	}

	plan, err := s.planRepo.GetByID(ctx, planID)
	if err != nil {
		return nil, err
	}
	if plan == nil {
		return nil, errors.New("plan not found")
	}

	return s.repo.GetByPlan(ctx, planID)
}

func (s *planPriceService) Create(ctx context.Context, planPrice *domain.PlanPrice) error {
	if planPrice == nil {
		return errors.New("plan price cannot be nil")
	}
	if planPrice.PlanID <= 0 {
		return errors.New("plan ID is required")
	}
	if planPrice.CurrencyID <= 0 {
		return errors.New("currency ID is required")
	}

	plan, err := s.planRepo.GetByID(ctx, planPrice.PlanID)
	if err != nil {
		return err
	}
	if plan == nil {
		return errors.New("plan not found")
	}

	return s.repo.Create(ctx, planPrice)
}

func (s *planPriceService) Update(ctx context.Context, planPrice *domain.PlanPrice) error {
	if planPrice == nil {
		return errors.New("plan price cannot be nil")
	}
	if planPrice.ID <= 0 {
		return errors.New("invalid plan price ID")
	}

	existing, err := s.repo.GetByID(ctx, planPrice.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("plan price not found")
	}

	return s.repo.Update(ctx, planPrice)
}

func (s *planPriceService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid plan price ID")
	}

	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("plan price not found")
	}

	return s.repo.Delete(ctx, id)
}
