package grpc

import (
	"context"
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/user-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/services/user-service/pkg/types"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
	"github.com/damarteplok/damar-admin-cms/shared/util"
	"github.com/damarteplok/damar-admin-cms/shared/validation"
)

type UserGRPCServer struct {
	service domain.UserService
	pb.UnimplementedUserServiceServer
}

func NewUserGRPCServer(service domain.UserService) *UserGRPCServer {
	return &UserGRPCServer{service: service}
}

func (s *UserGRPCServer) GetUserByEmail(ctx context.Context, req *pb.GetUserByEmailRequest) (*pb.GetUserByEmailResponse, error) {
	if err := validation.ValidateStruct(&types.EmailValidation{Email: req.Email}); err != nil {
		return &pb.GetUserByEmailResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	user, err := s.service.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return &pb.GetUserByEmailResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}
	if user == nil {
		return &pb.GetUserByEmailResponse{
			Success: false,
			Message: "User not found",
		}, nil
	}

	return &pb.GetUserByEmailResponse{
		Success: true,
		Message: "User retrieved successfully",
		Data:    domainUserToPb(user),
	}, nil
}

func (s *UserGRPCServer) GetUserByID(ctx context.Context, req *pb.GetUserByIDRequest) (*pb.GetUserByIDResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.GetUserByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	user, err := s.service.GetUserByID(ctx, req.Id)
	if err != nil {
		return &pb.GetUserByIDResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}
	if user == nil {
		return &pb.GetUserByIDResponse{
			Success: false,
			Message: "User not found",
		}, nil
	}

	return &pb.GetUserByIDResponse{
		Success: true,
		Message: "User retrieved successfully",
		Data:    domainUserToPb(user),
	}, nil
}

func (s *UserGRPCServer) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.CreateUserResponse, error) {
	if err := validation.ValidateStruct(&types.CreateUserValidation{
		Name:        req.Name,
		Email:       req.Email,
		Password:    req.Password,
		PublicName:  req.PublicName,
		PhoneNumber: req.PhoneNumber,
		Position:    req.Position,
	}); err != nil {
		return &pb.CreateUserResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	user := &domain.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: req.Password,
		PublicName:   util.StringPtr(req.PublicName),
		PhoneNumber:  util.StringPtr(req.PhoneNumber),
		Position:     util.StringPtr(req.Position),
		IsAdmin:      req.IsAdmin,
	}

	createdUser, err := s.service.CreateUser(ctx, user)
	if err != nil {
		return &pb.CreateUserResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.CreateUserResponse{
		Success: true,
		Message: "User created successfully",
		Data:    domainUserToPb(createdUser),
	}, nil
}

func (s *UserGRPCServer) UpdateUser(ctx context.Context, req *pb.UpdateUserRequest) (*pb.UpdateUserResponse, error) {
	if err := validation.ValidateStruct(&types.UpdateUserValidation{
		ID:          req.Id,
		Name:        req.Name,
		Email:       req.Email,
		PublicName:  req.PublicName,
		PhoneNumber: req.PhoneNumber,
		Position:    req.Position,
	}); err != nil {
		return &pb.UpdateUserResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	user := &domain.User{
		ID:          req.Id,
		Name:        req.Name,
		PublicName:  util.StringPtr(req.PublicName),
		PhoneNumber: util.StringPtr(req.PhoneNumber),
		Position:    util.StringPtr(req.Position),
		IsAdmin:     req.IsAdmin,
		IsBlocked:   req.IsBlocked,
	}

	updatedUser, err := s.service.UpdateUser(ctx, user)
	if err != nil {
		return &pb.UpdateUserResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateUserResponse{
		Success: true,
		Message: "User updated successfully",
		Data:    domainUserToPb(updatedUser),
	}, nil
}

func (s *UserGRPCServer) GetAllUsers(ctx context.Context, req *pb.GetAllUsersRequest) (*pb.GetAllUsersResponse, error) {
	page := int(req.Page)
	perPage := int(req.PerPage)

	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}

	users, total, err := s.service.GetAllUsers(ctx, page, perPage)
	if err != nil {
		return &pb.GetAllUsersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbUsers := make([]*pb.User, len(users))
	for i, u := range users {
		pbUsers[i] = domainUserToPb(u)
	}

	return &pb.GetAllUsersResponse{
		Success: true,
		Message: "Users retrieved successfully",
		Data: &pb.GetAllUsersData{
			Users:   pbUsers,
			Total:   int32(total),
			Page:    int32(page),
			PerPage: int32(perPage),
		},
	}, nil
}

func (s *UserGRPCServer) DeleteUser(ctx context.Context, req *pb.DeleteUserRequest) (*pb.DeleteUserResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.Id}); err != nil {
		return &pb.DeleteUserResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	err := s.service.DeleteUser(ctx, req.Id)
	if err != nil {
		return &pb.DeleteUserResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.DeleteUserResponse{
		Success: true,
		Message: "User deleted successfully",
	}, nil
}

func (s *UserGRPCServer) SearchUsers(ctx context.Context, req *pb.SearchUsersRequest) (*pb.SearchUsersResponse, error) {
	if err := validation.ValidateStruct(&types.SearchUsersValidation{Query: req.Query}); err != nil {
		return &pb.SearchUsersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	page := int(req.Page)
	perPage := int(req.PerPage)

	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}

	users, total, err := s.service.SearchUsers(ctx, req.Query, page, perPage)
	if err != nil {
		return &pb.SearchUsersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	pbUsers := make([]*pb.User, len(users))
	for i, u := range users {
		pbUsers[i] = domainUserToPb(u)
	}

	return &pb.SearchUsersResponse{
		Success: true,
		Message: "Users found successfully",
		Data: &pb.GetAllUsersData{
			Users:   pbUsers,
			Total:   int32(total),
			Page:    int32(page),
			PerPage: int32(perPage),
		},
	}, nil
}

func (s *UserGRPCServer) BulkDeleteUsers(ctx context.Context, req *pb.BulkDeleteUsersRequest) (*pb.BulkDeleteUsersResponse, error) {
	if err := validation.ValidateStruct(&types.IDsValidation{IDs: req.UserIds}); err != nil {
		return &pb.BulkDeleteUsersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	count, err := s.service.BulkDeleteUsers(ctx, req.UserIds)
	if err != nil {
		return &pb.BulkDeleteUsersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.BulkDeleteUsersResponse{
		Success:      true,
		Message:      fmt.Sprintf("%d users deleted successfully", count),
		DeletedCount: count,
	}, nil
}

func (s *UserGRPCServer) BulkBlockUsers(ctx context.Context, req *pb.BulkBlockUsersRequest) (*pb.BulkBlockUsersResponse, error) {
	if err := validation.ValidateStruct(&types.IDsValidation{IDs: req.UserIds}); err != nil {
		return &pb.BulkBlockUsersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	count, err := s.service.BulkBlockUsers(ctx, req.UserIds, req.IsBlocked)
	if err != nil {
		return &pb.BulkBlockUsersResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	action := "blocked"
	if !req.IsBlocked {
		action = "unblocked"
	}

	return &pb.BulkBlockUsersResponse{
		Success:       true,
		Message:       fmt.Sprintf("%d users %s successfully", count, action),
		AffectedCount: count,
	}, nil
}

func (s *UserGRPCServer) UpdateEmailVerification(ctx context.Context, req *pb.UpdateEmailVerificationRequest) (*pb.UpdateEmailVerificationResponse, error) {
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.UserId}); err != nil {
		return &pb.UpdateEmailVerificationResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	err := s.service.UpdateEmailVerification(ctx, req.UserId, req.EmailVerified)
	if err != nil {
		return &pb.UpdateEmailVerificationResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateEmailVerificationResponse{
		Success: true,
		Message: "Email verification updated successfully",
	}, nil
}

func (s *UserGRPCServer) UpdatePassword(ctx context.Context, req *pb.UpdatePasswordRequest) (*pb.UpdatePasswordResponse, error) {
	// Validate user ID
	if err := validation.ValidateStruct(&types.IDValidation{ID: req.UserId}); err != nil {
		return &pb.UpdatePasswordResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	// Validate password hash is not empty
	if req.PasswordHash == "" {
		return &pb.UpdatePasswordResponse{
			Success: false,
			Message: "password hash is required",
		}, nil
	}

	err := s.service.UpdatePasswordHash(ctx, req.UserId, req.PasswordHash)
	if err != nil {
		return &pb.UpdatePasswordResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdatePasswordResponse{
		Success: true,
		Message: "Password updated successfully",
	}, nil
}

func domainUserToPb(user *domain.User) *pb.User {
	return &pb.User{
		Id:              user.ID,
		Name:            user.Name,
		Email:           user.Email,
		PublicName:      util.StringValue(user.PublicName),
		IsAdmin:         user.IsAdmin,
		IsBlocked:       user.IsBlocked,
		PhoneNumber:     util.StringValue(user.PhoneNumber),
		Position:        util.StringValue(user.Position),
		PasswordHash:    user.PasswordHash,
		EmailVerified:   user.EmailVerified,
		EmailVerifiedAt: util.TimeToUnix(user.EmailVerifiedAt),
		LastLoginAt:     util.TimeToUnix(user.LastLoginAt),
		CreatedAt:       util.TimeToUnix(user.CreatedAt),
		UpdatedAt:       util.TimeToUnix(user.UpdatedAt),
		DeletedAt:       util.TimeToUnix(user.DeletedAt),
	}
}

func (s *UserGRPCServer) UpdateLastLogin(ctx context.Context, req *pb.UpdateLastLoginRequest) (*pb.UpdateLastLoginResponse, error) {
	if req.UserId <= 0 {
		return &pb.UpdateLastLoginResponse{
			Success: false,
			Message: "Invalid user ID",
		}, nil
	}

	err := s.service.UpdateLastLogin(ctx, req.UserId)
	if err != nil {
		return &pb.UpdateLastLoginResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.UpdateLastLoginResponse{
		Success: true,
		Message: "Last login updated successfully",
	}, nil
}
