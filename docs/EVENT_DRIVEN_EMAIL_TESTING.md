# Event-Driven Email Notification Testing Guide

## Architecture Overview

```
User Registration Flow:
┌────────────┐     ┌──────────────┐     ┌──────────────┐
│ API Gateway│────▶│ User Service │────▶│  PostgreSQL  │
└────────────┘     └──────────────┘     └──────────────┘
                           │
                           │ Publish Event
                           ▼
                    ┌──────────────┐
                    │   RabbitMQ   │
                    │ (damar.events│
                    │  exchange)   │
                    └──────────────┘
                           │
                           │ Subscribe
                           ▼
                ┌────────────────────────┐
                │ Notification Service   │
                │ (Event Consumer)       │
                └────────────────────────┘
                           │
                           │ Send Email
                           ▼
                    ┌──────────────┐
                    │   Mailhog    │
                    │ (SMTP Server)│
                    └──────────────┘
```

## Prerequisites

### 1. Start RabbitMQ

```bash
# RabbitMQ should already be running from brew
brew services start rabbitmq

# Verify RabbitMQ is running
open http://localhost:15672
# Login: guest/guest
```

### 2. Start Mailhog

```bash
# Start Mailhog SMTP server
mailhog

# Mailhog will start on:
# - SMTP: localhost:1025
# - Web UI: http://localhost:8025
```

### 3. Start All Services

```bash
# In project root
tilt up

# This will start:
# - user-service (50051)
# - auth-service (50052)
# - api-gateway (8080)
# - notification-service (event consumer)
```

## Testing the Flow

### Step 1: Register a New User

Open GraphQL Playground: http://localhost:8080/playground

```graphql
mutation RegisterUser {
  createUser(
    input: {
      name: "Test User"
      email: "test@example.com"
      password: "Password123!"
    }
  ) {
    success
    message
    data {
      id
      name
      email
      createdAt
    }
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "createUser": {
      "success": true,
      "message": "User created successfully",
      "data": {
        "id": "1",
        "name": "Test User",
        "email": "test@example.com",
        "createdAt": 1701615600
      }
    }
  }
}
```

### Step 2: Check RabbitMQ Management UI

1. Open http://localhost:15672
2. Go to **Exchanges** tab
3. Find exchange: `damar.events`
4. Click on it → **Publish message** section (for testing)
5. Go to **Queues** tab
6. Find queue: `notification.user.registered`
7. Check **Message rates** → should show messages passing through

### Step 3: Check Service Logs

Watch the notification-service logs in Tilt UI or terminal:

```bash
# You should see logs like:
2025-12-03T11:25:00.000+0700  INFO  Started consuming user.registered events
2025-12-03T11:25:05.123+0700  INFO  Processing user.registered event
  user_id: "1"
  email: "test@example.com"
  name: "Test User"
2025-12-03T11:25:05.456+0700  INFO  Email sent successfully
  to: "test@example.com"
  subject: "Welcome to Damar Admin CMS - Verify Your Email"
2025-12-03T11:25:05.457+0700  INFO  Welcome email sent successfully
  email: "test@example.com"
```

### Step 4: Check Email in Mailhog

1. Open Mailhog Web UI: http://localhost:8025
2. You should see a new email with:
   - **From**: Damar Admin CMS <noreply@damar-admin-cms.local>
   - **To**: test@example.com
   - **Subject**: Welcome to Damar Admin CMS - Verify Your Email
3. Click on the email to view the HTML template
4. Verify the welcome message and verification link

## Troubleshooting

### Issue: No email received in Mailhog

**Check 1: RabbitMQ Connection**

```bash
# Check if RabbitMQ is running
brew services list | grep rabbitmq

# Restart if needed
brew services restart rabbitmq
```

**Check 2: Mailhog Running**

```bash
# Check if Mailhog is running
ps aux | grep mailhog

# Restart if needed
pkill mailhog
mailhog
```

**Check 3: Service Logs**

- Check user-service logs for "Published user.registered event"
- Check notification-service logs for "Started consuming user.registered events"
- Check for any error messages

**Check 4: RabbitMQ Queue**

```bash
# List all queues
rabbitmqctl list_queues

# Should show:
# notification.user.registered  0
```

### Issue: RabbitMQ connection failed

**Solution:**

```bash
# Check RabbitMQ status
brew services info rabbitmq

# Check connection string in .env
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

### Issue: SMTP connection failed

**Solution:**

```bash
# Check SMTP configuration in .env
SMTP_HOST=localhost
SMTP_PORT=1025

# Restart Mailhog
pkill mailhog && mailhog
```

## Testing Other Email Flows

### Password Reset Email

Currently requires auth-service implementation to publish events. Will be added next.

### Email Verification Resend

Currently requires auth-service implementation. Will be added next.

## Monitoring

### RabbitMQ Management UI

- **URL**: http://localhost:15672
- **Username**: guest
- **Password**: guest
- **Features**:
  - View exchanges and queues
  - Monitor message rates
  - Publish test messages
  - Check connections

### Mailhog Web UI

- **URL**: http://localhost:8025
- **Features**:
  - View all sent emails
  - Search emails
  - View HTML/text content
  - Download email source

## Next Steps

1. **Add verification token generation** in auth-service
2. **Publish password reset events** from auth-service
3. **Add email verification resend** functionality
4. **Add more email templates** (account blocked, password changed, etc.)
5. **Add SMS notifications** via Twilio
6. **Add push notifications** via Firebase

## Configuration

Current configuration in `.env`:

```dotenv
# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672/

# SMTP (Mailhog)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@damar-admin-cms.local
SMTP_FROM_NAME=Damar Admin CMS

# Application URLs
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
```

## Event Routing Keys

Defined in `shared/contracts/amqp.go`:

```go
// User events
UserEventRegistered       = "user.event.registered"
UserEventPasswordChanged  = "user.event.password_changed"
UserEventEmailVerified    = "user.event.email_verified"

// Auth events
AuthEventPasswordResetRequested = "auth.event.password_reset_requested"
AuthEventVerificationRequested  = "auth.event.verification_requested"
```

## Summary

✅ RabbitMQ integration complete
✅ Notification service consuming events
✅ Email templates created
✅ Mailhog integration working
✅ User registration → email flow working

🔄 Next: Add verification token generation and password reset events
