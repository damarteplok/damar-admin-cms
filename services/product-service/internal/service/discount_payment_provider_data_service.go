package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type discountPaymentProviderDataService struct {
	repo         domain.DiscountPaymentProviderDataRepository
	discountRepo domain.DiscountRepository
}

func NewDiscountPaymentProviderDataService(
	repo domain.DiscountPaymentProviderDataRepository,
	discountRepo domain.DiscountRepository,
) domain.DiscountPaymentProviderDataService {
	return &discountPaymentProviderDataService{
		repo:         repo,
		discountRepo: discountRepo,
	}
}

func (s *discountPaymentProviderDataService) GetByID(ctx context.Context, id int64) (*domain.DiscountPaymentProviderData, error) {
	if id <= 0 {
		return nil, errors.New("invalid ID")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *discountPaymentProviderDataService) GetByDiscount(ctx context.Context, discountID int64) ([]*domain.DiscountPaymentProviderData, error) {
	if discountID <= 0 {
		return nil, errors.New("invalid discount ID")
	}
	return s.repo.GetByDiscount(ctx, discountID)
}

func (s *discountPaymentProviderDataService) GetByDiscountAndProvider(ctx context.Context, discountID, paymentProviderID int64) (*domain.DiscountPaymentProviderData, error) {
	if discountID <= 0 {
		return nil, errors.New("invalid discount ID")
	}
	if paymentProviderID <= 0 {
		return nil, errors.New("invalid payment provider ID")
	}
	return s.repo.GetByDiscountAndProvider(ctx, discountID, paymentProviderID)
}

func (s *discountPaymentProviderDataService) Create(ctx context.Context, data *domain.DiscountPaymentProviderData) error {
	if data == nil {
		return errors.New("payment provider data cannot be nil")
	}
	if data.DiscountID <= 0 {
		return errors.New("discount ID is required")
	}
	if data.PaymentProviderID <= 0 {
		return errors.New("payment provider ID is required")
	}
	if data.PaymentProviderDiscountID == "" {
		return errors.New("payment provider discount ID is required")
	}

	// Verify discount exists
	_, err := s.discountRepo.GetByID(ctx, data.DiscountID)
	if err != nil {
		return errors.New("discount not found")
	}

	return s.repo.Create(ctx, data)
}

func (s *discountPaymentProviderDataService) Update(ctx context.Context, data *domain.DiscountPaymentProviderData) error {
	if data == nil {
		return errors.New("payment provider data cannot be nil")
	}
	if data.ID <= 0 {
		return errors.New("invalid ID")
	}
	if data.PaymentProviderID <= 0 {
		return errors.New("payment provider ID is required")
	}
	if data.PaymentProviderDiscountID == "" {
		return errors.New("payment provider discount ID is required")
	}
	return s.repo.Update(ctx, data)
}

func (s *discountPaymentProviderDataService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid ID")
	}
	return s.repo.Delete(ctx, id)
}
