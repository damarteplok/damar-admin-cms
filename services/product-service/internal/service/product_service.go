package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
)

type productService struct {
	repo domain.ProductRepository
}

func NewProductService(repo domain.ProductRepository) domain.ProductService {
	return &productService{repo: repo}
}

func (s *productService) GetByID(ctx context.Context, id int64) (*domain.Product, error) {
	if id <= 0 {
		return nil, errors.New("invalid product ID")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *productService) GetBySlug(ctx context.Context, slug string) (*domain.Product, error) {
	if slug == "" {
		return nil, errors.New("slug cannot be empty")
	}
	return s.repo.GetBySlug(ctx, slug)
}

func (s *productService) Create(ctx context.Context, product *domain.Product) error {
	if product == nil {
		return errors.New("product cannot be nil")
	}
	if product.Name == "" {
		return errors.New("product name is required")
	}
	if product.Slug == "" {
		return errors.New("product slug is required")
	}
	return s.repo.Create(ctx, product)
}

func (s *productService) Update(ctx context.Context, product *domain.Product) error {
	if product == nil {
		return errors.New("product cannot be nil")
	}
	if product.ID <= 0 {
		return errors.New("invalid product ID")
	}

	existing, err := s.repo.GetByID(ctx, product.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("product not found")
	}

	return s.repo.Update(ctx, product)
}

func (s *productService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid product ID")
	}

	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("product not found")
	}

	return s.repo.Delete(ctx, id)
}

func (s *productService) GetAll(ctx context.Context, page, perPage int) ([]*domain.Product, int, error) {
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
