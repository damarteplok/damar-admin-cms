package service

import (
	"context"
	"errors"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
)

type RBACService struct {
	roleRepo       domain.RoleRepository
	permissionRepo domain.PermissionRepository
}

func NewRBACService(roleRepo domain.RoleRepository, permissionRepo domain.PermissionRepository) domain.RBACService {
	return &RBACService{
		roleRepo:       roleRepo,
		permissionRepo: permissionRepo,
	}
}

// GetUserAllPermissions returns all permissions for a user (direct + via roles)
func (s *RBACService) GetUserAllPermissions(ctx context.Context, userID int64, modelType string) ([]*domain.Permission, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	// Use a map to deduplicate permissions
	permissionMap := make(map[int64]*domain.Permission)

	// Get direct permissions
	directPermissions, err := s.permissionRepo.GetByModelID(ctx, userID, modelType)
	if err != nil {
		return nil, err
	}

	for _, p := range directPermissions {
		permissionMap[p.ID] = p
	}

	// Get permissions via roles
	roles, err := s.roleRepo.GetByModelID(ctx, userID, modelType)
	if err != nil {
		return nil, err
	}

	for _, role := range roles {
		rolePermissions, err := s.roleRepo.GetPermissionsByRoleID(ctx, role.ID)
		if err != nil {
			continue // Skip this role if error
		}

		for _, p := range rolePermissions {
			permissionMap[p.ID] = p
		}
	}

	// Convert map to slice
	permissions := make([]*domain.Permission, 0, len(permissionMap))
	for _, p := range permissionMap {
		permissions = append(permissions, p)
	}

	return permissions, nil
}

// HasPermission checks if user has a specific permission
func (s *RBACService) HasPermission(ctx context.Context, userID int64, permissionName, modelType, guardName string) (bool, error) {
	if userID <= 0 {
		return false, errors.New("invalid user ID")
	}

	if permissionName == "" {
		return false, errors.New("permission name is required")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	// Get all user permissions
	permissions, err := s.GetUserAllPermissions(ctx, userID, modelType)
	if err != nil {
		return false, err
	}

	// Check if user has the permission
	for _, p := range permissions {
		if p.Name == permissionName && p.GuardName == guardName {
			return true, nil
		}
	}

	return false, nil
}

// HasRole checks if user has a specific role
func (s *RBACService) HasRole(ctx context.Context, userID int64, roleName, modelType, guardName string) (bool, error) {
	if userID <= 0 {
		return false, errors.New("invalid user ID")
	}

	if roleName == "" {
		return false, errors.New("role name is required")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	// Get user roles
	roles, err := s.roleRepo.GetByModelID(ctx, userID, modelType)
	if err != nil {
		return false, err
	}

	// Check if user has the role
	for _, r := range roles {
		if r.Name == roleName && r.GuardName == guardName {
			return true, nil
		}
	}

	return false, nil
}

// HasAnyPermission checks if user has any of the given permissions
func (s *RBACService) HasAnyPermission(ctx context.Context, userID int64, permissionNames []string, modelType, guardName string) (bool, error) {
	if userID <= 0 {
		return false, errors.New("invalid user ID")
	}

	if len(permissionNames) == 0 {
		return false, errors.New("permission names are required")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	// Get all user permissions
	permissions, err := s.GetUserAllPermissions(ctx, userID, modelType)
	if err != nil {
		return false, err
	}

	// Create a set of user permission names
	userPermissionSet := make(map[string]bool)
	for _, p := range permissions {
		if p.GuardName == guardName {
			userPermissionSet[p.Name] = true
		}
	}

	// Check if user has any of the requested permissions
	for _, name := range permissionNames {
		if userPermissionSet[name] {
			return true, nil
		}
	}

	return false, nil
}

// HasAllPermissions checks if user has all of the given permissions
func (s *RBACService) HasAllPermissions(ctx context.Context, userID int64, permissionNames []string, modelType, guardName string) (bool, error) {
	if userID <= 0 {
		return false, errors.New("invalid user ID")
	}

	if len(permissionNames) == 0 {
		return false, errors.New("permission names are required")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	// Get all user permissions
	permissions, err := s.GetUserAllPermissions(ctx, userID, modelType)
	if err != nil {
		return false, err
	}

	// Create a set of user permission names
	userPermissionSet := make(map[string]bool)
	for _, p := range permissions {
		if p.GuardName == guardName {
			userPermissionSet[p.Name] = true
		}
	}

	// Check if user has all of the requested permissions
	for _, name := range permissionNames {
		if !userPermissionSet[name] {
			return false, nil
		}
	}

	return true, nil
}
