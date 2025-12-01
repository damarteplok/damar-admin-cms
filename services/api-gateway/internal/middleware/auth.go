package middleware

import (
	"context"
	"strings"

	authPb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
)

type contextKey string

const UserContextKey contextKey = "user"

type UserInfo struct {
	UserID  int64
	Email   string
	IsValid bool
	Token   string
}

func ValidateToken(ctx context.Context, authClient authPb.AuthServiceClient, token string) (*UserInfo, error) {
	if token == "" {
		return &UserInfo{IsValid: false}, nil
	}

	resp, err := authClient.ValidateToken(ctx, &authPb.ValidateTokenRequest{
		Token: token,
	})
	if err != nil {
		return &UserInfo{IsValid: false}, err
	}

	if !resp.Valid {
		return &UserInfo{IsValid: false}, nil
	}

	return &UserInfo{
		UserID:  resp.UserId,
		Email:   resp.Email,
		IsValid: true,
		Token:   token,
	}, nil
}

func ExtractToken(authHeader string) string {
	if authHeader == "" {
		return ""
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}

	return parts[1]
}

func GetUserFromContext(ctx context.Context) (*UserInfo, bool) {
	user, ok := ctx.Value(UserContextKey).(*UserInfo)
	return user, ok
}
