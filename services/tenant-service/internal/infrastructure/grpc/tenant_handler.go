package grpc

import (
	"context"
	"encoding/json"

	"github.com/damarteplok/damar-admin-cms/services/tenant-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/services/tenant-service/pkg/types"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/tenant"
	"github.com/damarteplok/damar-admin-cms/shared/util"
	"github.com/damarteplok/damar-admin-cms/shared/validation"
)

type TenantGRPCServer struct {
	service domain.TenantService
	pb.UnimplementedTenantServiceServer
}

func NewTenantGRPCServer(service domain.TenantService) *TenantGRPCServer {
	return &TenantGRPCServer{service: service}
}

// Tenant operations

func (s *TenantGRPCServer) GetTenantByID(ctx context.Context, req *pb.GetTenantByIDRequest) (*pb.GetTenantByIDResponse, error) {
	if err := validation.ValidateStruct(&types.TenantIDValidation{ID: req.Id}); err != nil {
		return &pb.GetTenantByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	tenant, err := s.service.GetTenantByID(ctx, req.Id)
	if err != nil {
		return &pb.GetTenantByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetTenantByIDResponse{
		Success: true,
		Message: "Tenant retrieved successfully",
		Data:    domainTenantToPb(tenant),
	}, nil
}

func (s *TenantGRPCServer) GetTenantByUUID(ctx context.Context, req *pb.GetTenantByUUIDRequest) (*pb.GetTenantByUUIDResponse, error) {
	if err := validation.ValidateStruct(&types.TenantUUIDValidation{UUID: req.Uuid}); err != nil {
		return &pb.GetTenantByUUIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	tenant, err := s.service.GetTenantByUUID(ctx, req.Uuid)
	if err != nil {
		return &pb.GetTenantByUUIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetTenantByUUIDResponse{
		Success: true,
		Message: "Tenant retrieved successfully",
		Data:    domainTenantToPb(tenant),
	}, nil
}

func (s *TenantGRPCServer) GetTenantBySlug(ctx context.Context, req *pb.GetTenantBySlugRequest) (*pb.GetTenantBySlugResponse, error) {
	if err := validation.ValidateStruct(&types.TenantSlugValidation{Slug: req.Slug}); err != nil {
		return &pb.GetTenantBySlugResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	tenant, err := s.service.GetTenantBySlug(ctx, req.Slug)
	if err != nil {
		return &pb.GetTenantBySlugResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetTenantBySlugResponse{
		Success: true,
		Message: "Tenant retrieved successfully",
		Data:    domainTenantToPb(tenant),
	}, nil
}

func (s *TenantGRPCServer) CreateTenant(ctx context.Context, req *pb.CreateTenantRequest) (*pb.CreateTenantResponse, error) {
	if err := validation.ValidateStruct(&types.CreateTenantValidation{
		Name:      req.Name,
		Slug:      req.Slug,
		Domain:    req.Domain,
		CreatedBy: req.CreatedBy,
	}); err != nil {
		return &pb.CreateTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	tenant := &domain.Tenant{
		Name:      req.Name,
		Slug:      req.Slug,
		Domain:    util.StringPtr(req.Domain),
		CreatedBy: &req.CreatedBy,
	}

	createdTenant, err := s.service.CreateTenant(ctx, tenant)
	if err != nil {
		return &pb.CreateTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateTenantResponse{
		Success: true,
		Message: "Tenant created successfully",
		Data:    domainTenantToPb(createdTenant),
	}, nil
}

func (s *TenantGRPCServer) UpdateTenant(ctx context.Context, req *pb.UpdateTenantRequest) (*pb.UpdateTenantResponse, error) {
	if err := validation.ValidateStruct(&types.UpdateTenantValidation{
		ID:     req.Id,
		Name:   req.Name,
		Domain: req.Domain,
	}); err != nil {
		return &pb.UpdateTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	tenant := &domain.Tenant{
		ID:     req.Id,
		Name:   req.Name,
		Domain: util.StringPtr(req.Domain),
	}

	updatedTenant, err := s.service.UpdateTenant(ctx, tenant)
	if err != nil {
		return &pb.UpdateTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateTenantResponse{
		Success: true,
		Message: "Tenant updated successfully",
		Data:    domainTenantToPb(updatedTenant),
	}, nil
}

func (s *TenantGRPCServer) DeleteTenant(ctx context.Context, req *pb.DeleteTenantRequest) (*pb.DeleteTenantResponse, error) {
	if err := validation.ValidateStruct(&types.TenantIDValidation{ID: req.Id}); err != nil {
		return &pb.DeleteTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	err := s.service.DeleteTenant(ctx, req.Id)
	if err != nil {
		return &pb.DeleteTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteTenantResponse{
		Success: true,
		Message: "Tenant deleted successfully",
	}, nil
}

func (s *TenantGRPCServer) GetAllTenants(ctx context.Context, req *pb.GetAllTenantsRequest) (*pb.GetAllTenantsResponse, error) {
	page := int(req.Page)
	perPage := int(req.PerPage)

	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}

	tenants, total, err := s.service.GetAllTenants(ctx, page, perPage)
	if err != nil {
		return &pb.GetAllTenantsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbTenants := make([]*pb.Tenant, len(tenants))
	for i, t := range tenants {
		pbTenants[i] = domainTenantToPb(t)
	}

	return &pb.GetAllTenantsResponse{
		Success: true,
		Message: "Tenants retrieved successfully",
		Data: &pb.GetAllTenantsData{
			Tenants: pbTenants,
			Total:   int32(total),
			Page:    int32(page),
			PerPage: int32(perPage),
		},
	}, nil
}

func (s *TenantGRPCServer) GetUserTenants(ctx context.Context, req *pb.GetUserTenantsRequest) (*pb.GetUserTenantsResponse, error) {
	if req.UserId <= 0 {
		return &pb.GetUserTenantsResponse{
			Success: false,
			Message: "Invalid user ID",
		}, nil
	}

	tenants, err := s.service.GetUserTenants(ctx, req.UserId)
	if err != nil {
		return &pb.GetUserTenantsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbTenantUsers := make([]*pb.TenantUser, len(tenants))
	for i, t := range tenants {
		pbTenantUsers[i] = domainTenantUserToPb(t)
	}

	return &pb.GetUserTenantsResponse{
		Success: true,
		Message: "User tenants retrieved successfully",
		Data:    pbTenantUsers,
	}, nil
}

// TenantUser operations

func (s *TenantGRPCServer) AddUserToTenant(ctx context.Context, req *pb.AddUserToTenantRequest) (*pb.AddUserToTenantResponse, error) {
	if err := validation.ValidateStruct(&types.AddUserToTenantValidation{
		UserID:   req.UserId,
		TenantID: req.TenantId,
		Role:     req.Role,
	}); err != nil {
		return &pb.AddUserToTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	tenantUser := &domain.TenantUser{
		UserID:    req.UserId,
		TenantID:  req.TenantId,
		Role:      req.Role,
		IsDefault: req.IsDefault,
		Email:     util.StringPtr(req.Email),
	}

	createdTenantUser, err := s.service.AddUserToTenant(ctx, tenantUser)
	if err != nil {
		return &pb.AddUserToTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.AddUserToTenantResponse{
		Success: true,
		Message: "User added to tenant successfully",
		Data:    domainTenantUserToPb(createdTenantUser),
	}, nil
}

func (s *TenantGRPCServer) RemoveUserFromTenant(ctx context.Context, req *pb.RemoveUserFromTenantRequest) (*pb.RemoveUserFromTenantResponse, error) {
	if req.UserId <= 0 || req.TenantId <= 0 {
		return &pb.RemoveUserFromTenantResponse{
			Success: false,
			Message: "Invalid user ID or tenant ID",
		}, nil
	}

	err := s.service.RemoveUserFromTenant(ctx, req.UserId, req.TenantId)
	if err != nil {
		return &pb.RemoveUserFromTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.RemoveUserFromTenantResponse{
		Success: true,
		Message: "User removed from tenant successfully",
	}, nil
}

func (s *TenantGRPCServer) UpdateUserRole(ctx context.Context, req *pb.UpdateUserRoleRequest) (*pb.UpdateUserRoleResponse, error) {
	if err := validation.ValidateStruct(&types.UpdateUserRoleValidation{
		UserID:   req.UserId,
		TenantID: req.TenantId,
		Role:     req.Role,
	}); err != nil {
		return &pb.UpdateUserRoleResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	err := s.service.UpdateUserRole(ctx, req.UserId, req.TenantId, req.Role)
	if err != nil {
		return &pb.UpdateUserRoleResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateUserRoleResponse{
		Success: true,
		Message: "User role updated successfully",
	}, nil
}

func (s *TenantGRPCServer) GetTenantUsers(ctx context.Context, req *pb.GetTenantUsersRequest) (*pb.GetTenantUsersResponse, error) {
	if req.TenantId <= 0 {
		return &pb.GetTenantUsersResponse{
			Success: false,
			Message: "Invalid tenant ID",
		}, nil
	}

	users, err := s.service.GetTenantUsers(ctx, req.TenantId)
	if err != nil {
		return &pb.GetTenantUsersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbUsers := make([]*pb.TenantUser, len(users))
	for i, u := range users {
		pbUsers[i] = domainTenantUserToPb(u)
	}

	return &pb.GetTenantUsersResponse{
		Success: true,
		Message: "Tenant users retrieved successfully",
		Data:    pbUsers,
	}, nil
}

func (s *TenantGRPCServer) SetDefaultTenant(ctx context.Context, req *pb.SetDefaultTenantRequest) (*pb.SetDefaultTenantResponse, error) {
	if req.UserId <= 0 || req.TenantId <= 0 {
		return &pb.SetDefaultTenantResponse{
			Success: false,
			Message: "Invalid user ID or tenant ID",
		}, nil
	}

	err := s.service.SetDefaultTenant(ctx, req.UserId, req.TenantId)
	if err != nil {
		return &pb.SetDefaultTenantResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.SetDefaultTenantResponse{
		Success: true,
		Message: "Default tenant set successfully",
	}, nil
}

// TenantSettings operations

func (s *TenantGRPCServer) GetSetting(ctx context.Context, req *pb.GetSettingRequest) (*pb.GetSettingResponse, error) {
	if req.TenantId <= 0 || req.Key == "" {
		return &pb.GetSettingResponse{
			Success: false,
			Message: "Invalid tenant ID or key",
		}, nil
	}

	setting, err := s.service.GetSetting(ctx, req.TenantId, req.Key)
	if err != nil {
		return &pb.GetSettingResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.GetSettingResponse{
		Success: true,
		Message: "Setting retrieved successfully",
		Data:    domainTenantSettingToPb(setting),
	}, nil
}

func (s *TenantGRPCServer) SetSetting(ctx context.Context, req *pb.SetSettingRequest) (*pb.SetSettingResponse, error) {
	if req.TenantId <= 0 || req.Key == "" || req.Value == "" {
		return &pb.SetSettingResponse{
			Success: false,
			Message: "Invalid tenant ID, key, or value",
		}, nil
	}

	var jsonValue json.RawMessage

	var jsonData interface{}
	if err := json.Unmarshal([]byte(req.Value), &jsonData); err != nil {
		jsonBytes, _ := json.Marshal(req.Value)
		jsonValue = json.RawMessage(jsonBytes)
	} else {
		jsonValue = json.RawMessage(req.Value)
	}

	setting := &domain.TenantSetting{
		TenantID: req.TenantId,
		Key:      req.Key,
		Value:    jsonValue,
	}

	createdSetting, err := s.service.SetSetting(ctx, setting)
	if err != nil {
		return &pb.SetSettingResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.SetSettingResponse{
		Success: true,
		Message: "Setting saved successfully",
		Data:    domainTenantSettingToPb(createdSetting),
	}, nil
}

func (s *TenantGRPCServer) GetAllSettings(ctx context.Context, req *pb.GetAllSettingsRequest) (*pb.GetAllSettingsResponse, error) {
	if req.TenantId <= 0 {
		return &pb.GetAllSettingsResponse{
			Success: false,
			Message: "Invalid tenant ID",
		}, nil
	}

	settings, err := s.service.GetAllSettings(ctx, req.TenantId)
	if err != nil {
		return &pb.GetAllSettingsResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbSettings := make([]*pb.TenantSetting, len(settings))
	for i, s := range settings {
		pbSettings[i] = domainTenantSettingToPb(s)
	}

	return &pb.GetAllSettingsResponse{
		Success: true,
		Message: "Settings retrieved successfully",
		Data:    pbSettings,
	}, nil
}

func (s *TenantGRPCServer) DeleteSetting(ctx context.Context, req *pb.DeleteSettingRequest) (*pb.DeleteSettingResponse, error) {
	if req.TenantId <= 0 || req.Key == "" {
		return &pb.DeleteSettingResponse{
			Success: false,
			Message: "Invalid tenant ID or key",
		}, nil
	}

	err := s.service.DeleteSetting(ctx, req.TenantId, req.Key)
	if err != nil {
		return &pb.DeleteSettingResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteSettingResponse{
		Success: true,
		Message: "Setting deleted successfully",
	}, nil
}

// Helper functions to convert domain models to protobuf

func domainTenantToPb(tenant *domain.Tenant) *pb.Tenant {
	return &pb.Tenant{
		Id:                  tenant.ID,
		Uuid:                tenant.UUID,
		Name:                tenant.Name,
		Slug:                tenant.Slug,
		Domain:              util.StringValue(tenant.Domain),
		IsNameAutoGenerated: tenant.IsNameAutoGenerated,
		CreatedBy:           int64Value(tenant.CreatedBy),
		CreatedAt:           util.TimeToUnix(tenant.CreatedAt),
		UpdatedAt:           util.TimeToUnix(tenant.UpdatedAt),
	}
}

func domainTenantUserToPb(tenantUser *domain.TenantUser) *pb.TenantUser {
	return &pb.TenantUser{
		Id:        tenantUser.ID,
		UserId:    tenantUser.UserID,
		TenantId:  tenantUser.TenantID,
		Role:      tenantUser.Role,
		IsDefault: tenantUser.IsDefault,
		Email:     util.StringValue(tenantUser.Email),
		CreatedAt: util.TimeToUnix(tenantUser.CreatedAt),
		UpdatedAt: util.TimeToUnix(tenantUser.UpdatedAt),
	}
}

func domainTenantSettingToPb(setting *domain.TenantSetting) *pb.TenantSetting {
	return &pb.TenantSetting{
		Id:        setting.ID,
		TenantId:  setting.TenantID,
		Key:       setting.Key,
		Value:     string(setting.Value),
		CreatedAt: util.TimeToUnix(setting.CreatedAt),
		UpdatedAt: util.TimeToUnix(setting.UpdatedAt),
	}
}

func int64Value(p *int64) int64 {
	if p == nil {
		return 0
	}
	return *p
}
