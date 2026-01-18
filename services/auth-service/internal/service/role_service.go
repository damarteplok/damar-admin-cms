package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
)

type RoleService struct {
	roleRepo       domain.RoleRepository
	permissionRepo domain.PermissionRepository
}

func NewRoleService(roleRepo domain.RoleRepository, permissionRepo domain.PermissionRepository) domain.RoleService {
	return &RoleService{
		roleRepo:       roleRepo,
		permissionRepo: permissionRepo,
	}
}

func (s *RoleService) Create(ctx context.Context, name, guardName string, permissionIDs []int64) (*domain.Role, error) {
	if name == "" {
		return nil, errors.New("role name is required")
	}

	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	// Check if role already exists
	existing, _ := s.roleRepo.GetByName(ctx, name, guardName)
	if existing != nil {
		return nil, fmt.Errorf("role '%s' already exists for guard '%s'", name, guardName)
	}

	role := &domain.Role{
		Name:      name,
		GuardName: guardName,
	}

	createdRole, err := s.roleRepo.Create(ctx, role)
	if err != nil {
		return nil, err
	}

	// Assign permissions if provided
	if len(permissionIDs) > 0 {
		for _, permissionID := range permissionIDs {
			// Verify permission exists
			_, err := s.permissionRepo.GetByID(ctx, permissionID)
			if err != nil {
				// Log but don't fail - permission might not exist
				continue
			}
			_ = s.roleRepo.AssignPermission(ctx, createdRole.ID, permissionID)
		}
	}

	return createdRole, nil
}

func (s *RoleService) GetByID(ctx context.Context, id int64) (*domain.Role, error) {
	if id <= 0 {
		return nil, errors.New("invalid role ID")
	}

	return s.roleRepo.GetByID(ctx, id)
}

func (s *RoleService) GetWithPermissions(ctx context.Context, id int64) (*domain.RoleWithPermissions, error) {
	if id <= 0 {
		return nil, errors.New("invalid role ID")
	}

	return s.roleRepo.GetWithPermissions(ctx, id)
}

func (s *RoleService) Update(ctx context.Context, id int64, name, guardName string) (*domain.Role, error) {
	if id <= 0 {
		return nil, errors.New("invalid role ID")
	}

	if name == "" {
		return nil, errors.New("role name is required")
	}

	// Get existing role
	role, err := s.roleRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if guardName == "" {
		guardName = role.GuardName
	}

	// Check if new name conflicts with existing role
	if name != role.Name || guardName != role.GuardName {
		existing, _ := s.roleRepo.GetByName(ctx, name, guardName)
		if existing != nil && existing.ID != id {
			return nil, fmt.Errorf("role '%s' already exists for guard '%s'", name, guardName)
		}
	}

	role.Name = name
	role.GuardName = guardName

	return s.roleRepo.Update(ctx, role)
}

func (s *RoleService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid role ID")
	}

	return s.roleRepo.Delete(ctx, id)
}

func (s *RoleService) List(ctx context.Context, params *domain.RoleListParams) ([]*domain.Role, int, error) {
	if params == nil {
		params = &domain.RoleListParams{
			Page:    1,
			PerPage: 10,
		}
	}

	return s.roleRepo.List(ctx, params)
}

// Role-Permission operations

func (s *RoleService) SyncPermissions(ctx context.Context, roleID int64, permissionIDs []int64) (*domain.RoleWithPermissions, error) {
	if roleID <= 0 {
		return nil, errors.New("invalid role ID")
	}

	// Verify role exists
	_, err := s.roleRepo.GetByID(ctx, roleID)
	if err != nil {
		return nil, err
	}

	// Verify all permissions exist
	for _, permissionID := range permissionIDs {
		_, err := s.permissionRepo.GetByID(ctx, permissionID)
		if err != nil {
			return nil, fmt.Errorf("permission ID %d not found", permissionID)
		}
	}

	err = s.roleRepo.SyncPermissions(ctx, roleID, permissionIDs)
	if err != nil {
		return nil, err
	}

	return s.roleRepo.GetWithPermissions(ctx, roleID)
}

func (s *RoleService) AssignPermission(ctx context.Context, roleID, permissionID int64) (*domain.RoleWithPermissions, error) {
	if roleID <= 0 {
		return nil, errors.New("invalid role ID")
	}

	if permissionID <= 0 {
		return nil, errors.New("invalid permission ID")
	}

	// Verify role exists
	_, err := s.roleRepo.GetByID(ctx, roleID)
	if err != nil {
		return nil, err
	}

	// Verify permission exists
	_, err = s.permissionRepo.GetByID(ctx, permissionID)
	if err != nil {
		return nil, err
	}

	err = s.roleRepo.AssignPermission(ctx, roleID, permissionID)
	if err != nil {
		return nil, err
	}

	return s.roleRepo.GetWithPermissions(ctx, roleID)
}

func (s *RoleService) RevokePermission(ctx context.Context, roleID, permissionID int64) (*domain.RoleWithPermissions, error) {
	if roleID <= 0 {
		return nil, errors.New("invalid role ID")
	}

	if permissionID <= 0 {
		return nil, errors.New("invalid permission ID")
	}

	err := s.roleRepo.RevokePermission(ctx, roleID, permissionID)
	if err != nil {
		return nil, err
	}

	return s.roleRepo.GetWithPermissions(ctx, roleID)
}

// User-Role operations

func (s *RoleService) AssignToUser(ctx context.Context, roleID, userID int64, modelType string) ([]*domain.Role, error) {
	if roleID <= 0 {
		return nil, errors.New("invalid role ID")
	}

	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	// Verify role exists
	_, err := s.roleRepo.GetByID(ctx, roleID)
	if err != nil {
		return nil, err
	}

	err = s.roleRepo.AssignToModel(ctx, roleID, userID, modelType)
	if err != nil {
		return nil, err
	}

	return s.roleRepo.GetByModelID(ctx, userID, modelType)
}

func (s *RoleService) RevokeFromUser(ctx context.Context, roleID, userID int64, modelType string) ([]*domain.Role, error) {
	if roleID <= 0 {
		return nil, errors.New("invalid role ID")
	}

	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	err := s.roleRepo.RevokeFromModel(ctx, roleID, userID, modelType)
	if err != nil {
		return nil, err
	}

	return s.roleRepo.GetByModelID(ctx, userID, modelType)
}

func (s *RoleService) GetUserRoles(ctx context.Context, userID int64, modelType string) ([]*domain.Role, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	return s.roleRepo.GetByModelID(ctx, userID, modelType)
}

func (s *RoleService) SyncUserRoles(ctx context.Context, userID int64, roleIDs []int64, modelType string) ([]*domain.Role, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	// Verify all roles exist
	for _, roleID := range roleIDs {
		_, err := s.roleRepo.GetByID(ctx, roleID)
		if err != nil {
			return nil, fmt.Errorf("role ID %d not found", roleID)
		}
	}

	err := s.roleRepo.SyncModelRoles(ctx, userID, modelType, roleIDs)
	if err != nil {
		return nil, err
	}

	return s.roleRepo.GetByModelID(ctx, userID, modelType)
}
