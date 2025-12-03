package repository

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) domain.UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, id int64) (*domain.User, error) {
	query := `
		SELECT id, name, email, email_verified, email_verified_at, password_hash, 
		       public_name, is_admin, is_blocked, phone_number, position, 
		       last_login_at, created_at, updated_at
		FROM users 
		WHERE id = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.EmailVerified,
		&user.EmailVerifiedAt,
		&user.PasswordHash,
		&user.PublicName,
		&user.IsAdmin,
		&user.IsBlocked,
		&user.PhoneNumber,
		&user.Position,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, name, email, email_verified, email_verified_at, password_hash, 
		       public_name, is_admin, is_blocked, phone_number, position, 
		       last_login_at, created_at, updated_at
		FROM users 
		WHERE email = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.EmailVerified,
		&user.EmailVerifiedAt,
		&user.PasswordHash,
		&user.PublicName,
		&user.IsAdmin,
		&user.IsBlocked,
		&user.PhoneNumber,
		&user.Position,
		&user.LastLoginAt,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}

	return user, nil
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) (*domain.User, error) {
	query := `
		INSERT INTO users (name, email, password_hash, public_name, is_admin, phone_number, position, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		user.Name,
		user.Email,
		user.PasswordHash,
		user.PublicName,
		user.IsAdmin,
		user.PhoneNumber,
		user.Position,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *domain.User) (*domain.User, error) {
	query := `
		UPDATE users 
		SET name = $1, public_name = $2, is_admin = $3, is_blocked = $4, 
		    phone_number = $5, position = $6, updated_at = NOW()
		WHERE id = $7
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		user.Name,
		user.PublicName,
		user.IsAdmin,
		user.IsBlocked,
		user.PhoneNumber,
		user.Position,
		user.ID,
	).Scan(&user.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM users WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

func (r *UserRepository) GetAll(ctx context.Context, page, perPage int) ([]*domain.User, int64, error) {
	offset := (page - 1) * perPage

	var total int64
	countQuery := `SELECT COUNT(*) FROM users`
	err := r.db.QueryRow(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	query := `
		SELECT id, name, email, email_verified, email_verified_at, password_hash, 
		       public_name, is_admin, is_blocked, phone_number, position, 
		       last_login_at, created_at, updated_at
		FROM users 
		ORDER BY id DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, perPage, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get users: %w", err)
	}
	defer rows.Close()

	users := make([]*domain.User, 0)
	for rows.Next() {
		user := &domain.User{}
		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.EmailVerified,
			&user.EmailVerifiedAt,
			&user.PasswordHash,
			&user.PublicName,
			&user.IsAdmin,
			&user.IsBlocked,
			&user.PhoneNumber,
			&user.Position,
			&user.LastLoginAt,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating users: %w", err)
	}

	return users, total, nil
}

func (r *UserRepository) Search(ctx context.Context, query string, page, perPage int) ([]*domain.User, int64, error) {
	offset := (page - 1) * perPage
	searchPattern := "%" + query + "%"

	var total int64
	countQuery := `SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1`
	err := r.db.QueryRow(ctx, countQuery, searchPattern).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	sqlQuery := `
		SELECT id, name, email, email_verified, email_verified_at, password_hash, 
		       public_name, is_admin, is_blocked, phone_number, position, 
		       last_login_at, created_at, updated_at
		FROM users 
		WHERE name ILIKE $1 OR email ILIKE $1
		ORDER BY id DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, sqlQuery, searchPattern, perPage, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to search users: %w", err)
	}
	defer rows.Close()

	users := make([]*domain.User, 0)
	for rows.Next() {
		user := &domain.User{}
		err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.EmailVerified,
			&user.EmailVerifiedAt,
			&user.PasswordHash,
			&user.PublicName,
			&user.IsAdmin,
			&user.IsBlocked,
			&user.PhoneNumber,
			&user.Position,
			&user.LastLoginAt,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating users: %w", err)
	}

	return users, total, nil
}

func (r *UserRepository) BulkDelete(ctx context.Context, ids []int64) (int32, error) {
	query := `DELETE FROM users WHERE id = ANY($1)`

	result, err := r.db.Exec(ctx, query, ids)
	if err != nil {
		return 0, fmt.Errorf("failed to bulk delete users: %w", err)
	}

	return int32(result.RowsAffected()), nil
}

func (r *UserRepository) BulkUpdateBlockStatus(ctx context.Context, ids []int64, isBlocked bool) (int32, error) {
	query := `UPDATE users SET is_blocked = $1, updated_at = NOW() WHERE id = ANY($2)`

	result, err := r.db.Exec(ctx, query, isBlocked, ids)
	if err != nil {
		return 0, fmt.Errorf("failed to bulk update block status: %w", err)
	}

	return int32(result.RowsAffected()), nil
}

func (r *UserRepository) UpdateEmailVerification(ctx context.Context, userID int64, verified bool) error {
	query := `
		UPDATE users 
		SET email_verified = $1, 
		    email_verified_at = CASE WHEN $1 = true THEN NOW() ELSE NULL END,
		    updated_at = NOW()
		WHERE id = $2
	`

	result, err := r.db.Exec(ctx, query, verified, userID)
	if err != nil {
		return fmt.Errorf("failed to update email verification: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

func (r *UserRepository) UpdatePasswordHash(ctx context.Context, userID int64, passwordHash string) error {
	query := `
		UPDATE users 
		SET password_hash = $1, 
		    updated_at = NOW()
		WHERE id = $2
	`

	result, err := r.db.Exec(ctx, query, passwordHash, userID)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

func (r *UserRepository) UpdateLastLogin(ctx context.Context, userID int64) error {
	query := `
		UPDATE users 
		SET last_login_at = NOW(),
		    updated_at = NOW()
		WHERE id = $1
	`

	result, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}
