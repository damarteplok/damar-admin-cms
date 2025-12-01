package jwt

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenManager struct {
	secretKey            string
	accessTokenDuration  time.Duration
	refreshTokenDuration time.Duration
}

type Claims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

func NewTokenManager(secretKey string, accessTokenDuration, refreshTokenDuration time.Duration) *TokenManager {
	return &TokenManager{
		secretKey:            secretKey,
		accessTokenDuration:  accessTokenDuration,
		refreshTokenDuration: refreshTokenDuration,
	}
}

func (tm *TokenManager) GenerateAccessToken(userID int64, email string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(tm.accessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(tm.secretKey))
}

func (tm *TokenManager) GenerateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate refresh token: %w", err)
	}
	return hex.EncodeToString(b), nil
}

// GeneratePasswordResetToken generates a random token for password reset
func (tm *TokenManager) GeneratePasswordResetToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate password reset token: %w", err)
	}
	return hex.EncodeToString(b), nil
}

// GenerateEmailVerificationToken generates a random token for email verification
func (tm *TokenManager) GenerateEmailVerificationToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate email verification token: %w", err)
	}
	return hex.EncodeToString(b), nil
}

func (tm *TokenManager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(tm.secretKey), nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

// ValidateAccessToken is an alias for ValidateToken (for clarity in service layer)
func (tm *TokenManager) ValidateAccessToken(tokenString string) (*Claims, error) {
	return tm.ValidateToken(tokenString)
}

// ValidateRefreshToken validates refresh token structure (not JWT, just returns claims for consistency)
func (tm *TokenManager) ValidateRefreshToken(tokenString string) (*Claims, error) {
	// Refresh tokens are random strings, not JWTs
	// This method is just for interface consistency
	// Actual validation happens in service layer by checking database
	if tokenString == "" {
		return nil, fmt.Errorf("empty refresh token")
	}
	// Return empty claims, service layer will fetch user from database
	return &Claims{}, nil
}

func (tm *TokenManager) GetRefreshTokenDuration() time.Duration {
	return tm.refreshTokenDuration
}
