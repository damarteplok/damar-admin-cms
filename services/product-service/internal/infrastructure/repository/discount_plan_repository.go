package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DiscountPlanRepository struct {
	db *pgxpool.Pool
}

func NewDiscountPlanRepository(db *pgxpool.Pool) domain.DiscountPlanRepository {
	return &DiscountPlanRepository{db: db}
}

func (r *DiscountPlanRepository) GetByDiscount(ctx context.Context, discountID int64) ([]*domain.DiscountPlan, error) {
	query := `
		SELECT id, discount_id, plan_id, created_at, updated_at
		FROM discount_plan 
		WHERE discount_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, discountID)
	if err != nil {
		return nil, fmt.Errorf("failed to get discount plans by discount: %w", err)
	}
	defer rows.Close()

	plans := make([]*domain.DiscountPlan, 0)
	for rows.Next() {
		plan := &domain.DiscountPlan{}
		err := rows.Scan(
			&plan.ID,
			&plan.DiscountID,
			&plan.PlanID,
			&plan.CreatedAt,
			&plan.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan discount plan: %w", err)
		}
		plans = append(plans, plan)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating discount plans: %w", err)
	}

	return plans, nil
}

func (r *DiscountPlanRepository) GetByPlan(ctx context.Context, planID int64) ([]*domain.DiscountPlan, error) {
	query := `
		SELECT id, discount_id, plan_id, created_at, updated_at
		FROM discount_plan 
		WHERE plan_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, planID)
	if err != nil {
		return nil, fmt.Errorf("failed to get discount plans by plan: %w", err)
	}
	defer rows.Close()

	plans := make([]*domain.DiscountPlan, 0)
	for rows.Next() {
		plan := &domain.DiscountPlan{}
		err := rows.Scan(
			&plan.ID,
			&plan.DiscountID,
			&plan.PlanID,
			&plan.CreatedAt,
			&plan.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan discount plan: %w", err)
		}
		plans = append(plans, plan)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating discount plans: %w", err)
	}

	return plans, nil
}

func (r *DiscountPlanRepository) Create(ctx context.Context, dp *domain.DiscountPlan) error {
	query := `
		INSERT INTO discount_plan (discount_id, plan_id, created_at, updated_at)
		VALUES ($1, $2, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		dp.DiscountID,
		dp.PlanID,
	).Scan(&dp.ID, &dp.CreatedAt, &dp.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create discount plan: %w", err)
	}

	return nil
}

func (r *DiscountPlanRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM discount_plan WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete discount plan: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("discount plan not found")
	}

	return nil
}

func (r *DiscountPlanRepository) DeleteByDiscount(ctx context.Context, discountID int64) error {
	query := `DELETE FROM discount_plan WHERE discount_id = $1`

	_, err := r.db.Exec(ctx, query, discountID)
	if err != nil {
		return fmt.Errorf("failed to delete discount plans by discount: %w", err)
	}

	return nil
}

func (r *DiscountPlanRepository) DeleteByPlan(ctx context.Context, planID int64) error {
	query := `DELETE FROM discount_plan WHERE plan_id = $1`

	_, err := r.db.Exec(ctx, query, planID)
	if err != nil {
		return fmt.Errorf("failed to delete discount plans by plan: %w", err)
	}

	return nil
}
