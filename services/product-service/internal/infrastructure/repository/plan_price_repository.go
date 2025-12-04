package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PlanPriceRepository struct {
	db *pgxpool.Pool
}

func NewPlanPriceRepository(db *pgxpool.Pool) domain.PlanPriceRepository {
	return &PlanPriceRepository{db: db}
}

func (r *PlanPriceRepository) GetByID(ctx context.Context, id int64) (*domain.PlanPrice, error) {
	query := `
		SELECT id, plan_id, currency_id, price, price_per_unit, type, tiers, created_at, updated_at
		FROM plan_prices 
		WHERE id = $1
	`

	planPrice := &domain.PlanPrice{}
	var tiersJSON []byte

	err := r.db.QueryRow(ctx, query, id).Scan(
		&planPrice.ID,
		&planPrice.PlanID,
		&planPrice.CurrencyID,
		&planPrice.Price,
		&planPrice.PricePerUnit,
		&planPrice.Type,
		&tiersJSON,
		&planPrice.CreatedAt,
		&planPrice.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan price by ID: %w", err)
	}

	// Parse JSON tiers
	if len(tiersJSON) > 0 {
		if err := json.Unmarshal(tiersJSON, &planPrice.Tiers); err != nil {
			return nil, fmt.Errorf("failed to unmarshal tiers: %w", err)
		}
	}

	return planPrice, nil
}

func (r *PlanPriceRepository) GetByPlan(ctx context.Context, planID int64) ([]*domain.PlanPrice, error) {
	query := `
		SELECT id, plan_id, currency_id, price, price_per_unit, type, tiers, created_at, updated_at
		FROM plan_prices 
		WHERE plan_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, planID)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan prices by plan: %w", err)
	}
	defer rows.Close()

	planPrices := make([]*domain.PlanPrice, 0)
	for rows.Next() {
		planPrice := &domain.PlanPrice{}
		var tiersJSON []byte

		err := rows.Scan(
			&planPrice.ID,
			&planPrice.PlanID,
			&planPrice.CurrencyID,
			&planPrice.Price,
			&planPrice.PricePerUnit,
			&planPrice.Type,
			&tiersJSON,
			&planPrice.CreatedAt,
			&planPrice.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan plan price: %w", err)
		}

		// Parse JSON tiers
		if len(tiersJSON) > 0 {
			if err := json.Unmarshal(tiersJSON, &planPrice.Tiers); err != nil {
				return nil, fmt.Errorf("failed to unmarshal tiers: %w", err)
			}
		}

		planPrices = append(planPrices, planPrice)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating plan prices: %w", err)
	}

	return planPrices, nil
}

func (r *PlanPriceRepository) Create(ctx context.Context, planPrice *domain.PlanPrice) error {
	tiersJSON, err := json.Marshal(planPrice.Tiers)
	if err != nil {
		return fmt.Errorf("failed to marshal tiers: %w", err)
	}

	query := `
		INSERT INTO plan_prices (plan_id, currency_id, price, price_per_unit, type, tiers, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err = r.db.QueryRow(
		ctx,
		query,
		planPrice.PlanID,
		planPrice.CurrencyID,
		planPrice.Price,
		planPrice.PricePerUnit,
		planPrice.Type,
		tiersJSON,
	).Scan(&planPrice.ID, &planPrice.CreatedAt, &planPrice.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create plan price: %w", err)
	}

	return nil
}

func (r *PlanPriceRepository) Update(ctx context.Context, planPrice *domain.PlanPrice) error {
	tiersJSON, err := json.Marshal(planPrice.Tiers)
	if err != nil {
		return fmt.Errorf("failed to marshal tiers: %w", err)
	}

	query := `
		UPDATE plan_prices 
		SET plan_id = $1, currency_id = $2, price = $3, price_per_unit = $4, 
		    type = $5, tiers = $6, updated_at = NOW()
		WHERE id = $7
		RETURNING updated_at
	`

	err = r.db.QueryRow(
		ctx,
		query,
		planPrice.PlanID,
		planPrice.CurrencyID,
		planPrice.Price,
		planPrice.PricePerUnit,
		planPrice.Type,
		tiersJSON,
		planPrice.ID,
	).Scan(&planPrice.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update plan price: %w", err)
	}

	return nil
}

func (r *PlanPriceRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM plan_prices WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete plan price: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("plan price not found")
	}

	return nil
}
