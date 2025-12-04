package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DiscountPaymentProviderDataRepository struct {
	db *pgxpool.Pool
}

func NewDiscountPaymentProviderDataRepository(db *pgxpool.Pool) domain.DiscountPaymentProviderDataRepository {
	return &DiscountPaymentProviderDataRepository{db: db}
}

func (r *DiscountPaymentProviderDataRepository) GetByID(ctx context.Context, id int64) (*domain.DiscountPaymentProviderData, error) {
	query := `
		SELECT id, discount_id, payment_provider_id, payment_provider_discount_id, created_at, updated_at
		FROM discount_payment_provider_data 
		WHERE id = $1
	`

	data := &domain.DiscountPaymentProviderData{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&data.ID,
		&data.DiscountID,
		&data.PaymentProviderID,
		&data.PaymentProviderDiscountID,
		&data.CreatedAt,
		&data.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment provider data by ID: %w", err)
	}

	return data, nil
}

func (r *DiscountPaymentProviderDataRepository) GetByDiscount(ctx context.Context, discountID int64) ([]*domain.DiscountPaymentProviderData, error) {
	query := `
		SELECT id, discount_id, payment_provider_id, payment_provider_discount_id, created_at, updated_at
		FROM discount_payment_provider_data 
		WHERE discount_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, discountID)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment provider data by discount: %w", err)
	}
	defer rows.Close()

	items := make([]*domain.DiscountPaymentProviderData, 0)
	for rows.Next() {
		item := &domain.DiscountPaymentProviderData{}
		err := rows.Scan(
			&item.ID,
			&item.DiscountID,
			&item.PaymentProviderID,
			&item.PaymentProviderDiscountID,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan payment provider data: %w", err)
		}
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating payment provider data: %w", err)
	}

	return items, nil
}

func (r *DiscountPaymentProviderDataRepository) GetByDiscountAndProvider(ctx context.Context, discountID, paymentProviderID int64) (*domain.DiscountPaymentProviderData, error) {
	query := `
		SELECT id, discount_id, payment_provider_id, payment_provider_discount_id, created_at, updated_at
		FROM discount_payment_provider_data 
		WHERE discount_id = $1 AND payment_provider_id = $2
	`

	data := &domain.DiscountPaymentProviderData{}
	err := r.db.QueryRow(ctx, query, discountID, paymentProviderID).Scan(
		&data.ID,
		&data.DiscountID,
		&data.PaymentProviderID,
		&data.PaymentProviderDiscountID,
		&data.CreatedAt,
		&data.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get payment provider data: %w", err)
	}

	return data, nil
}

func (r *DiscountPaymentProviderDataRepository) Create(ctx context.Context, data *domain.DiscountPaymentProviderData) error {
	query := `
		INSERT INTO discount_payment_provider_data (discount_id, payment_provider_id, payment_provider_discount_id, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		data.DiscountID,
		data.PaymentProviderID,
		data.PaymentProviderDiscountID,
	).Scan(&data.ID, &data.CreatedAt, &data.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create payment provider data: %w", err)
	}

	return nil
}

func (r *DiscountPaymentProviderDataRepository) Update(ctx context.Context, data *domain.DiscountPaymentProviderData) error {
	query := `
		UPDATE discount_payment_provider_data 
		SET discount_id = $1, payment_provider_id = $2, payment_provider_discount_id = $3, updated_at = NOW()
		WHERE id = $4
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		data.DiscountID,
		data.PaymentProviderID,
		data.PaymentProviderDiscountID,
		data.ID,
	).Scan(&data.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update payment provider data: %w", err)
	}

	return nil
}

func (r *DiscountPaymentProviderDataRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM discount_payment_provider_data WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete payment provider data: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("payment provider data not found")
	}

	return nil
}
