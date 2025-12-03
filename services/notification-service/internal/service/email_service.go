package service

import (
	"fmt"

	"github.com/damarteplok/damar-admin-cms/services/notification-service/internal/infrastructure/smtp"
)

type EmailService struct {
	smtpClient  *smtp.SMTPClient
	appURL      string
	frontendURL string
}

func NewEmailService(smtpClient *smtp.SMTPClient, appURL, frontendURL string) *EmailService {
	return &EmailService{
		smtpClient:  smtpClient,
		appURL:      appURL,
		frontendURL: frontendURL,
	}
}

func (s *EmailService) SendWelcomeEmail(email, name string, verificationToken string) error {
	data := map[string]string{
		"Name": name,
	}

	// Include verification URL only if token is provided
	if verificationToken != "" {
		verificationURL := fmt.Sprintf("%s/verify-email?token=%s", s.frontendURL, verificationToken)
		data["VerificationURL"] = verificationURL
	}

	return s.smtpClient.SendTemplateEmail(
		email,
		"Welcome to Damar Admin CMS",
		"welcome",
		data,
	)
}

func (s *EmailService) SendPasswordResetEmail(email, name, resetToken string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", s.frontendURL, resetToken)

	data := map[string]string{
		"Name":     name,
		"ResetURL": resetURL,
	}

	return s.smtpClient.SendTemplateEmail(
		email,
		"Password Reset Request - Damar Admin CMS",
		"password_reset",
		data,
	)
}

func (s *EmailService) SendEmailVerification(email, name, verificationToken string) error {
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", s.frontendURL, verificationToken)

	data := map[string]string{
		"Name":            name,
		"VerificationURL": verificationURL,
	}

	return s.smtpClient.SendTemplateEmail(
		email,
		"Email Verification - Damar Admin CMS",
		"email_verification",
		data,
	)
}
