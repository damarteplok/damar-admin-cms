package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RoleRepository struct {
	db *pgxpool.Pool
}

func NewRoleRepository(db *pgxpool.Pool) domain.RoleRepository {
	return &RoleRepository{db: db}
}

func (r *RoleRepository) Create(ctx context.Context, role *domain.Role) (*domain.Role, error) {
	query := `
		INSERT INTO roles (name, guard_name, created_at, updated_at)
		VALUES ($1, $2, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		role.Name,
		role.GuardName,
	).Scan(&role.ID, &role.CreatedAt, &role.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}

	return role, nil
}

func (r *RoleRepository) GetByID(ctx context.Context, id int64) (*domain.Role, error) {
	query := `
		SELECT id, name, guard_name, created_at, updated_at
		FROM roles
		WHERE id = $1
	`

	role := &domain.Role{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&role.ID,
		&role.Name,
		&role.GuardName,
		&role.CreatedAt,
		&role.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("role not found")
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	return role, nil
}

func (r *RoleRepository) GetByName(ctx context.Context, name, guardName string) (*domain.Role, error) {
	query := `
		SELECT id, name, guard_name, created_at, updated_at
		FROM roles
		WHERE name = $1 AND guard_name = $2
	`

	role := &domain.Role{}
	err := r.db.QueryRow(ctx, query, name, guardName).Scan(
		&role.ID,
		&role.Name,
		&role.GuardName,
		&role.CreatedAt,
		&role.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("role not found")
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	return role, nil
}

func (r *RoleRepository) Update(ctx context.Context, role *domain.Role) (*domain.Role, error) {
	query := `
		UPDATE roles
		SET name = $2, guard_name = $3, updated_at = NOW()
		WHERE id = $1
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		role.ID,
		role.Name,
		role.GuardName,
	).Scan(&role.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("role not found")
		}
		return nil, fmt.Errorf("failed to update role: %w", err)
	}

	return role, nil
}

func (r *RoleRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM roles WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete role: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("role not found")
	}

	return nil
}

func (r *RoleRepository) List(ctx context.Context, params *domain.RoleListParams) ([]*domain.Role, int, error) {
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
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM roles %s", whereClause)
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count roles: %w", err)
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
		FROM roles
		%s
		ORDER BY %s %s
		LIMIT $%d OFFSET $%d
	`, whereClause, sortBy, sortOrder, argIndex, argIndex+1)

	args = append(args, perPage, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list roles: %w", err)
	}
	defer rows.Close()

	var roles []*domain.Role
	for rows.Next() {
		role := &domain.Role{}
		err := rows.Scan(
			&role.ID,
			&role.Name,
			&role.GuardName,
			&role.CreatedAt,
			&role.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan role: %w", err)
		}
		roles = append(roles, role)
	}

	return roles, total, nil
}

// Role-Permission operations

func (r *RoleRepository) GetWithPermissions(ctx context.Context, id int64) (*domain.RoleWithPermissions, error) {
	// Get role
	role, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Get permissions
	permissions, err := r.GetPermissionsByRoleID(ctx, id)
	if err != nil {
		return nil, err
	}

	return &domain.RoleWithPermissions{
		ID:          role.ID,
		Name:        role.Name,
		GuardName:   role.GuardName,
		Permissions: permissions,
		CreatedAt:   role.CreatedAt,
		UpdatedAt:   role.UpdatedAt,
	}, nil
}

func (r *RoleRepository) AssignPermission(ctx context.Context, roleID, permissionID int64) error {
	query := `
		INSERT INTO role_has_permissions (role_id, permission_id)
		VALUES ($1, $2)
		ON CONFLICT (permission_id, role_id) DO NOTHING
	`

	_, err := r.db.Exec(ctx, query, roleID, permissionID)
	if err != nil {
		return fmt.Errorf("failed to assign permission to role: %w", err)
	}

	return nil
}

func (r *RoleRepository) RevokePermission(ctx context.Context, roleID, permissionID int64) error {
	query := `
		DELETE FROM role_has_permissions
		WHERE role_id = $1 AND permission_id = $2
	`

	_, err := r.db.Exec(ctx, query, roleID, permissionID)
	if err != nil {
		return fmt.Errorf("failed to revoke permission from role: %w", err)
	}

	return nil
}

func (r *RoleRepository) SyncPermissions(ctx context.Context, roleID int64, permissionIDs []int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// Delete all existing permissions for this role
	deleteQuery := `DELETE FROM role_has_permissions WHERE role_id = $1`
	_, err = tx.Exec(ctx, deleteQuery, roleID)
	if err != nil {
		return fmt.Errorf("failed to delete existing permissions: %w", err)
	}

	// Insert new permissions
	if len(permissionIDs) > 0 {
		insertQuery := `INSERT INTO role_has_permissions (role_id, permission_id) VALUES ($1, $2)`
		for _, permissionID := range permissionIDs {
			_, err = tx.Exec(ctx, insertQuery, roleID, permissionID)
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

func (r *RoleRepository) GetPermissionsByRoleID(ctx context.Context, roleID int64) ([]*domain.Permission, error) {
	query := `
		SELECT p.id, p.name, p.guard_name, p.created_at, p.updated_at
		FROM permissions p
		INNER JOIN role_has_permissions rhp ON p.id = rhp.permission_id
		WHERE rhp.role_id = $1
		ORDER BY p.name ASC
	`

	rows, err := r.db.Query(ctx, query, roleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get permissions by role: %w", err)
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

// Model-Role operations (user-role assignment)

func (r *RoleRepository) AssignToModel(ctx context.Context, roleID, modelID int64, modelType string) error {
	query := `
		INSERT INTO model_has_roles (role_id, model_id, model_type)
		VALUES ($1, $2, $3)
		ON CONFLICT (role_id, model_id, model_type) DO NOTHING
	`

	_, err := r.db.Exec(ctx, query, roleID, modelID, modelType)
	if err != nil {
		return fmt.Errorf("failed to assign role to model: %w", err)
	}

	return nil
}

func (r *RoleRepository) RevokeFromModel(ctx context.Context, roleID, modelID int64, modelType string) error {
	query := `
		DELETE FROM model_has_roles
		WHERE role_id = $1 AND model_id = $2 AND model_type = $3
	`

	_, err := r.db.Exec(ctx, query, roleID, modelID, modelType)
	if err != nil {
		return fmt.Errorf("failed to revoke role from model: %w", err)
	}

	return nil
}

func (r *RoleRepository) GetByModelID(ctx context.Context, modelID int64, modelType string) ([]*domain.Role, error) {
	query := `
		SELECT r.id, r.name, r.guard_name, r.created_at, r.updated_at
		FROM roles r
		INNER JOIN model_has_roles mhr ON r.id = mhr.role_id
		WHERE mhr.model_id = $1 AND mhr.model_type = $2
		ORDER BY r.name ASC
	`

	rows, err := r.db.Query(ctx, query, modelID, modelType)
	if err != nil {
		return nil, fmt.Errorf("failed to get roles by model: %w", err)
	}
	defer rows.Close()

	var roles []*domain.Role
	for rows.Next() {
		role := &domain.Role{}
		err := rows.Scan(
			&role.ID,
			&role.Name,
			&role.GuardName,
			&role.CreatedAt,
			&role.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan role: %w", err)
		}
		roles = append(roles, role)
	}

	return roles, nil
}

func (r *RoleRepository) SyncModelRoles(ctx context.Context, modelID int64, modelType string, roleIDs []int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// Delete all existing roles for this model
	deleteQuery := `DELETE FROM model_has_roles WHERE model_id = $1 AND model_type = $2`
	_, err = tx.Exec(ctx, deleteQuery, modelID, modelType)
	if err != nil {
		return fmt.Errorf("failed to delete existing roles: %w", err)
	}

	// Insert new roles
	if len(roleIDs) > 0 {
		insertQuery := `INSERT INTO model_has_roles (role_id, model_id, model_type) VALUES ($1, $2, $3)`
		for _, roleID := range roleIDs {
			_, err = tx.Exec(ctx, insertQuery, roleID, modelID, modelType)
			if err != nil {
				return fmt.Errorf("failed to assign role: %w", err)
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
