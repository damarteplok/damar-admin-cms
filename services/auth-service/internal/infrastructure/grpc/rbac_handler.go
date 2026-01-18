package grpc

import (
	"context"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
)

type RBACGRPCServer struct {
	permissionService domain.PermissionService
	roleService       domain.RoleService
	rbacService       domain.RBACService
	pb.UnimplementedAuthServiceServer
}

func NewRBACGRPCServer(
	permissionService domain.PermissionService,
	roleService domain.RoleService,
	rbacService domain.RBACService,
) *RBACGRPCServer {
	return &RBACGRPCServer{
		permissionService: permissionService,
		roleService:       roleService,
		rbacService:       rbacService,
	}
}

// ==================== Permission CRUD ====================

func (s *RBACGRPCServer) CreatePermission(ctx context.Context, req *pb.CreatePermissionRequest) (*pb.PermissionResponse, error) {
	guardName := req.GuardName
	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	permission, err := s.permissionService.Create(ctx, req.Name, guardName)
	if err != nil {
		return &pb.PermissionResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.PermissionResponse{
		Success: true,
		Message: "Permission created successfully",
		Data:    domainPermissionToProto(permission),
	}, nil
}

func (s *RBACGRPCServer) GetPermission(ctx context.Context, req *pb.GetPermissionRequest) (*pb.PermissionResponse, error) {
	permission, err := s.permissionService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.PermissionResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.PermissionResponse{
		Success: true,
		Message: "Permission retrieved successfully",
		Data:    domainPermissionToProto(permission),
	}, nil
}

func (s *RBACGRPCServer) UpdatePermission(ctx context.Context, req *pb.UpdatePermissionRequest) (*pb.PermissionResponse, error) {
	permission, err := s.permissionService.Update(ctx, req.Id, req.Name, req.GuardName)
	if err != nil {
		return &pb.PermissionResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.PermissionResponse{
		Success: true,
		Message: "Permission updated successfully",
		Data:    domainPermissionToProto(permission),
	}, nil
}

func (s *RBACGRPCServer) DeletePermission(ctx context.Context, req *pb.DeletePermissionRequest) (*pb.DeleteResponse, error) {
	err := s.permissionService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeleteResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteResponse{
		Success: true,
		Message: "Permission deleted successfully",
	}, nil
}

func (s *RBACGRPCServer) ListPermissions(ctx context.Context, req *pb.ListPermissionsRequest) (*pb.ListPermissionsResponse, error) {
	params := &domain.PermissionListParams{
		Page:      int(req.Page),
		PerPage:   int(req.PerPage),
		Search:    req.Search,
		SortBy:    req.SortBy,
		SortOrder: req.SortOrder,
		GuardName: req.GuardName,
	}

	permissions, total, err := s.permissionService.List(ctx, params)
	if err != nil {
		return &pb.ListPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPermissions := make([]*pb.Permission, len(permissions))
	for i, p := range permissions {
		pbPermissions[i] = domainPermissionToProto(p)
	}

	return &pb.ListPermissionsResponse{
		Success:     true,
		Message:     "Permissions retrieved successfully",
		Permissions: pbPermissions,
		Total:       int32(total),
		Page:        req.Page,
		PerPage:     req.PerPage,
	}, nil
}

// ==================== Role CRUD ====================

func (s *RBACGRPCServer) CreateRole(ctx context.Context, req *pb.CreateRoleRequest) (*pb.RoleResponse, error) {
	guardName := req.GuardName
	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	role, err := s.roleService.Create(ctx, req.Name, guardName, req.PermissionIds)
	if err != nil {
		return &pb.RoleResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RoleResponse{
		Success: true,
		Message: "Role created successfully",
		Data:    domainRoleToProto(role),
	}, nil
}

func (s *RBACGRPCServer) GetRole(ctx context.Context, req *pb.GetRoleRequest) (*pb.RoleResponse, error) {
	role, err := s.roleService.GetByID(ctx, req.Id)
	if err != nil {
		return &pb.RoleResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RoleResponse{
		Success: true,
		Message: "Role retrieved successfully",
		Data:    domainRoleToProto(role),
	}, nil
}

func (s *RBACGRPCServer) UpdateRole(ctx context.Context, req *pb.UpdateRoleRequest) (*pb.RoleResponse, error) {
	role, err := s.roleService.Update(ctx, req.Id, req.Name, req.GuardName)
	if err != nil {
		return &pb.RoleResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RoleResponse{
		Success: true,
		Message: "Role updated successfully",
		Data:    domainRoleToProto(role),
	}, nil
}

func (s *RBACGRPCServer) DeleteRole(ctx context.Context, req *pb.DeleteRoleRequest) (*pb.DeleteResponse, error) {
	err := s.roleService.Delete(ctx, req.Id)
	if err != nil {
		return &pb.DeleteResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteResponse{
		Success: true,
		Message: "Role deleted successfully",
	}, nil
}

func (s *RBACGRPCServer) ListRoles(ctx context.Context, req *pb.ListRolesRequest) (*pb.ListRolesResponse, error) {
	params := &domain.RoleListParams{
		Page:      int(req.Page),
		PerPage:   int(req.PerPage),
		Search:    req.Search,
		SortBy:    req.SortBy,
		SortOrder: req.SortOrder,
		GuardName: req.GuardName,
	}

	roles, total, err := s.roleService.List(ctx, params)
	if err != nil {
		return &pb.ListRolesResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbRoles := make([]*pb.Role, len(roles))
	for i, r := range roles {
		pbRoles[i] = domainRoleToProto(r)
	}

	return &pb.ListRolesResponse{
		Success: true,
		Message: "Roles retrieved successfully",
		Roles:   pbRoles,
		Total:   int32(total),
		Page:    req.Page,
		PerPage: req.PerPage,
	}, nil
}

func (s *RBACGRPCServer) GetRoleWithPermissions(ctx context.Context, req *pb.GetRoleRequest) (*pb.RoleWithPermissionsResponse, error) {
	roleWithPerms, err := s.roleService.GetWithPermissions(ctx, req.Id)
	if err != nil {
		return &pb.RoleWithPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RoleWithPermissionsResponse{
		Success: true,
		Message: "Role with permissions retrieved successfully",
		Data:    domainRoleWithPermissionsToProto(roleWithPerms),
	}, nil
}

// ==================== Role-Permission Assignment ====================

func (s *RBACGRPCServer) SyncRolePermissions(ctx context.Context, req *pb.SyncRolePermissionsRequest) (*pb.RoleWithPermissionsResponse, error) {
	roleWithPerms, err := s.roleService.SyncPermissions(ctx, req.RoleId, req.PermissionIds)
	if err != nil {
		return &pb.RoleWithPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RoleWithPermissionsResponse{
		Success: true,
		Message: "Role permissions synced successfully",
		Data:    domainRoleWithPermissionsToProto(roleWithPerms),
	}, nil
}

func (s *RBACGRPCServer) AssignPermissionToRole(ctx context.Context, req *pb.AssignPermissionToRoleRequest) (*pb.RoleWithPermissionsResponse, error) {
	roleWithPerms, err := s.roleService.AssignPermission(ctx, req.RoleId, req.PermissionId)
	if err != nil {
		return &pb.RoleWithPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RoleWithPermissionsResponse{
		Success: true,
		Message: "Permission assigned to role successfully",
		Data:    domainRoleWithPermissionsToProto(roleWithPerms),
	}, nil
}

func (s *RBACGRPCServer) RevokePermissionFromRole(ctx context.Context, req *pb.RevokePermissionFromRoleRequest) (*pb.RoleWithPermissionsResponse, error) {
	roleWithPerms, err := s.roleService.RevokePermission(ctx, req.RoleId, req.PermissionId)
	if err != nil {
		return &pb.RoleWithPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RoleWithPermissionsResponse{
		Success: true,
		Message: "Permission revoked from role successfully",
		Data:    domainRoleWithPermissionsToProto(roleWithPerms),
	}, nil
}

// ==================== User-Role Assignment ====================

func (s *RBACGRPCServer) AssignRoleToUser(ctx context.Context, req *pb.AssignRoleToUserRequest) (*pb.UserRolesResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	roles, err := s.roleService.AssignToUser(ctx, req.RoleId, req.UserId, modelType)
	if err != nil {
		return &pb.UserRolesResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbRoles := make([]*pb.Role, len(roles))
	for i, r := range roles {
		pbRoles[i] = domainRoleToProto(r)
	}

	return &pb.UserRolesResponse{
		Success: true,
		Message: "Role assigned to user successfully",
		Roles:   pbRoles,
	}, nil
}

func (s *RBACGRPCServer) RevokeRoleFromUser(ctx context.Context, req *pb.RevokeRoleFromUserRequest) (*pb.UserRolesResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	roles, err := s.roleService.RevokeFromUser(ctx, req.RoleId, req.UserId, modelType)
	if err != nil {
		return &pb.UserRolesResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbRoles := make([]*pb.Role, len(roles))
	for i, r := range roles {
		pbRoles[i] = domainRoleToProto(r)
	}

	return &pb.UserRolesResponse{
		Success: true,
		Message: "Role revoked from user successfully",
		Roles:   pbRoles,
	}, nil
}

func (s *RBACGRPCServer) GetUserRoles(ctx context.Context, req *pb.GetUserRolesRequest) (*pb.UserRolesResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	roles, err := s.roleService.GetUserRoles(ctx, req.UserId, modelType)
	if err != nil {
		return &pb.UserRolesResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbRoles := make([]*pb.Role, len(roles))
	for i, r := range roles {
		pbRoles[i] = domainRoleToProto(r)
	}

	return &pb.UserRolesResponse{
		Success: true,
		Message: "User roles retrieved successfully",
		Roles:   pbRoles,
	}, nil
}

func (s *RBACGRPCServer) SyncUserRoles(ctx context.Context, req *pb.SyncUserRolesRequest) (*pb.UserRolesResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	roles, err := s.roleService.SyncUserRoles(ctx, req.UserId, req.RoleIds, modelType)
	if err != nil {
		return &pb.UserRolesResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbRoles := make([]*pb.Role, len(roles))
	for i, r := range roles {
		pbRoles[i] = domainRoleToProto(r)
	}

	return &pb.UserRolesResponse{
		Success: true,
		Message: "User roles synced successfully",
		Roles:   pbRoles,
	}, nil
}

// ==================== User-Permission Direct Assignment ====================

func (s *RBACGRPCServer) AssignPermissionToUser(ctx context.Context, req *pb.AssignPermissionToUserRequest) (*pb.UserPermissionsResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	err := s.permissionService.AssignToUser(ctx, req.PermissionId, req.UserId, modelType)
	if err != nil {
		return &pb.UserPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	permissions, err := s.permissionService.GetUserDirectPermissions(ctx, req.UserId, modelType)
	if err != nil {
		return &pb.UserPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPermissions := make([]*pb.Permission, len(permissions))
	for i, p := range permissions {
		pbPermissions[i] = domainPermissionToProto(p)
	}

	return &pb.UserPermissionsResponse{
		Success:     true,
		Message:     "Permission assigned to user successfully",
		Permissions: pbPermissions,
	}, nil
}

func (s *RBACGRPCServer) RevokePermissionFromUser(ctx context.Context, req *pb.RevokePermissionFromUserRequest) (*pb.UserPermissionsResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	err := s.permissionService.RevokeFromUser(ctx, req.PermissionId, req.UserId, modelType)
	if err != nil {
		return &pb.UserPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	permissions, err := s.permissionService.GetUserDirectPermissions(ctx, req.UserId, modelType)
	if err != nil {
		return &pb.UserPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPermissions := make([]*pb.Permission, len(permissions))
	for i, p := range permissions {
		pbPermissions[i] = domainPermissionToProto(p)
	}

	return &pb.UserPermissionsResponse{
		Success:     true,
		Message:     "Permission revoked from user successfully",
		Permissions: pbPermissions,
	}, nil
}

func (s *RBACGRPCServer) GetUserDirectPermissions(ctx context.Context, req *pb.GetUserPermissionsRequest) (*pb.UserPermissionsResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	permissions, err := s.permissionService.GetUserDirectPermissions(ctx, req.UserId, modelType)
	if err != nil {
		return &pb.UserPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPermissions := make([]*pb.Permission, len(permissions))
	for i, p := range permissions {
		pbPermissions[i] = domainPermissionToProto(p)
	}

	return &pb.UserPermissionsResponse{
		Success:     true,
		Message:     "User direct permissions retrieved successfully",
		Permissions: pbPermissions,
	}, nil
}

// ==================== Permission Checking ====================

func (s *RBACGRPCServer) GetUserAllPermissions(ctx context.Context, req *pb.GetUserPermissionsRequest) (*pb.UserPermissionsResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	permissions, err := s.rbacService.GetUserAllPermissions(ctx, req.UserId, modelType)
	if err != nil {
		return &pb.UserPermissionsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbPermissions := make([]*pb.Permission, len(permissions))
	for i, p := range permissions {
		pbPermissions[i] = domainPermissionToProto(p)
	}

	return &pb.UserPermissionsResponse{
		Success:     true,
		Message:     "User all permissions retrieved successfully",
		Permissions: pbPermissions,
	}, nil
}

func (s *RBACGRPCServer) CheckUserHasPermission(ctx context.Context, req *pb.CheckPermissionRequest) (*pb.CheckPermissionResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	guardName := req.GuardName
	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	hasPermission, err := s.rbacService.HasPermission(ctx, req.UserId, req.PermissionName, modelType, guardName)
	if err != nil {
		return &pb.CheckPermissionResponse{
			HasPermission: false,
		}, nil
	}

	return &pb.CheckPermissionResponse{
		HasPermission: hasPermission,
	}, nil
}

func (s *RBACGRPCServer) CheckUserHasRole(ctx context.Context, req *pb.CheckRoleRequest) (*pb.CheckRoleResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	guardName := req.GuardName
	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	hasRole, err := s.rbacService.HasRole(ctx, req.UserId, req.RoleName, modelType, guardName)
	if err != nil {
		return &pb.CheckRoleResponse{
			HasRole: false,
		}, nil
	}

	return &pb.CheckRoleResponse{
		HasRole: hasRole,
	}, nil
}

func (s *RBACGRPCServer) CheckUserHasAnyPermission(ctx context.Context, req *pb.CheckAnyPermissionRequest) (*pb.CheckPermissionResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	guardName := req.GuardName
	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	hasPermission, err := s.rbacService.HasAnyPermission(ctx, req.UserId, req.PermissionNames, modelType, guardName)
	if err != nil {
		return &pb.CheckPermissionResponse{
			HasPermission: false,
		}, nil
	}

	return &pb.CheckPermissionResponse{
		HasPermission: hasPermission,
	}, nil
}

func (s *RBACGRPCServer) CheckUserHasAllPermissions(ctx context.Context, req *pb.CheckAllPermissionsRequest) (*pb.CheckPermissionResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	guardName := req.GuardName
	if guardName == "" {
		guardName = domain.DefaultGuardName
	}

	hasPermission, err := s.rbacService.HasAllPermissions(ctx, req.UserId, req.PermissionNames, modelType, guardName)
	if err != nil {
		return &pb.CheckPermissionResponse{
			HasPermission: false,
		}, nil
	}

	return &pb.CheckPermissionResponse{
		HasPermission: hasPermission,
	}, nil
}

// ==================== Helper functions ====================

func domainPermissionToProto(p *domain.Permission) *pb.Permission {
	var createdAt, updatedAt int64
	if p.CreatedAt != nil {
		createdAt = p.CreatedAt.Unix()
	}
	if p.UpdatedAt != nil {
		updatedAt = p.UpdatedAt.Unix()
	}

	return &pb.Permission{
		Id:        p.ID,
		Name:      p.Name,
		GuardName: p.GuardName,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func domainRoleToProto(r *domain.Role) *pb.Role {
	var createdAt, updatedAt int64
	if r.CreatedAt != nil {
		createdAt = r.CreatedAt.Unix()
	}
	if r.UpdatedAt != nil {
		updatedAt = r.UpdatedAt.Unix()
	}

	return &pb.Role{
		Id:        r.ID,
		Name:      r.Name,
		GuardName: r.GuardName,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}
}

func domainRoleWithPermissionsToProto(r *domain.RoleWithPermissions) *pb.RoleWithPermissions {
	var createdAt, updatedAt int64
	if r.CreatedAt != nil {
		createdAt = r.CreatedAt.Unix()
	}
	if r.UpdatedAt != nil {
		updatedAt = r.UpdatedAt.Unix()
	}

	pbPermissions := make([]*pb.Permission, len(r.Permissions))
	for i, p := range r.Permissions {
		pbPermissions[i] = domainPermissionToProto(p)
	}

	return &pb.RoleWithPermissions{
		Id:          r.ID,
		Name:        r.Name,
		GuardName:   r.GuardName,
		Permissions: pbPermissions,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}
}
