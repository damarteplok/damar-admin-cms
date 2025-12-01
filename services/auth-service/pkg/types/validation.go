package types

// LogoutValidation validates logout request
type LogoutValidation struct {
	RefreshToken string `validate:"required"`
	UserID       int64  `validate:"required,min=1"`
}

// ChangePasswordValidation validates change password request
type ChangePasswordValidation struct {
	UserID      int64  `validate:"required,min=1"`
	OldPassword string `validate:"required,min=8"`
	NewPassword string `validate:"required,min=8"`
}

// ForgotPasswordValidation validates forgot password request
type ForgotPasswordValidation struct {
	Email string `validate:"required,email"`
}

// ResetPasswordValidation validates reset password request
type ResetPasswordValidation struct {
	Token       string `validate:"required"`
	NewPassword string `validate:"required,min=8"`
}

// VerifyResetTokenValidation validates verify reset token request
type VerifyResetTokenValidation struct {
	Token string `validate:"required"`
}

// SendVerificationEmailValidation validates send verification email request
type SendVerificationEmailValidation struct {
	UserID int64  `validate:"required,min=1"`
	Email  string `validate:"required,email"`
}

// VerifyEmailValidation validates verify email request
type VerifyEmailValidation struct {
	Token string `validate:"required"`
}
