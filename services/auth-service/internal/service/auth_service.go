package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/domain"
	"github.com/damarteplok/damar-admin-cms/services/auth-service/internal/infrastructure/jwt"
	userPb "github.com/damarteplok/damar-admin-cms/shared/proto/user"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc"
)

type AuthService struct {
	refreshTokenRepo      domain.RefreshTokenRepository
	passwordResetRepo     domain.PasswordResetTokenRepository
	emailVerificationRepo domain.EmailVerificationTokenRepository
	tokenManager          *jwt.TokenManager
	userClient            userPb.UserServiceClient
}

func NewAuthService(
	refreshTokenRepo domain.RefreshTokenRepository,
	passwordResetRepo domain.PasswordResetTokenRepository,
	emailVerificationRepo domain.EmailVerificationTokenRepository,
	tokenManager *jwt.TokenManager,
	userServiceConn *grpc.ClientConn,
) domain.AuthService {
	return &AuthService{
		refreshTokenRepo:      refreshTokenRepo,
		passwordResetRepo:     passwordResetRepo,
		emailVerificationRepo: emailVerificationRepo,
		tokenManager:          tokenManager,
		userClient:            userPb.NewUserServiceClient(userServiceConn),
	}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*domain.LoginData, error) {
	if email == "" || password == "" {
		return nil, errors.New("email and password are required")
	}

	userResp, err := s.userClient.GetUserByEmail(ctx, &userPb.GetUserByEmailRequest{
		Email: email,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if !userResp.Success {
		return nil, errors.New("invalid email or password")
	}

	user := userResp.Data
	if user == nil {
		return nil, errors.New("invalid email or password")
	}

	if user.IsBlocked {
		return nil, errors.New("user account is blocked")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	accessToken, err := s.tokenManager.GenerateAccessToken(user.Id, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate refresh token (7 days)
	refreshToken, err := s.tokenManager.GenerateRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Save refresh token to database
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	_, err = s.refreshTokenRepo.Create(ctx, &domain.RefreshToken{
		UserID:    user.Id,
		Token:     refreshToken,
		ExpiresAt: expiresAt,
		Revoked:   false,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to save refresh token: %w", err)
	}

	return &domain.LoginData{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: &domain.User{
			ID:        user.Id,
			Name:      user.Name,
			Email:     user.Email,
			IsAdmin:   user.IsAdmin,
			IsBlocked: user.IsBlocked,
		},
	}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*domain.RefreshTokenData, error) {
	if refreshToken == "" {
		return nil, errors.New("refresh token is required")
	}

	claims, err := s.tokenManager.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	storedToken, err := s.refreshTokenRepo.GetByToken(ctx, refreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	if storedToken.Revoked {
		return nil, errors.New("refresh token has been revoked")
	}

	if time.Now().After(storedToken.ExpiresAt) {
		return nil, errors.New("refresh token has expired")
	}

	userID := claims.UserID

	userResp, err := s.userClient.GetUserByID(ctx, &userPb.GetUserByIDRequest{
		Id: userID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if !userResp.Success || userResp.Data == nil {
		return nil, errors.New("user not found")
	}

	user := userResp.Data

	accessToken, err := s.tokenManager.GenerateAccessToken(user.Id, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	return &domain.RefreshTokenData{
		AccessToken: accessToken,
	}, nil
}

func (s *AuthService) ValidateToken(ctx context.Context, accessToken string) (*domain.User, error) {
	if accessToken == "" {
		return nil, errors.New("access token is required")
	}

	claims, err := s.tokenManager.ValidateAccessToken(accessToken)
	if err != nil {
		return nil, errors.New("invalid access token")
	}

	userResp, err := s.userClient.GetUserByID(ctx, &userPb.GetUserByIDRequest{
		Id: claims.UserID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if !userResp.Success || userResp.Data == nil {
		return nil, errors.New("user not found")
	}

	user := userResp.Data

	return &domain.User{
		ID:        user.Id,
		Name:      user.Name,
		Email:     user.Email,
		IsAdmin:   user.IsAdmin,
		IsBlocked: user.IsBlocked,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string, userID int64) error {
	if refreshToken == "" {
		return errors.New("refresh token is required")
	}

	// Revoke refresh token by token
	err := s.refreshTokenRepo.RevokeByToken(ctx, refreshToken)
	if err != nil {
		return fmt.Errorf("failed to revoke refresh token: %w", err)
	}

	return nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID int64, oldPassword, newPassword string) error {
	if oldPassword == "" || newPassword == "" {
		return errors.New("old password and new password are required")
	}

	if len(newPassword) < 8 {
		return errors.New("new password must be at least 8 characters long")
	}

	// Get user from user-service
	userResp, err := s.userClient.GetUserByID(ctx, &userPb.GetUserByIDRequest{
		Id: userID,
	})
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	if !userResp.Success || userResp.Data == nil {
		return errors.New("user not found")
	}

	user := userResp.Data

	// Verify old password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(oldPassword))
	if err != nil {
		return errors.New("old password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password via user-service
	updateResp, err := s.userClient.UpdatePassword(ctx, &userPb.UpdatePasswordRequest{
		UserId:       userID,
		PasswordHash: string(hashedPassword),
	})
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	if !updateResp.Success {
		return errors.New("failed to update password")
	}

	// Revoke all refresh tokens for this user (force re-login)
	_ = s.refreshTokenRepo.RevokeByUserID(ctx, userID)

	return nil
}

func (s *AuthService) ForgotPassword(ctx context.Context, email string) (string, error) {
	if email == "" {
		return "", errors.New("email is required")
	}

	// Check if user exists
	userResp, err := s.userClient.GetUserByEmail(ctx, &userPb.GetUserByEmailRequest{
		Email: email,
	})
	if err != nil {
		// Don't reveal if email exists or not for security
		return "", nil
	}

	if !userResp.Success || userResp.Data == nil {
		// Don't reveal if email exists or not for security
		return "", nil
	}

	// Delete any existing password reset tokens for this email
	_ = s.passwordResetRepo.DeleteByEmail(ctx, email)

	// Generate password reset token
	token, err := s.tokenManager.GeneratePasswordResetToken()
	if err != nil {
		return "", fmt.Errorf("failed to generate password reset token: %w", err)
	}

	// Save token to database (expires in 1 hour)
	expiresAt := time.Now().Add(1 * time.Hour)
	_, err = s.passwordResetRepo.Create(ctx, &domain.PasswordResetToken{
		Email:     email,
		Token:     token,
		ExpiresAt: expiresAt,
	})
	if err != nil {
		return "", fmt.Errorf("failed to save password reset token: %w", err)
	}

	// TODO: Send email with reset link (integrate with notification-service)
	// For now, just return the token
	return token, nil
}

func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	if token == "" || newPassword == "" {
		return errors.New("token and new password are required")
	}

	if len(newPassword) < 8 {
		return errors.New("new password must be at least 8 characters long")
	}

	// Get token from database
	resetToken, err := s.passwordResetRepo.GetByToken(ctx, token)
	if err != nil {
		return errors.New("invalid or expired reset token")
	}

	// Check if token has expired
	if time.Now().After(resetToken.ExpiresAt) {
		return errors.New("reset token has expired")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Get user by email
	userResp, err := s.userClient.GetUserByEmail(ctx, &userPb.GetUserByEmailRequest{
		Email: resetToken.Email,
	})
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	if !userResp.Success || userResp.Data == nil {
		return errors.New("user not found")
	}

	user := userResp.Data

	// Update password via user-service
	updateResp, err := s.userClient.UpdatePassword(ctx, &userPb.UpdatePasswordRequest{
		UserId:       user.Id,
		PasswordHash: string(hashedPassword),
	})
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	if !updateResp.Success {
		return errors.New("failed to update password")
	}

	// Delete the used token
	_ = s.passwordResetRepo.DeleteByEmail(ctx, resetToken.Email)

	// Revoke all refresh tokens for this user (force re-login)
	_ = s.refreshTokenRepo.RevokeByUserID(ctx, user.Id)

	return nil
}

func (s *AuthService) VerifyResetToken(ctx context.Context, token string) (string, error) {
	if token == "" {
		return "", errors.New("token is required")
	}

	// Get token from database
	resetToken, err := s.passwordResetRepo.GetByToken(ctx, token)
	if err != nil {
		return "", errors.New("invalid or expired reset token")
	}

	// Check if token has expired
	if time.Now().After(resetToken.ExpiresAt) {
		return "", errors.New("reset token has expired")
	}

	return resetToken.Email, nil
}

func (s *AuthService) SendVerificationEmail(ctx context.Context, userID int64, email string) (string, error) {
	if userID == 0 || email == "" {
		return "", errors.New("user ID and email are required")
	}

	// Check if user exists
	userResp, err := s.userClient.GetUserByID(ctx, &userPb.GetUserByIDRequest{
		Id: userID,
	})
	if err != nil {
		return "", fmt.Errorf("failed to get user: %w", err)
	}

	if !userResp.Success || userResp.Data == nil {
		return "", errors.New("user not found")
	}

	// Delete any existing email verification tokens for this user
	_ = s.emailVerificationRepo.DeleteByUserID(ctx, userID)

	// Generate email verification token
	token, err := s.tokenManager.GenerateEmailVerificationToken()
	if err != nil {
		return "", fmt.Errorf("failed to generate email verification token: %w", err)
	}

	// Save token to database (expires in 24 hours)
	expiresAt := time.Now().Add(24 * time.Hour)
	_, err = s.emailVerificationRepo.Create(ctx, &domain.EmailVerificationToken{
		UserID:    userID,
		Email:     email,
		Token:     token,
		ExpiresAt: expiresAt,
	})
	if err != nil {
		return "", fmt.Errorf("failed to save email verification token: %w", err)
	}

	// TODO: Send email with verification link (integrate with notification-service)
	// For now, just return the token
	return token, nil
}

func (s *AuthService) VerifyEmail(ctx context.Context, token string) (int64, error) {
	if token == "" {
		return 0, errors.New("token is required")
	}

	// Get token from database
	verificationToken, err := s.emailVerificationRepo.GetByToken(ctx, token)
	if err != nil {
		return 0, errors.New("invalid or expired verification token")
	}

	// Check if token has expired
	if time.Now().After(verificationToken.ExpiresAt) {
		return 0, errors.New("verification token has expired")
	}

	// Update user's email_verified status via user-service
	updateResp, err := s.userClient.UpdateEmailVerification(ctx, &userPb.UpdateEmailVerificationRequest{
		UserId:        verificationToken.UserID,
		EmailVerified: true,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to verify email: %w", err)
	}

	if !updateResp.Success {
		return 0, errors.New("failed to verify email")
	}

	// Delete the used token
	_ = s.emailVerificationRepo.DeleteByUserID(ctx, verificationToken.UserID)

	return verificationToken.UserID, nil
}
