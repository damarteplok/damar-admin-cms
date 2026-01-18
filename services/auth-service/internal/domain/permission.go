package domain

import (
	"context"
	"time"
)

// Permission represents a permission entity
type Permission struct {
	ID        int64
	Name      string
	GuardName string
	CreatedAt *time.Time
	UpdatedAt *time.Time
}

// PermissionRepository defines the interface for permission data access
type PermissionRepository interface {
	// CRUD operations
	Create(ctx context.Context, permission *Permission) (*Permission, error)
	GetByID(ctx context.Context, id int64) (*Permission, error)
	GetByName(ctx context.Context, name, guardName string) (*Permission, error)
	Update(ctx context.Context, permission *Permission) (*Permission, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, params *PermissionListParams) ([]*Permission, int, error)

	// Model-Permission operations (direct permission assignment)
	AssignToModel(ctx context.Context, permissionID, modelID int64, modelType string) error
	RevokeFromModel(ctx context.Context, permissionID, modelID int64, modelType string) error
	GetByModelID(ctx context.Context, modelID int64, modelType string) ([]*Permission, error)
	SyncModelPermissions(ctx context.Context, modelID int64, modelType string, permissionIDs []int64) error
}

// PermissionListParams defines parameters for listing permissions
type PermissionListParams struct {
	Page      int
	PerPage   int
	Search    string
	SortBy    string
	SortOrder string
	GuardName string
}

// PermissionService defines the interface for permission business logic
type PermissionService interface {
	// CRUD operations
	Create(ctx context.Context, name, guardName string) (*Permission, error)
	GetByID(ctx context.Context, id int64) (*Permission, error)
	Update(ctx context.Context, id int64, name, guardName string) (*Permission, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, params *PermissionListParams) ([]*Permission, int, error)

	// Direct permission assignment to user
	AssignToUser(ctx context.Context, permissionID, userID int64, modelType string) error
	RevokeFromUser(ctx context.Context, permissionID, userID int64, modelType string) error
	GetUserDirectPermissions(ctx context.Context, userID int64, modelType string) ([]*Permission, error)
	SyncUserPermissions(ctx context.Context, userID int64, modelType string, permissionIDs []int64) ([]*Permission, error)
}
