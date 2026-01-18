package domain

import (
	"context"
	"time"
)

// Role represents a role entity
type Role struct {
	ID        int64
	Name      string
	GuardName string
	CreatedAt *time.Time
	UpdatedAt *time.Time
}

// RoleWithPermissions represents a role with its associated permissions
type RoleWithPermissions struct {
	ID          int64
	Name        string
	GuardName   string
	Permissions []*Permission
	CreatedAt   *time.Time
	UpdatedAt   *time.Time
}

// RoleRepository defines the interface for role data access
type RoleRepository interface {
	// CRUD operations
	Create(ctx context.Context, role *Role) (*Role, error)
	GetByID(ctx context.Context, id int64) (*Role, error)
	GetByName(ctx context.Context, name, guardName string) (*Role, error)
	Update(ctx context.Context, role *Role) (*Role, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, params *RoleListParams) ([]*Role, int, error)

	// Role-Permission operations
	GetWithPermissions(ctx context.Context, id int64) (*RoleWithPermissions, error)
	AssignPermission(ctx context.Context, roleID, permissionID int64) error
	RevokePermission(ctx context.Context, roleID, permissionID int64) error
	SyncPermissions(ctx context.Context, roleID int64, permissionIDs []int64) error
	GetPermissionsByRoleID(ctx context.Context, roleID int64) ([]*Permission, error)

	// Model-Role operations (user-role assignment)
	AssignToModel(ctx context.Context, roleID, modelID int64, modelType string) error
	RevokeFromModel(ctx context.Context, roleID, modelID int64, modelType string) error
	GetByModelID(ctx context.Context, modelID int64, modelType string) ([]*Role, error)
	SyncModelRoles(ctx context.Context, modelID int64, modelType string, roleIDs []int64) error
}

// RoleListParams defines parameters for listing roles
type RoleListParams struct {
	Page      int
	PerPage   int
	Search    string
	SortBy    string
	SortOrder string
	GuardName string
}

// RoleService defines the interface for role business logic
type RoleService interface {
	// CRUD operations
	Create(ctx context.Context, name, guardName string, permissionIDs []int64) (*Role, error)
	GetByID(ctx context.Context, id int64) (*Role, error)
	GetWithPermissions(ctx context.Context, id int64) (*RoleWithPermissions, error)
	Update(ctx context.Context, id int64, name, guardName string) (*Role, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, params *RoleListParams) ([]*Role, int, error)

	// Role-Permission operations
	SyncPermissions(ctx context.Context, roleID int64, permissionIDs []int64) (*RoleWithPermissions, error)
	AssignPermission(ctx context.Context, roleID, permissionID int64) (*RoleWithPermissions, error)
	RevokePermission(ctx context.Context, roleID, permissionID int64) (*RoleWithPermissions, error)

	// User-Role operations
	AssignToUser(ctx context.Context, roleID, userID int64, modelType string) ([]*Role, error)
	RevokeFromUser(ctx context.Context, roleID, userID int64, modelType string) ([]*Role, error)
	GetUserRoles(ctx context.Context, userID int64, modelType string) ([]*Role, error)
	SyncUserRoles(ctx context.Context, userID int64, roleIDs []int64, modelType string) ([]*Role, error)
}
