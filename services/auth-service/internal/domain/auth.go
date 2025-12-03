package domain

import (
	"context"
	"time"
)

type RefreshToken struct {
	ID        int64
	UserID    int64
	Token     string
	ExpiresAt time.Time
	Revoked   bool
	CreatedAt *time.Time
	UpdatedAt *time.Time
}

type PasswordResetToken struct {
	ID        int64
	Email     string
	Token     string
	ExpiresAt time.Time
	CreatedAt *time.Time
}

type EmailVerificationToken struct {
	ID        int64
	UserID    int64
	Email     string
	Token     string
	ExpiresAt time.Time
	CreatedAt *time.Time
}

type User struct {
	ID        int64
	Name      string
	Email     string
	IsAdmin   bool
	IsBlocked bool
}

type LoginData struct {
	AccessToken  string
	RefreshToken string
	User         *User
}

type RefreshTokenData struct {
	AccessToken  string
	RefreshToken string
}

type RefreshTokenRepository interface {
	Create(ctx context.Context, token *RefreshToken) (*RefreshToken, error)
	GetByToken(ctx context.Context, token string) (*RefreshToken, error)
	RevokeByUserID(ctx context.Context, userID int64) error
	RevokeByToken(ctx context.Context, token string) error
	DeleteExpired(ctx context.Context) error
}

type PasswordResetTokenRepository interface {
	Create(ctx context.Context, token *PasswordResetToken) (*PasswordResetToken, error)
	GetByToken(ctx context.Context, token string) (*PasswordResetToken, error)
	DeleteByEmail(ctx context.Context, email string) error
	DeleteExpired(ctx context.Context) error
}

type EmailVerificationTokenRepository interface {
	Create(ctx context.Context, token *EmailVerificationToken) (*EmailVerificationToken, error)
	GetByToken(ctx context.Context, token string) (*EmailVerificationToken, error)
	DeleteByUserID(ctx context.Context, userID int64) error
	DeleteExpired(ctx context.Context) error
}

type AuthService interface {
	Login(ctx context.Context, email, password string) (*LoginData, error)
	Logout(ctx context.Context, refreshToken string, userID int64) error
	RefreshToken(ctx context.Context, refreshToken string) (*RefreshTokenData, error)
	ValidateToken(ctx context.Context, token string) (*User, error)
	ChangePassword(ctx context.Context, userID int64, oldPassword, newPassword string) error
	ForgotPassword(ctx context.Context, email string) (string, error)
	ResetPassword(ctx context.Context, token, newPassword string) error
	VerifyResetToken(ctx context.Context, token string) (string, error)
	SendVerificationEmail(ctx context.Context, userID int64, email string) (string, error)
	VerifyEmail(ctx context.Context, token string) (int64, error)
}
