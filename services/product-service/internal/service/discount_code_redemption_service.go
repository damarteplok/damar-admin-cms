package service

import (
	"context"
	"errors"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type discountCodeRedemptionService struct {
	repo             domain.DiscountCodeRedemptionRepository
	codeRepo         domain.DiscountCodeRepository
	discountPlanRepo domain.DiscountPlanRepository
}

func NewDiscountCodeRedemptionService(
	repo domain.DiscountCodeRedemptionRepository,
	codeRepo domain.DiscountCodeRepository,
	discountPlanRepo domain.DiscountPlanRepository,
) domain.DiscountCodeRedemptionService {
	return &discountCodeRedemptionService{
		repo:             repo,
		codeRepo:         codeRepo,
		discountPlanRepo: discountPlanRepo,
	}
}

func (s *discountCodeRedemptionService) GetByID(ctx context.Context, id int64) (*domain.DiscountCodeRedemption, error) {
	if id <= 0 {
		return nil, errors.New("invalid redemption ID")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *discountCodeRedemptionService) GetByUser(ctx context.Context, userID int64) ([]*domain.DiscountCodeRedemption, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}
	return s.repo.GetByUser(ctx, userID)
}

func (s *discountCodeRedemptionService) GetByDiscountCode(ctx context.Context, codeID int64) ([]*domain.DiscountCodeRedemption, error) {
	if codeID <= 0 {
		return nil, errors.New("invalid discount code ID")
	}
	return s.repo.GetByDiscountCode(ctx, codeID)
}

func (s *discountCodeRedemptionService) RedeemCode(ctx context.Context, discountCodeID, userID int64, subscriptionID, orderID *int64) error {
	if userID <= 0 {
		return errors.New("user ID is required")
	}
	if discountCodeID <= 0 {
		return errors.New("discount code ID is required")
	}

	// Verify discount code exists and get details
	code, err := s.codeRepo.GetByID(ctx, discountCodeID)
	if err != nil {
		return errors.New("discount code not found")
	}

	// Check if code is still active
	if !code.IsActive {
		return errors.New("discount code is not active")
	}

	// Check max uses
	if code.MaxUses != nil && code.TimesUsed >= *code.MaxUses {
		return errors.New("discount code has reached maximum uses")
	}

	// Create redemption
	redemption := &domain.DiscountCodeRedemption{
		DiscountCodeID: discountCodeID,
		UserID:         userID,
		SubscriptionID: subscriptionID,
		OrderID:        orderID,
		RedeemedAt:     time.Now(),
	}

	if err := s.repo.Create(ctx, redemption); err != nil {
		return err
	}

	// Increment code usage
	if err := s.codeRepo.IncrementUsage(ctx, discountCodeID); err != nil {
		return err
	}

	return nil
}

func (s *discountCodeRedemptionService) GetAll(ctx context.Context, page, perPage int) ([]*domain.DiscountCodeRedemption, int, error) {
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	return s.repo.GetAll(ctx, page, perPage)
}
