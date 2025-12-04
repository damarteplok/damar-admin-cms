package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DiscountRepository struct {
	db *pgxpool.Pool
}

func NewDiscountRepository(db *pgxpool.Pool) domain.DiscountRepository {
	return &DiscountRepository{db: db}
}

func (r *DiscountRepository) GetByID(ctx context.Context, id int64) (*domain.Discount, error) {
	query := `
		SELECT id, name, type, amount, is_active, description, valid_until, action_type, 
		       max_redemptions, max_redemptions_per_user, redemptions, is_recurring,
		       duration_in_months, maximum_recurring_intervals, redeem_type, bonus_days,
		       is_enabled_for_all_plans, is_enabled_for_all_one_time_products, 
		       created_at, updated_at
		FROM discounts 
		WHERE id = $1
	`

	discount := &domain.Discount{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&discount.ID,
		&discount.Name,
		&discount.Type,
		&discount.Amount,
		&discount.IsActive,
		&discount.Description,
		&discount.ValidUntil,
		&discount.ActionType,
		&discount.MaxRedemptions,
		&discount.MaxRedemptionsPerUser,
		&discount.Redemptions,
		&discount.IsRecurring,
		&discount.DurationInMonths,
		&discount.MaximumRecurringIntervals,
		&discount.RedeemType,
		&discount.BonusDays,
		&discount.IsEnabledForAllPlans,
		&discount.IsEnabledForAllOneTimeProducts,
		&discount.CreatedAt,
		&discount.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get discount by ID: %w", err)
	}

	return discount, nil
}

func (r *DiscountRepository) Create(ctx context.Context, discount *domain.Discount) error {
	query := `
		INSERT INTO discounts (name, type, amount, is_active, description, valid_until, action_type,
		                       max_redemptions, max_redemptions_per_user, redemptions, is_recurring,
		                       duration_in_months, maximum_recurring_intervals, redeem_type, bonus_days,
		                       is_enabled_for_all_plans, is_enabled_for_all_one_time_products,
		                       created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		discount.Name,
		discount.Type,
		discount.Amount,
		discount.IsActive,
		discount.Description,
		discount.ValidUntil,
		discount.ActionType,
		discount.MaxRedemptions,
		discount.MaxRedemptionsPerUser,
		discount.Redemptions,
		discount.IsRecurring,
		discount.DurationInMonths,
		discount.MaximumRecurringIntervals,
		discount.RedeemType,
		discount.BonusDays,
		discount.IsEnabledForAllPlans,
		discount.IsEnabledForAllOneTimeProducts,
	).Scan(&discount.ID, &discount.CreatedAt, &discount.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create discount: %w", err)
	}

	return nil
}

func (r *DiscountRepository) Update(ctx context.Context, discount *domain.Discount) error {
	query := `
		UPDATE discounts 
		SET name = $1, type = $2, amount = $3, is_active = $4, description = $5,
		    valid_until = $6, action_type = $7, max_redemptions = $8, max_redemptions_per_user = $9,
		    redemptions = $10, is_recurring = $11, duration_in_months = $12,
		    maximum_recurring_intervals = $13, redeem_type = $14, bonus_days = $15,
		    is_enabled_for_all_plans = $16, is_enabled_for_all_one_time_products = $17,
		    updated_at = NOW()
		WHERE id = $18
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		discount.Name,
		discount.Type,
		discount.Amount,
		discount.IsActive,
		discount.Description,
		discount.ValidUntil,
		discount.ActionType,
		discount.MaxRedemptions,
		discount.MaxRedemptionsPerUser,
		discount.Redemptions,
		discount.IsRecurring,
		discount.DurationInMonths,
		discount.MaximumRecurringIntervals,
		discount.RedeemType,
		discount.BonusDays,
		discount.IsEnabledForAllPlans,
		discount.IsEnabledForAllOneTimeProducts,
		discount.ID,
	).Scan(&discount.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update discount: %w", err)
	}

	return nil
}

func (r *DiscountRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM discounts WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete discount: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("discount not found")
	}

	return nil
}

func (r *DiscountRepository) GetAll(ctx context.Context, page, perPage int, activeOnly bool) ([]*domain.Discount, int, error) {
	offset := (page - 1) * perPage

	// Build query with filters
	countQuery := `SELECT COUNT(*) FROM discounts WHERE 1=1`
	query := `
		SELECT id, name, type, amount, is_active, description, valid_until, action_type,
		       max_redemptions, max_redemptions_per_user, redemptions, is_recurring,
		       duration_in_months, maximum_recurring_intervals, redeem_type, bonus_days,
		       is_enabled_for_all_plans, is_enabled_for_all_one_time_products,
		       created_at, updated_at
		FROM discounts 
		WHERE 1=1
	`

	if activeOnly {
		countQuery += ` AND is_active = true`
		query += ` AND is_active = true`
	}

	// Get total count
	var total int
	err := r.db.QueryRow(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count discounts: %w", err)
	}

	// Get discounts
	query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, perPage, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get discounts: %w", err)
	}
	defer rows.Close()

	discounts := make([]*domain.Discount, 0)
	for rows.Next() {
		discount := &domain.Discount{}
		err := rows.Scan(
			&discount.ID,
			&discount.Name,
			&discount.Type,
			&discount.Amount,
			&discount.IsActive,
			&discount.Description,
			&discount.ValidUntil,
			&discount.ActionType,
			&discount.MaxRedemptions,
			&discount.MaxRedemptionsPerUser,
			&discount.Redemptions,
			&discount.IsRecurring,
			&discount.DurationInMonths,
			&discount.MaximumRecurringIntervals,
			&discount.RedeemType,
			&discount.BonusDays,
			&discount.IsEnabledForAllPlans,
			&discount.IsEnabledForAllOneTimeProducts,
			&discount.CreatedAt,
			&discount.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan discount: %w", err)
		}
		discounts = append(discounts, discount)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating discounts: %w", err)
	}

	return discounts, total, nil
}
