package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type planService struct {
	repo        domain.PlanRepository
	productRepo domain.ProductRepository
}

func NewPlanService(repo domain.PlanRepository, productRepo domain.ProductRepository) domain.PlanService {
	return &planService{
		repo:        repo,
		productRepo: productRepo,
	}
}

func (s *planService) GetByID(ctx context.Context, id int64) (*domain.Plan, error) {
	if id <= 0 {
		return nil, errors.New("invalid plan ID")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *planService) GetBySlug(ctx context.Context, slug string) (*domain.Plan, error) {
	if slug == "" {
		return nil, errors.New("slug cannot be empty")
	}
	return s.repo.GetBySlug(ctx, slug)
}

func (s *planService) GetByProduct(ctx context.Context, productID int64) ([]*domain.Plan, error) {
	if productID <= 0 {
		return nil, errors.New("invalid product ID")
	}

	product, err := s.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, errors.New("product not found")
	}

	return s.repo.GetByProduct(ctx, productID)
}

func (s *planService) Create(ctx context.Context, plan *domain.Plan) error {
	if plan == nil {
		return errors.New("plan cannot be nil")
	}
	if plan.Name == "" {
		return errors.New("plan name is required")
	}
	// Auto-generate slug from name if not provided
	if plan.Slug == "" {
		plan.Slug = generateSlug(plan.Name)
	}
	if plan.ProductID <= 0 {
		return errors.New("product ID is required")
	}

	product, err := s.productRepo.GetByID(ctx, plan.ProductID)
	if err != nil {
		return err
	}
	if product == nil {
		return errors.New("product not found")
	}

	return s.repo.Create(ctx, plan)
}

func (s *planService) Update(ctx context.Context, plan *domain.Plan) error {
	if plan == nil {
		return errors.New("plan cannot be nil")
	}
	if plan.ID <= 0 {
		return errors.New("invalid plan ID")
	}

	existing, err := s.repo.GetByID(ctx, plan.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("plan not found")
	}

	return s.repo.Update(ctx, plan)
}

func (s *planService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid plan ID")
	}

	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("plan not found")
	}

	return s.repo.Delete(ctx, id)
}

func (s *planService) GetAll(ctx context.Context, page, perPage int, activeOnly, visibleOnly bool) ([]*domain.Plan, int, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}
	if perPage > 100 {
		perPage = 100
	}
	return s.repo.GetAll(ctx, page, perPage, activeOnly, visibleOnly)
}
