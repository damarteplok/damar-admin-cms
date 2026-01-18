package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PermissionRepository struct {
	db *pgxpool.Pool
}

func NewPermissionRepository(db *pgxpool.Pool) domain.PermissionRepository {
	return &PermissionRepository{db: db}
}

func (r *PermissionRepository) Create(ctx context.Context, permission *domain.Permission) (*domain.Permission, error) {
	query := `
		INSERT INTO permissions (name, guard_name, created_at, updated_at)
		VALUES ($1, $2, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		permission.Name,
		permission.GuardName,
	).Scan(&permission.ID, &permission.CreatedAt, &permission.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create permission: %w", err)
	}

	return permission, nil
}

func (r *PermissionRepository) GetByID(ctx context.Context, id int64) (*domain.Permission, error) {
	query := `
		SELECT id, name, guard_name, created_at, updated_at
		FROM permissions
		WHERE id = $1
	`

	p := &domain.Permission{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID,
		&p.Name,
		&p.GuardName,
		&p.CreatedAt,
		&p.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("permission not found")
		}
		return nil, fmt.Errorf("failed to get permission: %w", err)
	}

	return p, nil
}

func (r *PermissionRepository) GetByName(ctx context.Context, name, guardName string) (*domain.Permission, error) {
	query := `
		SELECT id, name, guard_name, created_at, updated_at
		FROM permissions
		WHERE name = $1 AND guard_name = $2
	`

	p := &domain.Permission{}
	err := r.db.QueryRow(ctx, query, name, guardName).Scan(
		&p.ID,
		&p.Name,
		&p.GuardName,
		&p.CreatedAt,
		&p.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("permission not found")
		}
		return nil, fmt.Errorf("failed to get permission: %w", err)
	}

	return p, nil
}

func (r *PermissionRepository) Update(ctx context.Context, permission *domain.Permission) (*domain.Permission, error) {
	query := `
		UPDATE permissions
		SET name = $2, guard_name = $3, updated_at = NOW()
		WHERE id = $1
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		permission.ID,
		permission.Name,
		permission.GuardName,
	).Scan(&permission.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("permission not found")
		}
		return nil, fmt.Errorf("failed to update permission: %w", err)
	}

	return permission, nil
}

func (r *PermissionRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM permissions WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete permission: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("permission not found")
	}

	return nil
}

func (r *PermissionRepository) List(ctx context.Context, params *domain.PermissionListParams) ([]*domain.Permission, int, error) {
	// Build WHERE clause
	var conditions []string
	var args []interface{}
	argIndex := 1

	if params.Search != "" {
		conditions = append(conditions, fmt.Sprintf("name ILIKE $%d", argIndex))
		args = append(args, "%"+params.Search+"%")
		argIndex++
	}

	if params.GuardName != "" {
		conditions = append(conditions, fmt.Sprintf("guard_name = $%d", argIndex))
		args = append(args, params.GuardName)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM permissions %s", whereClause)
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count permissions: %w", err)
	}

	// Build ORDER BY clause
	sortBy := "created_at"
	if params.SortBy != "" {
		sortBy = params.SortBy
	}
	sortOrder := "DESC"
	if params.SortOrder != "" && (strings.ToUpper(params.SortOrder) == "ASC" || strings.ToUpper(params.SortOrder) == "DESC") {
		sortOrder = strings.ToUpper(params.SortOrder)
	}

	// Pagination
	page := params.Page
	if page < 1 {
		page = 1
	}
	perPage := params.PerPage
	if perPage < 1 {
		perPage = 10
	}
	offset := (page - 1) * perPage

	// Query with pagination
	query := fmt.Sprintf(`
		SELECT id, name, guard_name, created_at, updated_at
		FROM permissions
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortBy, sortOrder, argIndex, argIndex+1)

	args = append(args, perPage, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list permissions: %w", err)
	}
	defer rows.Close()

	var permissions []*domain.Permission
	for rows.Next() {
		p := &domain.Permission{}
		err := rows.Scan(
			&p.ID,
			&p.Name,
			&p.GuardName,
			&p.CreatedAt,
			&p.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan permission: %w", err)
		}
		permissions = append(permissions, p)
	}

	return permissions, total, nil
}

// Model-Permission operations (direct permission assignment)

func (r *PermissionRepository) AssignToModel(ctx context.Context, permissionID, modelID int64, modelType string) error {
	query := `
		INSERT INTO model_has_permissions (permission_id, model_id, model_type)
		VALUES ($1, $2, $3)
		ON CONFLICT (permission_id, model_id, model_type) DO NOTHING
	`

	_, err := r.db.Exec(ctx, query, permissionID, modelID, modelType)
	if err != nil {
		return fmt.Errorf("failed to assign permission to model: %w", err)
	}

	return nil
}

func (r *PermissionRepository) RevokeFromModel(ctx context.Context, permissionID, modelID int64, modelType string) error {
	query := `
		DELETE FROM model_has_permissions
		WHERE permission_id = $1 AND model_id = $2 AND model_type = $3
	`

	_, err := r.db.Exec(ctx, query, permissionID, modelID, modelType)
	if err != nil {
		return fmt.Errorf("failed to revoke permission from model: %w", err)
	}

	return nil
}

func (r *PermissionRepository) GetByModelID(ctx context.Context, modelID int64, modelType string) ([]*domain.Permission, error) {
	query := `
		SELECT p.id, p.name, p.guard_name, p.created_at, p.updated_at
		FROM permissions p
		INNER JOIN model_has_permissions mhp ON p.id = mhp.permission_id
		WHERE mhp.model_id = $1 AND mhp.model_type = $2
		ORDER BY p.name ASC
	`

	rows, err := r.db.Query(ctx, query, modelID, modelType)
	if err != nil {
		return nil, fmt.Errorf("failed to get permissions by model: %w", err)
	}
	defer rows.Close()

	var permissions []*domain.Permission
	for rows.Next() {
		p := &domain.Permission{}
		err := rows.Scan(
			&p.ID,
			&p.Name,
			&p.GuardName,
			&p.CreatedAt,
			&p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan permission: %w", err)
		}
		permissions = append(permissions, p)
	}

	return permissions, nil
}

func (r *PermissionRepository) SyncModelPermissions(ctx context.Context, modelID int64, modelType string, permissionIDs []int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// Delete all existing permissions for this model
	deleteQuery := `DELETE FROM model_has_permissions WHERE model_id = $1 AND model_type = $2`
	_, err = tx.Exec(ctx, deleteQuery, modelID, modelType)
	if err != nil {
		return fmt.Errorf("failed to delete existing permissions: %w", err)
	}

	// Insert new permissions
	if len(permissionIDs) > 0 {
		insertQuery := `INSERT INTO model_has_permissions (permission_id, model_id, model_type) VALUES ($1, $2, $3)`
		for _, permissionID := range permissionIDs {
			_, err = tx.Exec(ctx, insertQuery, permissionID, modelID, modelType)
			if err != nil {
				return fmt.Errorf("failed to assign permission: %w", err)
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
