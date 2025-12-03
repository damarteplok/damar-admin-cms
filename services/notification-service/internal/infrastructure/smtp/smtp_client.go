package smtp

import (
	"bytes"
	"fmt"
	"html/template"

	"github.com/damarteplok/damar-admin-cms/shared/logger"
	"go.uber.org/zap"
	"gopkg.in/gomail.v2"
)

type SMTPClient struct {
	host     string
	port     int
	user     string
	password string
	from     string
	fromName string
	dialer   *gomail.Dialer
}

func NewSMTPClient(host string, port int, user, password, from, fromName string) *SMTPClient {
	dialer := gomail.NewDialer(host, port, user, password)

	if user == "" {
		dialer.SSL = false
		dialer.TLSConfig = nil
	}

	return &SMTPClient{
		host:     host,
		port:     port,
		user:     user,
		password: password,
		from:     from,
		fromName: fromName,
		dialer:   dialer,
	}
}

func (c *SMTPClient) SendEmail(to, subject, htmlBody string) error {
	m := gomail.NewMessage()

	m.SetAddressHeader("From", c.from, c.fromName)

	m.SetHeader("To", to)

	m.SetHeader("Subject", subject)

	// Set HTML body
	m.SetBody("text/html", htmlBody)

	// Send email
	if err := c.dialer.DialAndSend(m); err != nil {
		logger.Error("Failed to send email",
			zap.String("to", to),
			zap.String("subject", subject),
			zap.Error(err))
		return fmt.Errorf("failed to send email: %w", err)
	}

	logger.Info("Email sent successfully",
		zap.String("to", to),
		zap.String("subject", subject))

	return nil
}

func (c *SMTPClient) SendTemplateEmail(to, subject, templateName string, data interface{}) error {
	htmlBody, err := renderTemplate(templateName, data)
	if err != nil {
		return fmt.Errorf("failed to render template: %w", err)
	}

	return c.SendEmail(to, subject, htmlBody)
}

func renderTemplate(templateName string, data interface{}) (string, error) {
	tmpl, err := template.New(templateName).Parse(emailTemplates[templateName])
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return buf.String(), nil
}

// Email templates
var emailTemplates = map[string]string{
	"welcome": `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Damar Admin CMS!</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{.Name}}</strong>,</p>
            <p>Thank you for registering! Your account has been created successfully.</p>
            <p>Please verify your email address to activate your account:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{.VerificationURL}}" class="button">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{.VerificationURL}}</p>
            <p>This verification link will expire in 24 hours.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Damar Admin CMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
	"password_reset": `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{.Name}}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{.ResetURL}}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{.ResetURL}}</p>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This password reset link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2025 Damar Admin CMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
	"email_verification": `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{{.Name}}</strong>,</p>
            <p>Please verify your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{.VerificationURL}}" class="button">Verify Email</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{{.VerificationURL}}</p>
            <p>This verification link will expire in 24 hours.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Damar Admin CMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
}
