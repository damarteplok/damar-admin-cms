package domain

import (
	"context"
	"time"
)

// User represents a user entity
type User struct {
	ID              int64
	Name            string
	Email           string
	EmailVerified   bool
	EmailVerifiedAt *time.Time
	PasswordHash    string
	PublicName      *string
	IsAdmin         bool
	IsBlocked       bool
	PhoneNumber     *string
	Position        *string
	LastLoginAt     *time.Time
	CreatedAt       *time.Time
	UpdatedAt       *time.Time
}

// UserRepository defines the interface for user data access
type UserRepository interface {
	GetByID(ctx context.Context, id int64) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Create(ctx context.Context, user *User) (*User, error)
	Update(ctx context.Context, user *User) (*User, error)
	Delete(ctx context.Context, id int64) error
	GetAll(ctx context.Context, page, perPage int) ([]*User, int64, error)
	Search(ctx context.Context, query string, page, perPage int) ([]*User, int64, error)
	BulkDelete(ctx context.Context, ids []int64) (int32, error)
	BulkUpdateBlockStatus(ctx context.Context, ids []int64, isBlocked bool) (int32, error)
	UpdateEmailVerification(ctx context.Context, userID int64, verified bool) error
	UpdatePasswordHash(ctx context.Context, userID int64, passwordHash string) error
	UpdateLastLogin(ctx context.Context, userID int64) error
}

// UserService defines business logic for users
type UserService interface {
	GetUserByID(ctx context.Context, id int64) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	CreateUser(ctx context.Context, user *User) (*User, error)
	UpdateUser(ctx context.Context, user *User) (*User, error)
	DeleteUser(ctx context.Context, id int64) error
	GetAllUsers(ctx context.Context, page, perPage int) ([]*User, int64, error)
	SearchUsers(ctx context.Context, query string, page, perPage int) ([]*User, int64, error)
	BulkDeleteUsers(ctx context.Context, ids []int64) (int32, error)
	BulkBlockUsers(ctx context.Context, ids []int64, isBlocked bool) (int32, error)
	UpdateEmailVerification(ctx context.Context, userID int64, verified bool) error
	UpdatePasswordHash(ctx context.Context, userID int64, passwordHash string) error
	UpdateLastLogin(ctx context.Context, userID int64) error
}
