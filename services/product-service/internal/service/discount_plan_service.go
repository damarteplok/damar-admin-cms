package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type discountPlanService struct {
	repo         domain.DiscountPlanRepository
	discountRepo domain.DiscountRepository
	planRepo     domain.PlanRepository
}

func NewDiscountPlanService(
	repo domain.DiscountPlanRepository,
	discountRepo domain.DiscountRepository,
	planRepo domain.PlanRepository,
) domain.DiscountPlanService {
	return &discountPlanService{
		repo:         repo,
		discountRepo: discountRepo,
		planRepo:     planRepo,
	}
}

func (s *discountPlanService) GetByDiscount(ctx context.Context, discountID int64) ([]*domain.DiscountPlan, error) {
	if discountID <= 0 {
		return nil, errors.New("invalid discount ID")
	}
	return s.repo.GetByDiscount(ctx, discountID)
}

func (s *discountPlanService) GetByPlan(ctx context.Context, planID int64) ([]*domain.DiscountPlan, error) {
	if planID <= 0 {
		return nil, errors.New("invalid plan ID")
	}
	return s.repo.GetByPlan(ctx, planID)
}

func (s *discountPlanService) AddPlanToDiscount(ctx context.Context, discountID, planID int64) error {
	if discountID <= 0 {
		return errors.New("discount ID is required")
	}
	if planID <= 0 {
		return errors.New("plan ID is required")
	}

	// Verify discount exists
	_, err := s.discountRepo.GetByID(ctx, discountID)
	if err != nil {
		return errors.New("discount not found")
	}

	// Verify plan exists
	_, err = s.planRepo.GetByID(ctx, planID)
	if err != nil {
		return errors.New("plan not found")
	}

	dp := &domain.DiscountPlan{
		DiscountID: discountID,
		PlanID:     planID,
	}

	return s.repo.Create(ctx, dp)
}

func (s *discountPlanService) RemovePlanFromDiscount(ctx context.Context, discountID, planID int64) error {
	if discountID <= 0 {
		return errors.New("discount ID is required")
	}
	if planID <= 0 {
		return errors.New("plan ID is required")
	}

	// Get existing associations
	associations, err := s.repo.GetByDiscount(ctx, discountID)
	if err != nil {
		return err
	}

	// Find and delete the specific association
	for _, assoc := range associations {
		if assoc.PlanID == planID {
			return s.repo.Delete(ctx, assoc.ID)
		}
	}

	return errors.New("association not found")
}

func (s *discountPlanService) AssignPlansToDiscount(ctx context.Context, discountID int64, planIDs []int64) error {
	if discountID <= 0 {
		return errors.New("discount ID is required")
	}
	if len(planIDs) == 0 {
		return errors.New("at least one plan ID is required")
	}

	// Verify discount exists
	_, err := s.discountRepo.GetByID(ctx, discountID)
	if err != nil {
		return errors.New("discount not found")
	}

	// Delete existing associations
	if err := s.repo.DeleteByDiscount(ctx, discountID); err != nil {
		return err
	}

	// Create new associations
	for _, planID := range planIDs {
		// Verify plan exists
		_, err := s.planRepo.GetByID(ctx, planID)
		if err != nil {
			return errors.New("plan not found")
		}

		dp := &domain.DiscountPlan{
			DiscountID: discountID,
			PlanID:     planID,
		}

		if err := s.repo.Create(ctx, dp); err != nil {
			return err
		}
	}

	return nil
}
