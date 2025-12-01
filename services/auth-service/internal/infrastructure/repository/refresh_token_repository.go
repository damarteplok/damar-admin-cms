package repository

import (
"context"
"fmt"

"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
"github.com/jackc/pgx/v5/pgxpool"
)

type RefreshTokenRepository struct {
	db *pgxpool.Pool
}

func NewRefreshTokenRepository(db *pgxpool.Pool) domain.RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(ctx context.Context, token *domain.RefreshToken) (*domain.RefreshToken, error) {
	query := `
		INSERT INTO refresh_tokens (user_id, token, expires_at, revoked)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
ctx,
query,
token.UserID,
token.Token,
token.ExpiresAt,
token.Revoked,
).Scan(&token.ID, &token.CreatedAt, &token.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create refresh token: %w", err)
	}

	return token, nil
}

func (r *RefreshTokenRepository) GetByToken(ctx context.Context, token string) (*domain.RefreshToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, revoked, created_at, updated_at
		FROM refresh_tokens
		WHERE token = $1
	`

	rt := &domain.RefreshToken{}
	err := r.db.QueryRow(ctx, query, token).Scan(
&rt.ID,
		&rt.UserID,
		&rt.Token,
		&rt.ExpiresAt,
		&rt.Revoked,
		&rt.CreatedAt,
		&rt.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get refresh token: %w", err)
	}

	return rt, nil
}

func (r *RefreshTokenRepository) RevokeByUserID(ctx context.Context, userID int64) error {
	query := `
		UPDATE refresh_tokens
		SET revoked = true, updated_at = NOW()
		WHERE user_id = $1 AND revoked = false
	`

	_, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to revoke tokens for user: %w", err)
	}

	return nil
}

func (r *RefreshTokenRepository) RevokeByToken(ctx context.Context, token string) error {
	query := `
		UPDATE refresh_tokens
		SET revoked = true, updated_at = NOW()
		WHERE token = $1
	`

	_, err := r.db.Exec(ctx, query, token)
	if err != nil {
		return fmt.Errorf("failed to revoke token: %w", err)
	}

	return nil
}

func (r *RefreshTokenRepository) DeleteExpired(ctx context.Context) error {
	query := `
		DELETE FROM refresh_tokens
		WHERE expires_at < NOW()
	`

	_, err := r.db.Exec(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to delete expired tokens: %w", err)
	}

	return nil
}
