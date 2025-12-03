package grpc

import (
	"context"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
	pb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
)

type AuthGRPCServer struct {
	service domain.AuthService
	pb.UnimplementedAuthServiceServer
}

func NewAuthGRPCServer(service domain.AuthService) *AuthGRPCServer {
	return &AuthGRPCServer{service: service}
}

func (s *AuthGRPCServer) Login(ctx context.Context, req *pb.LoginRequest) (*pb.LoginResponse, error) {
	loginData, err := s.service.Login(ctx, req.Email, req.Password)
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

func (s *AuthGRPCServer) RefreshToken(ctx context.Context, req *pb.RefreshTokenRequest) (*pb.RefreshTokenResponse, error) {
	refreshData, err := s.service.RefreshToken(ctx, req.RefreshToken)
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

func (s *AuthGRPCServer) ValidateToken(ctx context.Context, req *pb.ValidateTokenRequest) (*pb.ValidateTokenResponse, error) {
	user, err := s.service.ValidateToken(ctx, req.Token)
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

func (s *AuthGRPCServer) Logout(ctx context.Context, req *pb.LogoutRequest) (*pb.LogoutResponse, error) {
	err := s.service.Logout(ctx, req.RefreshToken, req.UserId)
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

func (s *AuthGRPCServer) ChangePassword(ctx context.Context, req *pb.ChangePasswordRequest) (*pb.ChangePasswordResponse, error) {
	err := s.service.ChangePassword(ctx, req.UserId, req.OldPassword, req.NewPassword)
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

func (s *AuthGRPCServer) ForgotPassword(ctx context.Context, req *pb.ForgotPasswordRequest) (*pb.ForgotPasswordResponse, error) {
	token, err := s.service.ForgotPassword(ctx, req.Email)
	if err != nil {
		return &pb.ForgotPasswordResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	// Don't return the token in production, send it via email
	// For now, we'll return success without revealing the token
	_ = token

	return &pb.ForgotPasswordResponse{
		Success: true,
		Message: "If the email exists, a password reset link has been sent",
	}, nil
}

func (s *AuthGRPCServer) ResetPassword(ctx context.Context, req *pb.ResetPasswordRequest) (*pb.ResetPasswordResponse, error) {
	err := s.service.ResetPassword(ctx, req.Token, req.NewPassword)
	if err != nil {
		return &pb.ResetPasswordResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	return &pb.ResetPasswordResponse{
		Success: true,
		Message: "Password reset successful",
	}, nil
}

func (s *AuthGRPCServer) VerifyResetToken(ctx context.Context, req *pb.VerifyResetTokenRequest) (*pb.VerifyResetTokenResponse, error) {
	email, err := s.service.VerifyResetToken(ctx, req.Token)
	if err != nil {
		return &pb.VerifyResetTokenResponse{
			Valid:   false,
			Email:   "",
			Message: err.Error(),
		}, nil
	}

	return &pb.VerifyResetTokenResponse{
		Valid:   true,
		Email:   email,
		Message: "Reset token is valid",
	}, nil
}

func (s *AuthGRPCServer) SendVerificationEmail(ctx context.Context, req *pb.SendVerificationEmailRequest) (*pb.SendVerificationEmailResponse, error) {
	token, err := s.service.SendVerificationEmail(ctx, req.UserId, req.Email)
	if err != nil {
		return &pb.SendVerificationEmailResponse{
			Success: false,
			Message: err.Error(),
		}, nil
	}

	// Don't return the token in production, send it via email
	// For now, we'll return success without revealing the token
	_ = token

	return &pb.SendVerificationEmailResponse{
		Success: true,
		Message: "Verification email sent successfully",
	}, nil
}

func (s *AuthGRPCServer) VerifyEmail(ctx context.Context, req *pb.VerifyEmailRequest) (*pb.VerifyEmailResponse, error) {
	userID, err := s.service.VerifyEmail(ctx, req.Token)
	if err != nil {
		return &pb.VerifyEmailResponse{
			Success: false,
			Message: err.Error(),
			UserId:  0,
		}, nil
	}

	return &pb.VerifyEmailResponse{
		Success: true,
		Message: "Email verified successfully",
		UserId:  userID,
	}, nil
}
