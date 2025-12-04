package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	authPb "github.com/damarteplok/damar-admin-cms/shared/proto/auth"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type contextKey string

const (
	UserContextKey contextKey = "user"
)

// GraphQL error response structure
type graphQLError struct {
	Message string `json:"message"`
}

type graphQLErrorResponse struct {
	Errors []graphQLError `json:"errors"`
}

// writeGraphQLError writes a GraphQL-compatible error response
func writeGraphQLError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(graphQLErrorResponse{
		Errors: []graphQLError{{Message: message}},
	})
}

// AuthMiddleware validates JWT token if present and adds user info to context.
// If no token is provided, the request continues without authentication (for public queries).
// If an invalid token is provided, the request is rejected.
func AuthMiddleware(authClient authPb.AuthServiceClient) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")

			// No token provided - allow public access
			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			// Token provided - validate format
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				writeGraphQLError(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			token := parts[1]

			// Validate token with auth-service
			resp, err := authClient.ValidateToken(r.Context(), &authPb.ValidateTokenRequest{
				Token: token,
			})
			if err != nil {
				if st, ok := status.FromError(err); ok {
					if st.Code() == codes.Unauthenticated {
						writeGraphQLError(w, "Invalid or expired token", http.StatusUnauthorized)
						return
					}
				}
				writeGraphQLError(w, "Failed to validate token", http.StatusInternalServerError)
				return
			}

			if !resp.Valid {
				writeGraphQLError(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}

			// Valid token - add user to context
			ctx := context.WithValue(r.Context(), UserContextKey, &authPb.UserData{
				Id:      resp.UserId,
				Email:   resp.Email,
				IsAdmin: resp.IsAdmin,
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext extracts authenticated user from context.
// Returns error if user is not authenticated (for protected resolvers).
func GetUserFromContext(ctx context.Context) (*authPb.UserData, error) {
	user, ok := ctx.Value(UserContextKey).(*authPb.UserData)
	if !ok || user == nil {
		return nil, status.Error(codes.Unauthenticated, "Unauthorized: Please login first")
	}
	return user, nil
}

// GetOptionalUserFromContext extracts user from context if present.
// Returns (nil, nil) if no user is authenticated (for public resolvers with optional auth).
func GetOptionalUserFromContext(ctx context.Context) (*authPb.UserData, error) {
	user, ok := ctx.Value(UserContextKey).(*authPb.UserData)
	if !ok || user == nil {
		return nil, nil // No user authenticated, but not an error
	}
	return user, nil
}

// GetUserIDFromContext extracts user ID from context.
// Returns error if user is not authenticated.
func GetUserIDFromContext(ctx context.Context) (int64, error) {
	user, err := GetUserFromContext(ctx)
	if err != nil {
		return 0, err
	}
	return user.Id, nil
}

// RequireAdmin checks if the authenticated user is an admin.
// Returns error if user is not authenticated or not an admin.
func RequireAdmin(ctx context.Context) error {
	user, err := GetUserFromContext(ctx)
	if err != nil {
		return err
	}
	if !user.IsAdmin {
		return status.Error(codes.PermissionDenied, "Admin access required")
	}
	return nil
}
