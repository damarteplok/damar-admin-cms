package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DiscountCodeRedemptionRepository struct {
	db *pgxpool.Pool
}

func NewDiscountCodeRedemptionRepository(db *pgxpool.Pool) domain.DiscountCodeRedemptionRepository {
	return &DiscountCodeRedemptionRepository{db: db}
}

func (r *DiscountCodeRedemptionRepository) GetByID(ctx context.Context, id int64) (*domain.DiscountCodeRedemption, error) {
	query := `
		SELECT id, discount_code_id, user_id, subscription_id, order_id, redeemed_at, created_at, updated_at
		FROM discount_code_redemptions 
		WHERE id = $1
	`

	redemption := &domain.DiscountCodeRedemption{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&redemption.ID,
		&redemption.DiscountCodeID,
		&redemption.UserID,
		&redemption.SubscriptionID,
		&redemption.OrderID,
		&redemption.RedeemedAt,
		&redemption.CreatedAt,
		&redemption.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get redemption by ID: %w", err)
	}

	return redemption, nil
}

func (r *DiscountCodeRedemptionRepository) GetByDiscountCode(ctx context.Context, discountCodeID int64) ([]*domain.DiscountCodeRedemption, error) {
	query := `
		SELECT id, discount_code_id, user_id, subscription_id, order_id, redeemed_at, created_at, updated_at
		FROM discount_code_redemptions 
		WHERE discount_code_id = $1
		ORDER BY redeemed_at DESC
	`

	rows, err := r.db.Query(ctx, query, discountCodeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get redemptions by discount code: %w", err)
	}
	defer rows.Close()

	redemptions := make([]*domain.DiscountCodeRedemption, 0)
	for rows.Next() {
		redemption := &domain.DiscountCodeRedemption{}
		err := rows.Scan(
			&redemption.ID,
			&redemption.DiscountCodeID,
			&redemption.UserID,
			&redemption.SubscriptionID,
			&redemption.OrderID,
			&redemption.RedeemedAt,
			&redemption.CreatedAt,
			&redemption.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan redemption: %w", err)
		}
		redemptions = append(redemptions, redemption)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating redemptions: %w", err)
	}

	return redemptions, nil
}

func (r *DiscountCodeRedemptionRepository) GetByUser(ctx context.Context, userID int64) ([]*domain.DiscountCodeRedemption, error) {
	query := `
		SELECT id, discount_code_id, user_id, subscription_id, order_id, redeemed_at, created_at, updated_at
		FROM discount_code_redemptions 
		WHERE user_id = $1
		ORDER BY redeemed_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get redemptions by user: %w", err)
	}
	defer rows.Close()

	redemptions := make([]*domain.DiscountCodeRedemption, 0)
	for rows.Next() {
		redemption := &domain.DiscountCodeRedemption{}
		err := rows.Scan(
			&redemption.ID,
			&redemption.DiscountCodeID,
			&redemption.UserID,
			&redemption.SubscriptionID,
			&redemption.OrderID,
			&redemption.RedeemedAt,
			&redemption.CreatedAt,
			&redemption.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan redemption: %w", err)
		}
		redemptions = append(redemptions, redemption)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating redemptions: %w", err)
	}

	return redemptions, nil
}

func (r *DiscountCodeRedemptionRepository) Create(ctx context.Context, redemption *domain.DiscountCodeRedemption) error {
	query := `
		INSERT INTO discount_code_redemptions (discount_code_id, user_id, subscription_id, order_id, redeemed_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		redemption.DiscountCodeID,
		redemption.UserID,
		redemption.SubscriptionID,
		redemption.OrderID,
		redemption.RedeemedAt,
	).Scan(&redemption.ID, &redemption.CreatedAt, &redemption.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create redemption: %w", err)
	}

	return nil
}

func (r *DiscountCodeRedemptionRepository) GetAll(ctx context.Context, page, perPage int) ([]*domain.DiscountCodeRedemption, int, error) {
	offset := (page - 1) * perPage

	var total int
	countQuery := `SELECT COUNT(*) FROM discount_code_redemptions`
	err := r.db.QueryRow(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count redemptions: %w", err)
	}

	query := `
		SELECT id, discount_code_id, user_id, subscription_id, order_id, redeemed_at, created_at, updated_at
		FROM discount_code_redemptions 
		ORDER BY redeemed_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, perPage, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get redemptions: %w", err)
	}
	defer rows.Close()

	redemptions := make([]*domain.DiscountCodeRedemption, 0)
	for rows.Next() {
		redemption := &domain.DiscountCodeRedemption{}
		err := rows.Scan(
			&redemption.ID,
			&redemption.DiscountCodeID,
			&redemption.UserID,
			&redemption.SubscriptionID,
			&redemption.OrderID,
			&redemption.RedeemedAt,
			&redemption.CreatedAt,
			&redemption.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan redemption: %w", err)
		}
		redemptions = append(redemptions, redemption)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating redemptions: %w", err)
	}

	return redemptions, total, nil
}
