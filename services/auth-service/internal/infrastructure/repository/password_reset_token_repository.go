package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type passwordResetTokenRepository struct {
	db *pgxpool.Pool
}

func NewPasswordResetTokenRepository(db *pgxpool.Pool) domain.PasswordResetTokenRepository {
	return &passwordResetTokenRepository{db: db}
}

func (r *passwordResetTokenRepository) Create(ctx context.Context, token *domain.PasswordResetToken) (*domain.PasswordResetToken, error) {
	query := `
		INSERT INTO password_reset_tokens (email, token, expires_at, created_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, email, token, expires_at, created_at
	`

	now := time.Now()
	token.CreatedAt = &now

	err := r.db.QueryRow(
		ctx,
		query,
		token.Email,
		token.Token,
		token.ExpiresAt,
		token.CreatedAt,
	).Scan(
		&token.ID,
		&token.Email,
		&token.Token,
		&token.ExpiresAt,
		&token.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create password reset token: %w", err)
	}

	return token, nil
}

func (r *passwordResetTokenRepository) GetByToken(ctx context.Context, token string) (*domain.PasswordResetToken, error) {
	query := `
		SELECT id, email, token, expires_at, created_at
		FROM password_reset_tokens
		WHERE token = $1
	`

	resetToken := &domain.PasswordResetToken{}
	err := r.db.QueryRow(ctx, query, token).Scan(
		&resetToken.ID,
		&resetToken.Email,
		&resetToken.Token,
		&resetToken.ExpiresAt,
		&resetToken.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("password reset token not found: %w", err)
	}

	return resetToken, nil
}

func (r *passwordResetTokenRepository) DeleteByEmail(ctx context.Context, email string) error {
	query := `DELETE FROM password_reset_tokens WHERE email = $1`

	_, err := r.db.Exec(ctx, query, email)
	if err != nil {
		return fmt.Errorf("failed to delete password reset tokens: %w", err)
	}

	return nil
}

func (r *passwordResetTokenRepository) DeleteExpired(ctx context.Context) error {
	query := `DELETE FROM password_reset_tokens WHERE expires_at < $1`

	_, err := r.db.Exec(ctx, query, time.Now())
	if err != nil {
		return fmt.Errorf("failed to delete expired password reset tokens: %w", err)
	}

	return nil
}
