package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/product-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DiscountCodeRepository struct {
	db *pgxpool.Pool
}

func NewDiscountCodeRepository(db *pgxpool.Pool) domain.DiscountCodeRepository {
	return &DiscountCodeRepository{db: db}
}

func (r *DiscountCodeRepository) GetByID(ctx context.Context, id int64) (*domain.DiscountCode, error) {
	query := `
		SELECT id, discount_id, code, valid_from, valid_until, max_uses, times_used, is_active, created_at, updated_at
		FROM discount_codes 
		WHERE id = $1
	`

	code := &domain.DiscountCode{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&code.ID,
		&code.DiscountID,
		&code.Code,
		&code.ValidFrom,
		&code.ValidUntil,
		&code.MaxUses,
		&code.TimesUsed,
		&code.IsActive,
		&code.CreatedAt,
		&code.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get discount code by ID: %w", err)
	}

	return code, nil
}

func (r *DiscountCodeRepository) GetByCode(ctx context.Context, code string) (*domain.DiscountCode, error) {
	query := `
		SELECT id, discount_id, code, valid_from, valid_until, max_uses, times_used, is_active, created_at, updated_at
		FROM discount_codes 
		WHERE code = $1
	`

	discountCode := &domain.DiscountCode{}
	err := r.db.QueryRow(ctx, query, code).Scan(
		&discountCode.ID,
		&discountCode.DiscountID,
		&discountCode.Code,
		&discountCode.ValidFrom,
		&discountCode.ValidUntil,
		&discountCode.MaxUses,
		&discountCode.TimesUsed,
		&discountCode.IsActive,
		&discountCode.CreatedAt,
		&discountCode.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get discount code by code: %w", err)
	}

	return discountCode, nil
}

func (r *DiscountCodeRepository) GetByDiscount(ctx context.Context, discountID int64) ([]*domain.DiscountCode, error) {
	query := `
		SELECT id, discount_id, code, valid_from, valid_until, max_uses, times_used, is_active, created_at, updated_at
		FROM discount_codes 
		WHERE discount_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, discountID)
	if err != nil {
		return nil, fmt.Errorf("failed to get discount codes by discount: %w", err)
	}
	defer rows.Close()

	codes := make([]*domain.DiscountCode, 0)
	for rows.Next() {
		code := &domain.DiscountCode{}
		err := rows.Scan(
			&code.ID,
			&code.DiscountID,
			&code.Code,
			&code.ValidFrom,
			&code.ValidUntil,
			&code.MaxUses,
			&code.TimesUsed,
			&code.IsActive,
			&code.CreatedAt,
			&code.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan discount code: %w", err)
		}
		codes = append(codes, code)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating discount codes: %w", err)
	}

	return codes, nil
}

func (r *DiscountCodeRepository) Create(ctx context.Context, code *domain.DiscountCode) error {
	query := `
		INSERT INTO discount_codes (discount_id, code, valid_from, valid_until, max_uses, times_used, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		code.DiscountID,
		code.Code,
		code.ValidFrom,
		code.ValidUntil,
		code.MaxUses,
		code.TimesUsed,
		code.IsActive,
	).Scan(&code.ID, &code.CreatedAt, &code.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create discount code: %w", err)
	}

	return nil
}

func (r *DiscountCodeRepository) Update(ctx context.Context, code *domain.DiscountCode) error {
	query := `
		UPDATE discount_codes 
		SET discount_id = $1, code = $2, valid_from = $3, valid_until = $4,
		    max_uses = $5, times_used = $6, is_active = $7, updated_at = NOW()
		WHERE id = $8
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		code.DiscountID,
		code.Code,
		code.ValidFrom,
		code.ValidUntil,
		code.MaxUses,
		code.TimesUsed,
		code.IsActive,
		code.ID,
	).Scan(&code.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to update discount code: %w", err)
	}

	return nil
}

func (r *DiscountCodeRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM discount_codes WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete discount code: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("discount code not found")
	}

	return nil
}

func (r *DiscountCodeRepository) GetAll(ctx context.Context, page, perPage int, activeOnly bool) ([]*domain.DiscountCode, int, error) {
	offset := (page - 1) * perPage

	countQuery := `SELECT COUNT(*) FROM discount_codes WHERE 1=1`
	query := `
		SELECT id, discount_id, code, valid_from, valid_until, max_uses, times_used, is_active, created_at, updated_at
		FROM discount_codes 
		WHERE 1=1
	`

	if activeOnly {
		countQuery += ` AND is_active = true`
		query += ` AND is_active = true`
	}

	var total int
	err := r.db.QueryRow(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count discount codes: %w", err)
	}

	query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(ctx, query, perPage, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get discount codes: %w", err)
	}
	defer rows.Close()

	codes := make([]*domain.DiscountCode, 0)
	for rows.Next() {
		code := &domain.DiscountCode{}
		err := rows.Scan(
			&code.ID,
			&code.DiscountID,
			&code.Code,
			&code.ValidFrom,
			&code.ValidUntil,
			&code.MaxUses,
			&code.TimesUsed,
			&code.IsActive,
			&code.CreatedAt,
			&code.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan discount code: %w", err)
		}
		codes = append(codes, code)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating discount codes: %w", err)
	}

	return codes, total, nil
}

func (r *DiscountCodeRepository) IncrementUsage(ctx context.Context, id int64) error {
	query := `UPDATE discount_codes SET times_used = times_used + 1, updated_at = NOW() WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to increment usage: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("discount code not found")
	}

	return nil
}
