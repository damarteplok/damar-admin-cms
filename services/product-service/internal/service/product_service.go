package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/shared/amqp"
	"github.com/damarteplok/damar-admin-cms/shared/contracts"
	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"go.uber.org/zap"
)

type productService struct {
	repo      domain.ProductRepository
	publisher *amqp.Publisher
}

func NewProductService(repo domain.ProductRepository, publisher *amqp.Publisher) domain.ProductService {
	return &productService{
		repo:      repo,
		publisher: publisher,
	}
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

	err := s.repo.Create(ctx, product)
	if err != nil {
		return err
	}

	// Publish product.created event
	if s.publisher != nil {
		eventData := map[string]interface{}{
			"product_id":  product.ID,
			"name":        product.Name,
			"slug":        product.Slug,
			"description": product.Description,
			"is_popular":  product.IsPopular,
			"is_default":  product.IsDefault,
		}
		dataBytes, _ := json.Marshal(eventData)
		message := contracts.AmqpMessage{
			OwnerID: fmt.Sprintf("%d", product.ID),
			Data:    dataBytes,
		}

		if err := s.publisher.Publish(ctx, contracts.ProductEventCreated, message); err != nil {
			logger.Error("Failed to publish product.created event",
				zap.Int64("product_id", product.ID),
				zap.Error(err))
		} else {
			logger.Info("Published product.created event",
				zap.Int64("product_id", product.ID),
				zap.String("slug", product.Slug))
		}
	}

	return nil
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

	err = s.repo.Update(ctx, product)
	if err != nil {
		return err
	}

	// Publish product.updated event
	if s.publisher != nil {
		eventData := map[string]interface{}{
			"product_id":  product.ID,
			"name":        product.Name,
			"slug":        product.Slug,
			"description": product.Description,
			"is_popular":  product.IsPopular,
			"is_default":  product.IsDefault,
		}
		dataBytes, _ := json.Marshal(eventData)
		message := contracts.AmqpMessage{
			OwnerID: fmt.Sprintf("%d", product.ID),
			Data:    dataBytes,
		}

		if err := s.publisher.Publish(ctx, contracts.ProductEventUpdated, message); err != nil {
			logger.Error("Failed to publish product.updated event",
				zap.Int64("product_id", product.ID),
				zap.Error(err))
		} else {
			logger.Info("Published product.updated event",
				zap.Int64("product_id", product.ID),
				zap.String("slug", product.Slug))
		}
	}

	return nil
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

	err = s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	// Publish product.deleted event
	if s.publisher != nil {
		eventData := map[string]interface{}{
			"product_id": id,
			"name":       existing.Name,
			"slug":       existing.Slug,
		}
		dataBytes, _ := json.Marshal(eventData)
		message := contracts.AmqpMessage{
			OwnerID: fmt.Sprintf("%d", id),
			Data:    dataBytes,
		}

		if err := s.publisher.Publish(ctx, contracts.ProductEventDeleted, message); err != nil {
			logger.Error("Failed to publish product.deleted event",
				zap.Int64("product_id", id),
				zap.Error(err))
		} else {
			logger.Info("Published product.deleted event",
				zap.Int64("product_id", id),
				zap.String("slug", existing.Slug))
		}
	}

	return nil
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
