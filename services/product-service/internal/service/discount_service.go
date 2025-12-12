package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type discountService struct {
	repo domain.DiscountRepository
}

func NewDiscountService(repo domain.DiscountRepository) domain.DiscountService {
	return &discountService{repo: repo}
}

func (s *discountService) GetByID(ctx context.Context, id int64) (*domain.Discount, error) {
	if id <= 0 {
		return nil, errors.New("invalid discount ID")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *discountService) Create(ctx context.Context, discount *domain.Discount) error {
	if discount == nil {
		return errors.New("discount cannot be nil")
	}
	if discount.Name == "" {
		return errors.New("discount name is required")
	}
	if discount.Type == "" {
		return errors.New("discount type is required")
	}
	if discount.Amount <= 0 {
		return errors.New("discount amount must be greater than 0")
	}
	return s.repo.Create(ctx, discount)
}

func (s *discountService) Update(ctx context.Context, discount *domain.Discount) error {
	if discount == nil {
		return errors.New("discount cannot be nil")
	}
	if discount.ID <= 0 {
		return errors.New("invalid discount ID")
	}
	if discount.Name == "" {
		return errors.New("discount name is required")
	}
	if discount.Type == "" {
		return errors.New("discount type is required")
	}
	if discount.Amount <= 0 {
		return errors.New("discount amount must be greater than 0")
	}
	return s.repo.Update(ctx, discount)
}

func (s *discountService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid discount ID")
	}
	return s.repo.Delete(ctx, id)
}

func (s *discountService) GetAll(ctx context.Context, page, perPage int, activeOnly bool, search, sortBy, sortOrder string) ([]*domain.Discount, int, error) {
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	return s.repo.GetAll(ctx, page, perPage, activeOnly, search, sortBy, sortOrder)
}
