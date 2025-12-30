# Content Service RabbitMQ Integration Testing

## 🎯 Event Flow

### 1. Blog Post Published

```
Admin publish blog post
       ↓
content-service → RabbitMQ (content.event.published)
       ↓
notification-service receives event
       ↓
Logs: "Blog post published event received"
```

### 2. Blog Post Deleted

```
Admin delete blog post
       ↓
content-service → RabbitMQ (content.event.deleted)
       ↓
notification-service receives event
       ↓
Logs: "Blog post deleted event received"
```

## 🧪 How to Test

### Prerequisites

1. PostgreSQL running on localhost:5432
2. RabbitMQ running on localhost:5672

### Step 1: Run Migrations

```bash
cd /Users/damarhuda/Latihan/damar-admin-cms
make migrate-up
```

### Step 2: Start Services via Tilt

```bash
tilt up
```

This will start:

- content-service (port 50057)
- notification-service (consuming events)
- api-gateway (port 8080)

### Step 3: Test via GraphQL

**Create & Publish Blog Post:**

```graphql
# 1. Create blog post (draft)
mutation {
  createBlogPost(
    input: {
      title: "Test Blog Post"
      body: "This is a test content"
      userId: 1
    }
  ) {
    success
    data {
      id
      slug
      isPublished
    }
  }
}

# 2. Publish the post (triggers notification)
mutation {
  publishBlogPost(id: 1) {
    success
    data {
      id
      isPublished
      publishedAt
    }
  }
}

# 3. Delete the post (triggers notification)
mutation {
  deleteBlogPost(id: 1) {
    success
    message
  }
}
```

### Step 4: Check Logs

**Content Service logs:**

```
Published content event | routing_key=content.event.published | post_id=1 | slug=test-blog-post
```

**Notification Service logs:**

```
Blog post published event received | post_id=1 | title=Test Blog Post | slug=test-blog-post
```

## 📋 Current Implementation Status

### ✅ Implemented

- Event publishing from content-service
- Event consuming in notification-service
- Logging of received events

### 🚧 TODO (Future Enhancement)

- Send email to subscribers when blog published
- Send email to admin when blog deleted
- Batch notifications for multiple posts
- Subscriber management system

## 🔧 Optional: Disable RabbitMQ

If you want to run without RabbitMQ, edit `.env`:

```bash
# Comment out or remove
# RABBITMQ_URL=amqp://guest:guest@localhost:5672/
```

Services will log warnings but continue working without event notifications.
