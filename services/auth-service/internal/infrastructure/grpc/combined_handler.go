package grpc

import (
	"context"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
)

// CombinedAuthGRPCServer implements all AuthService RPC methods
// combining both authentication and RBAC functionality
type CombinedAuthGRPCServer struct {
	authService       domain.AuthService
	permissionService domain.PermissionService
	roleService       domain.RoleService
	rbacService       domain.RBACService
	pb.UnimplementedAuthServiceServer
}

func NewCombinedAuthGRPCServer(
	authService domain.AuthService,
	permissionService domain.PermissionService,
	roleService domain.RoleService,
	rbacService domain.RBACService,
) *CombinedAuthGRPCServer {
	return &CombinedAuthGRPCServer{
		authService:       authService,
		permissionService: permissionService,
		roleService:       roleService,
		rbacService:       rbacService,
	}
}

// ==================== Authentication Methods ====================

func (s *CombinedAuthGRPCServer) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
	loginData, err := s.authService.Login(ctx, req.Email, req.Password)
	if err != nil {
		return &pb.LoginResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.LoginResponse{
		Success: true,
		Message: "Login successful",
		Data: &pb.LoginData{
			AccessToken:  loginData.AccessToken,
			RefreshToken: loginData.RefreshToken,
			User: &pb.UserData{
				Id:        loginData.User.ID,
				Name:      loginData.User.Name,
				Email:     loginData.User.Email,
				IsAdmin:   loginData.User.IsAdmin,
				IsBlocked: loginData.User.IsBlocked,
			},
		},
	}, nil
}

func (s *CombinedAuthGRPCServer) RefreshToken(ctx context.Context, req *pb.RefreshTokenRequest) (*pb.RefreshTokenResponse, error) {
	refreshData, err := s.authService.RefreshToken(ctx, req.RefreshToken)
	if err != nil {
		return &pb.RefreshTokenResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RefreshTokenResponse{
		Success: true,
		Message: "Token refreshed successfully",
		Data: &pb.RefreshTokenData{
			AccessToken:  refreshData.AccessToken,
			RefreshToken: refreshData.RefreshToken,
		},
	}, nil
}

func (s *CombinedAuthGRPCServer) ValidateToken(ctx context.Context, req *pb.ValidateTokenRequest) (*pb.ValidateTokenResponse, error) {
	user, err := s.authService.ValidateToken(ctx, req.Token)
	if err != nil {
		return &pb.ValidateTokenResponse{
			Valid:  false,
			UserId: 0,
			Email:  "",
		}, nil
	}

	return &pb.ValidateTokenResponse{
		Valid:   true,
		UserId:  user.ID,
		Email:   user.Email,
		IsAdmin: user.IsAdmin,
	}, nil
}

func (s *CombinedAuthGRPCServer) Logout(ctx context.Context, req *pb.LogoutRequest) (*pb.LogoutResponse, error) {
	err := s.authService.Logout(ctx, req.RefreshToken, req.UserId)
	if err != nil {
		return &pb.LogoutResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.LogoutResponse{
		Success: true,
		Message: "Logout successful",
	}, nil
}

func (s *CombinedAuthGRPCServer) ChangePassword(ctx context.Context, req *pb.ChangePasswordRequest) (*pb.ChangePasswordResponse, error) {
	err := s.authService.ChangePassword(ctx, req.UserId, req.OldPassword, req.NewPassword)
	if err != nil {
		return &pb.ChangePasswordResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.ChangePasswordResponse{
		Success: true,
		Message: "Password changed successfully",
	}, nil
}

func (s *CombinedAuthGRPCServer) ForgotPassword(ctx context.Context, req *pb.ForgotPasswordRequest) (*pb.ForgotPasswordResponse, error) {
	_, err := s.authService.ForgotPassword(ctx, req.Email)
	if err != nil {
		return &pb.ForgotPasswordResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.ForgotPasswordResponse{
		Success: true,
		Message: "Password reset email sent",
	}, nil
}

func (s *CombinedAuthGRPCServer) ResetPassword(ctx context.Context, req *pb.ResetPasswordRequest) (*pb.ResetPasswordResponse, error) {
	err := s.authService.ResetPassword(ctx, req.Token, req.NewPassword)
	if err != nil {
		return &pb.ResetPasswordResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.ResetPasswordResponse{
		Success: true,
		Message: "Password reset successfully",
	}, nil
}

func (s *CombinedAuthGRPCServer) VerifyResetToken(ctx context.Context, req *pb.VerifyResetTokenRequest) (*pb.VerifyResetTokenResponse, error) {
	email, err := s.authService.VerifyResetToken(ctx, req.Token)
	if err != nil {
		return &pb.VerifyResetTokenResponse{
			Valid:   false,
			Message: err.Error(),
		}, nil
	}

	return &pb.VerifyResetTokenResponse{
		Valid:   true,
		Email:   email,
		Message: "Token is valid",
	}, nil
}

func (s *CombinedAuthGRPCServer) SendVerificationEmail(ctx context.Context, req *pb.SendVerificationEmailRequest) (*pb.SendVerificationEmailResponse, error) {
	_, err := s.authService.SendVerificationEmail(ctx, req.UserId, req.Email)
	if err != nil {
		return &pb.SendVerificationEmailResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.SendVerificationEmailResponse{
		Success: true,
		Message: "Verification email sent",
	}, nil
}

func (s *CombinedAuthGRPCServer) VerifyEmail(ctx context.Context, req *pb.VerifyEmailRequest) (*pb.VerifyEmailResponse, error) {
	userID, err := s.authService.VerifyEmail(ctx, req.Token)
	if err != nil {
		return &pb.VerifyEmailResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.VerifyEmailResponse{
		Success: true,
		Message: "Email verified successfully",
		UserId:  userID,
	}, nil
}

// ==================== Permission CRUD ====================

func (s *CombinedAuthGRPCServer) CreatePermission(ctx context.Context, req *pb.CreatePermissionRequest) (*pb.PermissionResponse, error) {
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

func (s *CombinedAuthGRPCServer) GetPermission(ctx context.Context, req *pb.GetPermissionRequest) (*pb.PermissionResponse, error) {
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

func (s *CombinedAuthGRPCServer) UpdatePermission(ctx context.Context, req *pb.UpdatePermissionRequest) (*pb.PermissionResponse, error) {
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

func (s *CombinedAuthGRPCServer) DeletePermission(ctx context.Context, req *pb.DeletePermissionRequest) (*pb.DeleteResponse, error) {
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

func (s *CombinedAuthGRPCServer) ListPermissions(ctx context.Context, req *pb.ListPermissionsRequest) (*pb.ListPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) CreateRole(ctx context.Context, req *pb.CreateRoleRequest) (*pb.RoleResponse, error) {
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

func (s *CombinedAuthGRPCServer) GetRole(ctx context.Context, req *pb.GetRoleRequest) (*pb.RoleResponse, error) {
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

func (s *CombinedAuthGRPCServer) UpdateRole(ctx context.Context, req *pb.UpdateRoleRequest) (*pb.RoleResponse, error) {
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

func (s *CombinedAuthGRPCServer) DeleteRole(ctx context.Context, req *pb.DeleteRoleRequest) (*pb.DeleteResponse, error) {
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

func (s *CombinedAuthGRPCServer) ListRoles(ctx context.Context, req *pb.ListRolesRequest) (*pb.ListRolesResponse, error) {
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

func (s *CombinedAuthGRPCServer) GetRoleWithPermissions(ctx context.Context, req *pb.GetRoleRequest) (*pb.RoleWithPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) SyncRolePermissions(ctx context.Context, req *pb.SyncRolePermissionsRequest) (*pb.RoleWithPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) AssignPermissionToRole(ctx context.Context, req *pb.AssignPermissionToRoleRequest) (*pb.RoleWithPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) RevokePermissionFromRole(ctx context.Context, req *pb.RevokePermissionFromRoleRequest) (*pb.RoleWithPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) AssignRoleToUser(ctx context.Context, req *pb.AssignRoleToUserRequest) (*pb.UserRolesResponse, error) {
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

func (s *CombinedAuthGRPCServer) RevokeRoleFromUser(ctx context.Context, req *pb.RevokeRoleFromUserRequest) (*pb.UserRolesResponse, error) {
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

func (s *CombinedAuthGRPCServer) GetUserRoles(ctx context.Context, req *pb.GetUserRolesRequest) (*pb.UserRolesResponse, error) {
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

func (s *CombinedAuthGRPCServer) SyncUserRoles(ctx context.Context, req *pb.SyncUserRolesRequest) (*pb.UserRolesResponse, error) {
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

func (s *CombinedAuthGRPCServer) AssignPermissionToUser(ctx context.Context, req *pb.AssignPermissionToUserRequest) (*pb.UserPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) RevokePermissionFromUser(ctx context.Context, req *pb.RevokePermissionFromUserRequest) (*pb.UserPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) GetUserDirectPermissions(ctx context.Context, req *pb.GetUserPermissionsRequest) (*pb.UserPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) SyncUserPermissions(ctx context.Context, req *pb.SyncUserPermissionsRequest) (*pb.UserPermissionsResponse, error) {
	modelType := req.ModelType
	if modelType == "" {
		modelType = domain.DefaultModelType
	}

	permissions, err := s.permissionService.SyncUserPermissions(ctx, req.UserId, modelType, req.PermissionIds)
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
		Message:     "User permissions synced successfully",
		Permissions: pbPermissions,
	}, nil
}

// ==================== Permission Checking ====================

func (s *CombinedAuthGRPCServer) GetUserAllPermissions(ctx context.Context, req *pb.GetUserPermissionsRequest) (*pb.UserPermissionsResponse, error) {
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

func (s *CombinedAuthGRPCServer) CheckUserHasPermission(ctx context.Context, req *pb.CheckPermissionRequest) (*pb.CheckPermissionResponse, error) {
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

func (s *CombinedAuthGRPCServer) CheckUserHasRole(ctx context.Context, req *pb.CheckRoleRequest) (*pb.CheckRoleResponse, error) {
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

func (s *CombinedAuthGRPCServer) CheckUserHasAnyPermission(ctx context.Context, req *pb.CheckAnyPermissionRequest) (*pb.CheckPermissionResponse, error) {
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

func (s *CombinedAuthGRPCServer) CheckUserHasAllPermissions(ctx context.Context, req *pb.CheckAllPermissionsRequest) (*pb.CheckPermissionResponse, error) {
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
