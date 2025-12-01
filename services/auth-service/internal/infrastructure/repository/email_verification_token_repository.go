package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type emailVerificationTokenRepository struct {
	db *pgxpool.Pool
}

func NewEmailVerificationTokenRepository(db *pgxpool.Pool) domain.EmailVerificationTokenRepository {
	return &emailVerificationTokenRepository{db: db}
}

func (r *emailVerificationTokenRepository) Create(ctx context.Context, token *domain.EmailVerificationToken) (*domain.EmailVerificationToken, error) {
	query := `
		INSERT INTO email_verification_tokens (user_id, email, token, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, email, token, expires_at, created_at
	`

	now := time.Now()
	token.CreatedAt = &now

	err := r.db.QueryRow(
		ctx,
		query,
		token.UserID,
		token.Email,
		token.Token,
		token.ExpiresAt,
		token.CreatedAt,
	).Scan(
		&token.ID,
		&token.UserID,
		&token.Email,
		&token.Token,
		&token.ExpiresAt,
		&token.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create email verification token: %w", err)
	}

	return token, nil
}

func (r *emailVerificationTokenRepository) GetByToken(ctx context.Context, token string) (*domain.EmailVerificationToken, error) {
	query := `
		SELECT id, user_id, email, token, expires_at, created_at
		FROM email_verification_tokens
		WHERE token = $1
	`

	verificationToken := &domain.EmailVerificationToken{}
	err := r.db.QueryRow(ctx, query, token).Scan(
		&verificationToken.ID,
		&verificationToken.UserID,
		&verificationToken.Email,
		&verificationToken.Token,
		&verificationToken.ExpiresAt,
		&verificationToken.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("email verification token not found: %w", err)
	}

	return verificationToken, nil
}

func (r *emailVerificationTokenRepository) DeleteByUserID(ctx context.Context, userID int64) error {
	query := `DELETE FROM email_verification_tokens WHERE user_id = $1`

	_, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete email verification tokens: %w", err)
	}

	return nil
}

func (r *emailVerificationTokenRepository) DeleteExpired(ctx context.Context) error {
	query := `DELETE FROM email_verification_tokens WHERE expires_at < $1`

	_, err := r.db.Exec(ctx, query, time.Now())
	if err != nil {
		return fmt.Errorf("failed to delete expired email verification tokens: %w", err)
	}

	return nil
}
