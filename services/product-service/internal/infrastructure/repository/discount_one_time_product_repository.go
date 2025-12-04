package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DiscountOneTimeProductRepository struct {
	db *pgxpool.Pool
}

func NewDiscountOneTimeProductRepository(db *pgxpool.Pool) domain.DiscountOneTimeProductRepository {
	return &DiscountOneTimeProductRepository{db: db}
}

func (r *DiscountOneTimeProductRepository) GetByDiscount(ctx context.Context, discountID int64) ([]*domain.DiscountOneTimeProduct, error) {
	query := `
		SELECT id, discount_id, product_id, created_at, updated_at
		FROM discount_one_time_product 
		WHERE discount_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, discountID)
	if err != nil {
		return nil, fmt.Errorf("failed to get products by discount: %w", err)
	}
	defer rows.Close()

	items := make([]*domain.DiscountOneTimeProduct, 0)
	for rows.Next() {
		item := &domain.DiscountOneTimeProduct{}
		err := rows.Scan(
			&item.ID,
			&item.DiscountID,
			&item.ProductID,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan discount one time product: %w", err)
		}
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating discount one time products: %w", err)
	}

	return items, nil
}

func (r *DiscountOneTimeProductRepository) GetByProduct(ctx context.Context, productID int64) ([]*domain.DiscountOneTimeProduct, error) {
	query := `
		SELECT id, discount_id, product_id, created_at, updated_at
		FROM discount_one_time_product 
		WHERE product_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, productID)
	if err != nil {
		return nil, fmt.Errorf("failed to get discounts by product: %w", err)
	}
	defer rows.Close()

	items := make([]*domain.DiscountOneTimeProduct, 0)
	for rows.Next() {
		item := &domain.DiscountOneTimeProduct{}
		err := rows.Scan(
			&item.ID,
			&item.DiscountID,
			&item.ProductID,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan discount one time product: %w", err)
		}
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating discount one time products: %w", err)
	}

	return items, nil
}

func (r *DiscountOneTimeProductRepository) Create(ctx context.Context, dotp *domain.DiscountOneTimeProduct) error {
	query := `
		INSERT INTO discount_one_time_product (discount_id, product_id, created_at, updated_at)
		VALUES ($1, $2, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		dotp.DiscountID,
		dotp.ProductID,
	).Scan(&dotp.ID, &dotp.CreatedAt, &dotp.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create discount one time product: %w", err)
	}

	return nil
}

func (r *DiscountOneTimeProductRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM discount_one_time_product WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete discount one time product: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("discount one time product not found")
	}

	return nil
}

func (r *DiscountOneTimeProductRepository) DeleteByDiscount(ctx context.Context, discountID int64) error {
	query := `DELETE FROM discount_one_time_product WHERE discount_id = $1`

	_, err := r.db.Exec(ctx, query, discountID)
	if err != nil {
		return fmt.Errorf("failed to delete discount one time products by discount: %w", err)
	}

	return nil
}

func (r *DiscountOneTimeProductRepository) DeleteByProduct(ctx context.Context, productID int64) error {
	query := `DELETE FROM discount_one_time_product WHERE product_id = $1`

	_, err := r.db.Exec(ctx, query, productID)
	if err != nil {
		return fmt.Errorf("failed to delete discount one time products by product: %w", err)
	}

	return nil
}
