package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PlanRepository struct {
	db *pgxpool.Pool
}

func NewPlanRepository(db *pgxpool.Pool) domain.PlanRepository {
	return &PlanRepository{db: db}
}

func (r *PlanRepository) GetByID(ctx context.Context, id int64) (*domain.Plan, error) {
	query := `
		SELECT id, name, slug, interval_id, product_id, is_active, has_trial, 
		       trial_interval_id, interval_count, trial_interval_count, description, 
		       type, max_users_per_tenant, meter_id, is_visible, created_at, updated_at
		FROM plans 
		WHERE id = $1
	`

	plan := &domain.Plan{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&plan.ID,
		&plan.Name,
		&plan.Slug,
		&plan.IntervalID,
		&plan.ProductID,
		&plan.IsActive,
		&plan.HasTrial,
		&plan.TrialIntervalID,
		&plan.IntervalCount,
		&plan.TrialIntervalCount,
		&plan.Description,
		&plan.Type,
		&plan.MaxUsersPerTenant,
		&plan.MeterID,
		&plan.IsVisible,
		&plan.CreatedAt,
		&plan.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan by ID: %w", err)
	}

	return plan, nil
}

func (r *PlanRepository) GetBySlug(ctx context.Context, slug string) (*domain.Plan, error) {
	query := `
		SELECT id, name, slug, interval_id, product_id, is_active, has_trial, 
		       trial_interval_id, interval_count, trial_interval_count, description, 
		       type, max_users_per_tenant, meter_id, is_visible, created_at, updated_at
		FROM plans 
		WHERE slug = $1
	`

	plan := &domain.Plan{}
	err := r.db.QueryRow(ctx, query, slug).Scan(
		&plan.ID,
		&plan.Name,
		&plan.Slug,
		&plan.IntervalID,
		&plan.ProductID,
		&plan.IsActive,
		&plan.HasTrial,
		&plan.TrialIntervalID,
		&plan.IntervalCount,
		&plan.TrialIntervalCount,
		&plan.Description,
		&plan.Type,
		&plan.MaxUsersPerTenant,
		&plan.MeterID,
		&plan.IsVisible,
		&plan.CreatedAt,
		&plan.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get plan by slug: %w", err)
	}

	return plan, nil
}

func (r *PlanRepository) GetByProduct(ctx context.Context, productID int64) ([]*domain.Plan, error) {
	query := `
		SELECT id, name, slug, interval_id, product_id, is_active, has_trial, 
		       trial_interval_id, interval_count, trial_interval_count, description, 
		       type, max_users_per_tenant, meter_id, is_visible, created_at, updated_at
		FROM plans 
		WHERE product_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, productID)
	if err != nil {
		return nil, fmt.Errorf("failed to get plans by product: %w", err)
	}
	defer rows.Close()

	plans := make([]*domain.Plan, 0)
	for rows.Next() {
		plan := &domain.Plan{}
		err := rows.Scan(
			&plan.ID,
			&plan.Name,
			&plan.Slug,
			&plan.IntervalID,
			&plan.ProductID,
			&plan.IsActive,
			&plan.HasTrial,
			&plan.TrialIntervalID,
			&plan.IntervalCount,
			&plan.TrialIntervalCount,
			&plan.Description,
			&plan.Type,
			&plan.MaxUsersPerTenant,
			&plan.MeterID,
			&plan.IsVisible,
			&plan.CreatedAt,
			&plan.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan plan: %w", err)
		}
		plans = append(plans, plan)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating plans: %w", err)
	}

	return plans, nil
}

func (r *PlanRepository) Create(ctx context.Context, plan *domain.Plan) error {
	query := `
		INSERT INTO plans (name, slug, interval_id, product_id, is_active, has_trial, 
		                   trial_interval_id, interval_count, trial_interval_count, 
		                   description, type, max_users_per_tenant, meter_id, is_visible, 
		                   created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		plan.Name,
		plan.Slug,
		plan.IntervalID,
		plan.ProductID,
		plan.IsActive,
		plan.HasTrial,
		plan.TrialIntervalID,
		plan.IntervalCount,
		plan.TrialIntervalCount,
		plan.Description,
		plan.Type,
		plan.MaxUsersPerTenant,
		plan.MeterID,
		plan.IsVisible,
	).Scan(&plan.ID, &plan.CreatedAt, &plan.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create plan: %w", err)
	}

	return nil
}

func (r *PlanRepository) Update(ctx context.Context, plan *domain.Plan) error {
	query := `
		UPDATE plans 
		SET name = $1, slug = $2, interval_id = $3, product_id = $4, is_active = $5, 
		    has_trial = $6, trial_interval_id = $7, interval_count = $8, 
		    trial_interval_count = $9, description = $10, type = $11, 
		    max_users_per_tenant = $12, meter_id = $13, is_visible = $14, updated_at = NOW()
		WHERE id = $15
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		plan.Name,
		plan.Slug,
		plan.IntervalID,
		plan.ProductID,
		plan.IsActive,
		plan.HasTrial,
		plan.TrialIntervalID,
		plan.IntervalCount,
		plan.TrialIntervalCount,
		plan.Description,
		plan.Type,
		plan.MaxUsersPerTenant,
		plan.MeterID,
		plan.IsVisible,
		plan.ID,
	).Scan(&plan.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update plan: %w", err)
	}

	return nil
}

func (r *PlanRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM plans WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete plan: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("plan not found")
	}

	return nil
}

func (r *PlanRepository) GetAll(ctx context.Context, page, perPage int, search, sortBy, sortOrder string, activeOnly, visibleOnly bool) ([]*domain.Plan, int, error) {
	offset := (page - 1) * perPage

	// Build query with filters
	countQuery := `SELECT COUNT(*) FROM plans WHERE 1=1`
	query := `
		SELECT id, name, slug, interval_id, product_id, is_active, has_trial, 
		       trial_interval_id, interval_count, trial_interval_count, description, 
		       type, max_users_per_tenant, meter_id, is_visible, created_at, updated_at
		FROM plans 
		WHERE 1=1
	`

	args := []interface{}{}
	argCounter := 1

	// Add search filter
	if search != "" {
		searchPattern := "%" + search + "%"
		countQuery += fmt.Sprintf(` AND (name ILIKE $%d OR slug ILIKE $%d OR description ILIKE $%d)`, argCounter, argCounter, argCounter)
		query += fmt.Sprintf(` AND (name ILIKE $%d OR slug ILIKE $%d OR description ILIKE $%d)`, argCounter, argCounter, argCounter)
		args = append(args, searchPattern)
		argCounter++
	}

	if activeOnly {
		countQuery += ` AND is_active = true`
		query += ` AND is_active = true`
	}
	if visibleOnly {
		countQuery += ` AND is_visible = true`
		query += ` AND is_visible = true`
	}

	// Get total count
	var total int
	var err error
	if len(args) > 0 {
		err = r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count plans: %w", err)
	}

	// Add sorting
	validSortColumns := map[string]bool{
		"id":         true,
		"name":       true,
		"slug":       true,
		"created_at": true,
		"updated_at": true,
		"is_active":  true,
		"is_visible": true,
	}

	orderBy := "created_at"
	if sortBy != "" && validSortColumns[sortBy] {
		orderBy = sortBy
	}

	order := "DESC"
	if sortOrder == "asc" || sortOrder == "ASC" {
		order = "ASC"
	}

	query += fmt.Sprintf(` ORDER BY %s %s LIMIT $%d OFFSET $%d`, orderBy, order, argCounter, argCounter+1)
	args = append(args, perPage, offset)

	// Get plans
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get plans: %w", err)
	}
	defer rows.Close()

	plans := make([]*domain.Plan, 0)
	for rows.Next() {
		plan := &domain.Plan{}
		err := rows.Scan(
			&plan.ID,
			&plan.Name,
			&plan.Slug,
			&plan.IntervalID,
			&plan.ProductID,
			&plan.IsActive,
			&plan.HasTrial,
			&plan.TrialIntervalID,
			&plan.IntervalCount,
			&plan.TrialIntervalCount,
			&plan.Description,
			&plan.Type,
			&plan.MaxUsersPerTenant,
			&plan.MeterID,
			&plan.IsVisible,
			&plan.CreatedAt,
			&plan.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan plan: %w", err)
		}
		plans = append(plans, plan)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating plans: %w", err)
	}

	return plans, total, nil
}
