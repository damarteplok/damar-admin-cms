package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PlanMeterRepository struct {
	db *pgxpool.Pool
}

func NewPlanMeterRepository(db *pgxpool.Pool) domain.PlanMeterRepository {
	return &PlanMeterRepository{db: db}
}

func (r *PlanMeterRepository) GetByID(ctx context.Context, id int64) (*domain.PlanMeter, error) {
	query := `
		SELECT id, name, created_at, updated_at
		FROM plan_meters 
		WHERE id = $1
	`

	meter := &domain.PlanMeter{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&meter.ID,
		&meter.Name,
		&meter.CreatedAt,
		&meter.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan meter by ID: %w", err)
	}

	return meter, nil
}

func (r *PlanMeterRepository) Create(ctx context.Context, meter *domain.PlanMeter) error {
	query := `
		INSERT INTO plan_meters (name, created_at, updated_at)
		VALUES ($1, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(ctx, query, meter.Name).Scan(
		&meter.ID,
		&meter.CreatedAt,
		&meter.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create plan meter: %w", err)
	}

	return nil
}

func (r *PlanMeterRepository) Update(ctx context.Context, meter *domain.PlanMeter) error {
	query := `
		UPDATE plan_meters 
		SET name = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING updated_at
	`

	err := r.db.QueryRow(ctx, query, meter.Name, meter.ID).Scan(&meter.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update plan meter: %w", err)
	}

	return nil
}

func (r *PlanMeterRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM plan_meters WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete plan meter: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("plan meter not found")
	}

	return nil
}

func (r *PlanMeterRepository) GetAll(ctx context.Context, page, perPage int) ([]*domain.PlanMeter, int, error) {
	offset := (page - 1) * perPage

	// Get total count
	var total int
	countQuery := `SELECT COUNT(*) FROM plan_meters`
	err := r.db.QueryRow(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count plan meters: %w", err)
	}

	// Get plan meters
	query := `
		SELECT id, name, created_at, updated_at
		FROM plan_meters 
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, perPage, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get plan meters: %w", err)
	}
	defer rows.Close()

	meters := make([]*domain.PlanMeter, 0)
	for rows.Next() {
		meter := &domain.PlanMeter{}
		err := rows.Scan(
			&meter.ID,
			&meter.Name,
			&meter.CreatedAt,
			&meter.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan plan meter: %w", err)
		}
		meters = append(meters, meter)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating plan meters: %w", err)
	}

	return meters, total, nil
}
