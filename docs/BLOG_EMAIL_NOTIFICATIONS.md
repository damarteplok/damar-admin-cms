# Blog Post Email Notifications

This document explains the complete email notification system for blog post events in the content service.

## Overview

When blog posts are published or deleted, the system automatically sends email notifications to relevant stakeholders. This uses an event-driven architecture with RabbitMQ for message queueing and SMTP for email delivery.

## Architecture Flow

```
┌─────────────────┐    Event Published    ┌──────────────────────┐    Send Email    ┌────────────┐
│ Content Service │ ───────────────────> │ Notification Service │ ───────────────> │ Recipients │
│                 │      via RabbitMQ     │                      │     via SMTP     │            │
│ Blog CRUD Ops   │                      │  Email Templates     │                  │ Users/Admins│
└─────────────────┘                      └──────────────────────┘                  └────────────┘
```

### Components

1. **Content Service** - Publishes events when blog posts are created/updated/deleted
2. **RabbitMQ** - Message broker that routes events to notification service
3. **Notification Service** - Consumes events and sends appropriate emails
4. **SMTP Server** - Delivers emails to recipients

## Email Types

### 1. New Blog Post Published 📝

**Trigger**: When a blog post transitions to published state  
**Recipients**: Blog subscribers (currently admin@example.com)  
**Template**: `new_blog_post`  
**Subject**: `New Blog Post: {title} - Damar Admin CMS`

**Email Content**:

- Purple header (brand color #673AB7)
- Greeting with subscriber name
- Blog post title (24px, purple)
- Excerpt (first 150 characters with "...")
- "Read Full Article" button with link to blog post
- Fallback plain text URL
- Unsubscribe link in footer

**Data Structure**:

```go
{
    "Name": "Subscriber Name",
    "Title": "Blog Post Title",
    "Excerpt": "First 150 characters of body...",
    "BlogURL": "http://frontend.com/blog/blog-post-slug"
}
```

**HTML Preview**:

```
┌────────────────────────────────────┐
│ 📝 New Blog Post Published!        │ ← Purple header
├────────────────────────────────────┤
│ Hello John Doe,                    │
│                                    │
│ A new blog post has been published │
│ that you might be interested in:   │
│                                    │
│ Getting Started with Go Microservices │ ← Blog title (large, purple)
│                                    │
│ ┌────────────────────────────────┐ │
│ │ This comprehensive guide...    │ │ ← Excerpt box
│ └────────────────────────────────┘ │
│                                    │
│      [ Read Full Article ]         │ ← Purple button
│                                    │
│ http://frontend.com/blog/go-guide  │ ← Fallback URL
├────────────────────────────────────┤
│ © 2025 Damar Admin CMS             │
│ Unsubscribe from blog notifications│
└────────────────────────────────────┘
```

### 2. Blog Post Deleted 🗑️

**Trigger**: When a blog post is permanently deleted  
**Recipients**: Admin (admin@example.com)  
**Template**: `blog_post_deleted`  
**Subject**: `Blog Post Deleted - Damar Admin CMS`

**Email Content**:

- Red header (alert color #F44336)
- Deletion alert box with warning icon
- Admin name who deleted the post
- Blog post title
- Audit trail reminder

**Data Structure**:

```go
{
    "AdminName": "Admin",
    "Title": "Deleted Blog Post Title"
}
```

**HTML Preview**:

```
┌────────────────────────────────────┐
│ 🗑️ Blog Post Deleted               │ ← Red header
├────────────────────────────────────┤
│ Hello Admin,                       │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ⚠️ Deletion Notice             │ │ ← Alert box
│ │ A blog post has been deleted   │ │
│ │ from the system.               │ │
│ └────────────────────────────────┘ │
│                                    │
│ Deleted by: Admin User             │
│ Blog Post Title: My Old Post       │
│                                    │
│ This is a notification for audit   │
│ purposes. If unauthorized, review  │
│ system access logs immediately.    │
├────────────────────────────────────┤
│ © 2025 Damar Admin CMS             │
└────────────────────────────────────┘
```

## Implementation Details

### Email Service Methods

**Location**: `services/notification-service/internal/service/email_service.go`

```go
// SendNewBlogPostNotification sends email to subscribers when blog published
func (s *EmailService) SendNewBlogPostNotification(
    email string,      // Recipient email
    name string,       // Recipient name
    title string,      // Blog post title
    slug string,       // Blog post slug for URL
    excerpt string,    // Blog excerpt (first 150 chars)
) error

// SendBlogPostDeletedNotification sends email to admin when blog deleted
func (s *EmailService) SendBlogPostDeletedNotification(
    email string,      // Admin email
    adminName string,  // Admin name
    title string,      // Deleted blog post title
) error
```

### Event Consumers

**Location**: `services/notification-service/internal/infrastructure/events/event_consumer.go`

#### ConsumeContentPublished

```go
func (ec *EventConsumer) ConsumeContentPublished(ctx context.Context) error {
    // Queue: notification.content.published
    // Routing Key: content.event.published

    // Extracts: title, slug, body from event data
    // Creates excerpt: first 150 chars of body
    // Calls: SendNewBlogPostNotification(...)
}
```

**Event Data Structure**:

```json
{
  "owner_id": "blog-post-uuid",
  "data": {
    "id": "blog-post-uuid",
    "title": "Blog Post Title",
    "slug": "blog-post-slug",
    "body": "Full blog post content goes here...",
    "is_published": true,
    "published_at": "2024-01-15T10:30:00Z"
  }
}
```

#### ConsumeContentDeleted

```go
func (ec *EventConsumer) ConsumeContentDeleted(ctx context.Context) error {
    // Queue: notification.content.deleted
    // Routing Key: content.event.deleted

    // Extracts: title, slug from event data
    // Calls: SendBlogPostDeletedNotification(...)
}
```

**Event Data Structure**:

```json
{
  "owner_id": "blog-post-uuid",
  "data": {
    "id": "blog-post-uuid",
    "title": "Deleted Blog Post Title",
    "slug": "deleted-blog-slug"
  }
}
```

### Email Templates

**Location**: `services/notification-service/internal/infrastructure/smtp/smtp_client.go`

Templates use Go's `html/template` package with data binding via `{{.FieldName}}` syntax.

**Template Registry**:

```go
var emailTemplates = map[string]string{
    "new_blog_post": `<!DOCTYPE html>...`,
    "blog_post_deleted": `<!DOCTYPE html>...`,
}
```

**Template Variables**:

- `new_blog_post`: `{{.Name}}`, `{{.Title}}`, `{{.Excerpt}}`, `{{.BlogURL}}`
- `blog_post_deleted`: `{{.AdminName}}`, `{{.Title}}`

## Configuration

### Environment Variables

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use App Password for Gmail
SMTP_FROM=noreply@damar-admin-cms.com

# Application URLs
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:8080

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

### Recipient Configuration

**Current Implementation** (Hardcoded):

```go
// In event_consumer.go
adminEmail := "admin@example.com"
adminName := "Admin"
```

**Future Implementation** (Database-driven):

- Create `blog_subscribers` table
- Store subscriber emails, names, preferences
- Query subscribers in consumer
- Send batch emails to all active subscribers

## Testing Guide

### Setup

1. **Start RabbitMQ**:

```bash
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

2. **Configure SMTP** (Gmail example):

```bash
# Create App Password in Google Account settings
# Security → 2-Step Verification → App passwords
# Generate password for "Mail" application
```

3. **Update Test Email**:

```go
// In services/notification-service/internal/infrastructure/events/event_consumer.go
adminEmail := "your-test-email@gmail.com"
```

### Test Scenario 1: Publish Blog Post → Receive Email

**Step 1**: Start both services

```bash
# Terminal 1
cd services/content-service && go run cmd/main.go

# Terminal 2
cd services/notification-service && go run cmd/main.go
```

**Step 2**: Create and publish a blog post

```bash
# Create blog post (returns ID)
grpcurl -plaintext -d '{
  "title": "Test Blog Post",
  "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "author_id": "550e8400-e29b-41d4-a716-446655440000",
  "featured_image_url": "https://example.com/test.jpg",
  "is_published": false
}' localhost:50057 content.ContentService/CreateBlogPost

# Publish blog post (use returned ID)
grpcurl -plaintext -d '{
  "id": "RETURNED_BLOG_POST_ID"
}' localhost:50057 content.ContentService/PublishBlogPost
```

**Step 3**: Check email inbox

- Subject: `New Blog Post: Test Blog Post - Damar Admin CMS`
- Preview excerpt (first 150 chars)
- Click "Read Full Article" button

**Expected Logs**:

```
// content-service
INFO Event published event=content.event.published post_id=...

// notification-service
INFO Blog post published event received post_id=... title=Test Blog Post slug=test-blog-post
INFO Email sent successfully to=your-test-email@gmail.com template=new_blog_post
```

### Test Scenario 2: Delete Blog Post → Receive Admin Email

**Step 1**: Delete blog post

```bash
grpcurl -plaintext -d '{
  "id": "BLOG_POST_ID"
}' localhost:50057 content.ContentService/DeleteBlogPost
```

**Step 2**: Check admin email

- Subject: `Blog Post Deleted - Damar Admin CMS`
- Red alert styling
- Audit information

**Expected Logs**:

```
// content-service
INFO Event published event=content.event.deleted post_id=...

// notification-service
INFO Blog post deleted event received post_id=... title=Test Blog Post
INFO Email sent successfully to=admin@example.com template=blog_post_deleted
```

### Troubleshooting

#### Email Not Received

1. **Check SMTP credentials**:

```bash
# Test SMTP connection
telnet smtp.gmail.com 587
```

2. **Check spam/junk folder** - Automated emails often filtered

3. **Enable "Less secure app access"** (Gmail) or use App Password

4. **Check notification-service logs**:

```
ERROR Failed to send blog post notification error="..."
```

#### Event Not Consumed

1. **Verify RabbitMQ is running**:

```bash
curl http://localhost:15672/api/overview
# Should return JSON with RabbitMQ info
```

2. **Check queue bindings**:

```bash
# Visit http://localhost:15672
# Login: guest/guest
# Navigate to Queues → notification.content.published
# Check Bindings section
```

3. **Check consumer startup logs**:

```bash
# Should see in notification-service:
INFO Started consuming content.published events
INFO Started consuming content.deleted events
```

#### Template Rendering Errors

```bash
# Look for template errors in logs
ERROR Failed to render email template template=new_blog_post error="..."

# Common issues:
# - Missing template variables
# - Invalid HTML in template
# - Incorrect data map keys
```

## Future Enhancements

### Subscriber Management

**Database Schema**:

```sql
CREATE TABLE blog_subscribers (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    unsubscribed_at TIMESTAMP
);

CREATE TABLE blog_subscription_preferences (
    subscriber_id UUID REFERENCES blog_subscribers(id),
    category_id UUID REFERENCES blog_post_categories(id),
    frequency VARCHAR(50), -- 'instant', 'daily', 'weekly'
    PRIMARY KEY (subscriber_id, category_id)
);
```

**Implementation**:

```go
func (ec *EventConsumer) ConsumeContentPublished(ctx context.Context) error {
    // Query active subscribers
    subscribers, err := ec.subscriberRepo.GetActiveSubscribers(ctx)

    // Send email to each subscriber
    for _, subscriber := range subscribers {
        go ec.emailService.SendNewBlogPostNotification(
            subscriber.Email,
            subscriber.Name,
            title,
            slug,
            excerpt,
        )
    }
}
```

### Email Preferences

- Instant notifications (current behavior)
- Daily digest (batch emails once per day)
- Weekly digest (batch emails once per week)
- Category-specific subscriptions
- Unsubscribe link functionality

### Advanced Features

- **Rich Text Emails**: Enhanced styling, images, code blocks
- **A/B Testing**: Test different subject lines and templates
- **Analytics**: Track open rates, click rates
- **Personalization**: Recommended posts based on reading history
- **Push Notifications**: Web push and mobile push
- **Webhook Integration**: Slack, Discord, Teams notifications

## Related Files

### Content Service

- `services/content-service/internal/service/blog_post_service.go` - Publishes events
- `services/content-service/cmd/main.go` - Initializes RabbitMQ publisher

### Notification Service

- `services/notification-service/internal/infrastructure/events/event_consumer.go` - Consumes events
- `services/notification-service/internal/service/email_service.go` - Email sending logic
- `services/notification-service/internal/infrastructure/smtp/smtp_client.go` - SMTP client & templates
- `services/notification-service/cmd/main.go` - Wires up consumers

### Shared

- `shared/contracts/amqp.go` - Event routing key constants
- `shared/amqp/rabbitmq.go` - RabbitMQ connection helpers

## Security Considerations

1. **SMTP Credentials**: Store in environment variables, never commit to git
2. **Email Validation**: Validate email formats before sending
3. **Rate Limiting**: Prevent email spam (future: implement rate limiting)
4. **Unsubscribe**: Implement proper unsubscribe mechanism (GDPR compliance)
5. **Template Injection**: Sanitize user input in email templates
6. **Audit Logs**: Log all email sends for compliance

## Performance Optimization

1. **Batch Sending**: Send emails in batches rather than one-by-one
2. **Async Processing**: Use goroutines for concurrent email sending
3. **Queue Management**: Configure RabbitMQ prefetch for better throughput
4. **Template Caching**: Cache parsed templates in memory
5. **Connection Pooling**: Reuse SMTP connections
