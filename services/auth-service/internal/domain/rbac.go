package domain

import "context"

// RBACService defines the interface for permission checking logic
type RBACService interface {
	// Get all permissions for a user (direct + via roles)
	GetUserAllPermissions(ctx context.Context, userID int64, modelType string) ([]*Permission, error)

	// Check if user has a specific permission
	HasPermission(ctx context.Context, userID int64, permissionName, modelType, guardName string) (bool, error)

	// Check if user has a specific role
	HasRole(ctx context.Context, userID int64, roleName, modelType, guardName string) (bool, error)

	// Check if user has any of the given permissions
	HasAnyPermission(ctx context.Context, userID int64, permissionNames []string, modelType, guardName string) (bool, error)

	// Check if user has all of the given permissions
	HasAllPermissions(ctx context.Context, userID int64, permissionNames []string, modelType, guardName string) (bool, error)
}

// Default model type for users
const DefaultModelType = "users"

// Default guard name
const DefaultGuardName = "web"
