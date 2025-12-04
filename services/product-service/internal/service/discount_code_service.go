package service

import (
	"context"
	"errors"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type discountCodeService struct {
	repo         domain.DiscountCodeRepository
	discountRepo domain.DiscountRepository
}

func NewDiscountCodeService(repo domain.DiscountCodeRepository, discountRepo domain.DiscountRepository) domain.DiscountCodeService {
	return &discountCodeService{
		repo:         repo,
		discountRepo: discountRepo,
	}
}

func (s *discountCodeService) GetByID(ctx context.Context, id int64) (*domain.DiscountCode, error) {
	if id <= 0 {
		return nil, errors.New("invalid discount code ID")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *discountCodeService) GetByCode(ctx context.Context, code string) (*domain.DiscountCode, error) {
	if code == "" {
		return nil, errors.New("code cannot be empty")
	}
	return s.repo.GetByCode(ctx, code)
}

func (s *discountCodeService) GetByDiscount(ctx context.Context, discountID int64) ([]*domain.DiscountCode, error) {
	if discountID <= 0 {
		return nil, errors.New("invalid discount ID")
	}
	return s.repo.GetByDiscount(ctx, discountID)
}

func (s *discountCodeService) Create(ctx context.Context, code *domain.DiscountCode) error {
	if code == nil {
		return errors.New("discount code cannot be nil")
	}
	if code.Code == "" {
		return errors.New("code is required")
	}
	if code.DiscountID <= 0 {
		return errors.New("discount ID is required")
	}

	// Verify discount exists
	_, err := s.discountRepo.GetByID(ctx, code.DiscountID)
	if err != nil {
		return errors.New("discount not found")
	}

	return s.repo.Create(ctx, code)
}

func (s *discountCodeService) Update(ctx context.Context, code *domain.DiscountCode) error {
	if code == nil {
		return errors.New("discount code cannot be nil")
	}
	if code.ID <= 0 {
		return errors.New("invalid discount code ID")
	}
	if code.Code == "" {
		return errors.New("code is required")
	}
	return s.repo.Update(ctx, code)
}

func (s *discountCodeService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid discount code ID")
	}
	return s.repo.Delete(ctx, id)
}

func (s *discountCodeService) GetAll(ctx context.Context, page, perPage int, activeOnly bool) ([]*domain.DiscountCode, int, error) {
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	return s.repo.GetAll(ctx, page, perPage, activeOnly)
}

func (s *discountCodeService) ValidateCode(ctx context.Context, code string) (bool, string, error) {
	if code == "" {
		return false, "code cannot be empty", nil
	}

	discountCode, err := s.repo.GetByCode(ctx, code)
	if err != nil {
		return false, "code not found", nil
	}

	if !discountCode.IsActive {
		return false, "code is not active", nil
	}

	now := time.Now()

	if discountCode.ValidFrom != nil && now.Before(*discountCode.ValidFrom) {
		return false, "code is not yet valid", nil
	}

	if discountCode.ValidUntil != nil && now.After(*discountCode.ValidUntil) {
		return false, "code has expired", nil
	}

	if discountCode.MaxUses != nil && discountCode.TimesUsed >= *discountCode.MaxUses {
		return false, "code has reached maximum uses", nil
	}

	return true, "", nil
}
