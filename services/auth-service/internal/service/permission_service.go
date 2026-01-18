package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
)

type PermissionService struct {
	permissionRepo domain.PermissionRepository
}

func NewPermissionService(permissionRepo domain.PermissionRepository) domain.PermissionService {
	return &PermissionService{
		permissionRepo: permissionRepo,
	}
}

func (s *PermissionService) Create(ctx context.Context, name, guardName string) (*domain.Permission, error) {
	if name == "" {
		return nil, errors.New("permission name is required")
	}

	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	// Check if permission already exists
	existing, _ := s.permissionRepo.GetByName(ctx, name, guardName)
	if existing != nil {
		return nil, fmt.Errorf("permission '%s' already exists for guard '%s'", name, guardName)
	}

	permission := &domain.Permission{
		Name:      name,
		GuardName: guardName,
	}

	return s.permissionRepo.Create(ctx, permission)
}

func (s *PermissionService) GetByID(ctx context.Context, id int64) (*domain.Permission, error) {
	if id <= 0 {
		return nil, errors.New("invalid permission ID")
	}

	return s.permissionRepo.GetByID(ctx, id)
}

func (s *PermissionService) Update(ctx context.Context, id int64, name, guardName string) (*domain.Permission, error) {
	if id <= 0 {
		return nil, errors.New("invalid permission ID")
	}

	if name == "" {
		return nil, errors.New("permission name is required")
	}

	// Get existing permission
	permission, err := s.permissionRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if guardName == "" {
		guardName = permission.GuardName
	}

	// Check if new name conflicts with existing permission
	if name != permission.Name || guardName != permission.GuardName {
		existing, _ := s.permissionRepo.GetByName(ctx, name, guardName)
		if existing != nil && existing.ID != id {
			return nil, fmt.Errorf("permission '%s' already exists for guard '%s'", name, guardName)
		}
	}

	permission.Name = name
	permission.GuardName = guardName

	return s.permissionRepo.Update(ctx, permission)
}

func (s *PermissionService) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid permission ID")
	}

	return s.permissionRepo.Delete(ctx, id)
}

func (s *PermissionService) List(ctx context.Context, params *domain.PermissionListParams) ([]*domain.Permission, int, error) {
	if params == nil {
		params = &domain.PermissionListParams{
			Page:    1,
			PerPage: 10,
		}
	}

	return s.permissionRepo.List(ctx, params)
}

func (s *PermissionService) AssignToUser(ctx context.Context, permissionID, userID int64, modelType string) error {
	if permissionID <= 0 {
		return errors.New("invalid permission ID")
	}

	if userID <= 0 {
		return errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	// Verify permission exists
	_, err := s.permissionRepo.GetByID(ctx, permissionID)
	if err != nil {
		return fmt.Errorf("permission not found: %w", err)
	}

	return s.permissionRepo.AssignToModel(ctx, permissionID, userID, modelType)
}

func (s *PermissionService) RevokeFromUser(ctx context.Context, permissionID, userID int64, modelType string) error {
	if permissionID <= 0 {
		return errors.New("invalid permission ID")
	}

	if userID <= 0 {
		return errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	return s.permissionRepo.RevokeFromModel(ctx, permissionID, userID, modelType)
}

func (s *PermissionService) GetUserDirectPermissions(ctx context.Context, userID int64, modelType string) ([]*domain.Permission, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	return s.permissionRepo.GetByModelID(ctx, userID, modelType)
}

func (s *PermissionService) SyncUserPermissions(ctx context.Context, userID int64, modelType string, permissionIDs []int64) ([]*domain.Permission, error) {
	if userID <= 0 {
		return nil, errors.New("invalid user ID")
	}

	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	// Sync permissions
	err := s.permissionRepo.SyncModelPermissions(ctx, userID, modelType, permissionIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to sync user permissions: %w", err)
	}

	// Return updated permissions
	return s.permissionRepo.GetByModelID(ctx, userID, modelType)
}
