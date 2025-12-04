package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type discountOneTimeProductService struct {
	repo         domain.DiscountOneTimeProductRepository
	discountRepo domain.DiscountRepository
	productRepo  domain.ProductRepository
}

func NewDiscountOneTimeProductService(
	repo domain.DiscountOneTimeProductRepository,
	discountRepo domain.DiscountRepository,
	productRepo domain.ProductRepository,
) domain.DiscountOneTimeProductService {
	return &discountOneTimeProductService{
		repo:         repo,
		discountRepo: discountRepo,
		productRepo:  productRepo,
	}
}

func (s *discountOneTimeProductService) GetByDiscount(ctx context.Context, discountID int64) ([]*domain.DiscountOneTimeProduct, error) {
	if discountID <= 0 {
		return nil, errors.New("invalid discount ID")
	}
	return s.repo.GetByDiscount(ctx, discountID)
}

func (s *discountOneTimeProductService) GetByProduct(ctx context.Context, productID int64) ([]*domain.DiscountOneTimeProduct, error) {
	if productID <= 0 {
		return nil, errors.New("invalid product ID")
	}
	return s.repo.GetByProduct(ctx, productID)
}

func (s *discountOneTimeProductService) AddProductToDiscount(ctx context.Context, discountID, productID int64) error {
	if discountID <= 0 {
		return errors.New("discount ID is required")
	}
	if productID <= 0 {
		return errors.New("product ID is required")
	}

	// Verify discount exists
	_, err := s.discountRepo.GetByID(ctx, discountID)
	if err != nil {
		return errors.New("discount not found")
	}

	// Verify product exists
	_, err = s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return errors.New("product not found")
	}

	dp := &domain.DiscountOneTimeProduct{
		DiscountID: discountID,
		ProductID:  productID,
	}

	return s.repo.Create(ctx, dp)
}

func (s *discountOneTimeProductService) RemoveProductFromDiscount(ctx context.Context, discountID, productID int64) error {
	if discountID <= 0 {
		return errors.New("discount ID is required")
	}
	if productID <= 0 {
		return errors.New("product ID is required")
	}

	// Get existing associations
	associations, err := s.repo.GetByDiscount(ctx, discountID)
	if err != nil {
		return err
	}

	// Find and delete the specific association
	for _, assoc := range associations {
		if assoc.ProductID == productID {
			return s.repo.Delete(ctx, assoc.ID)
		}
	}

	return errors.New("association not found")
}

func (s *discountOneTimeProductService) AssignProductsToDiscount(ctx context.Context, discountID int64, productIDs []int64) error {
	if discountID <= 0 {
		return errors.New("discount ID is required")
	}
	if len(productIDs) == 0 {
		return errors.New("at least one product ID is required")
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
	for _, productID := range productIDs {
		// Verify product exists
		_, err := s.productRepo.GetByID(ctx, productID)
		if err != nil {
			return errors.New("product not found")
		}

		dp := &domain.DiscountOneTimeProduct{
			DiscountID: discountID,
			ProductID:  productID,
		}

		if err := s.repo.Create(ctx, dp); err != nil {
			return err
		}
	}

	return nil
}
