# Announcements CRUD Testing Guide

This document provides step-by-step instructions for testing the Announcements CRUD functionality via GraphQL API Gateway.

## Prerequisites

- All services running via Tiltfile (`tilt up`)
- GraphQL Playground accessible at `http://localhost:8080/playground`
- Admin authentication token (from login mutation)

## Database Schema

The `announcements` table structure:

```sql
CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    starts_at TIMESTAMP(0) NULL,
    ends_at TIMESTAMP(0) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_dismissible BOOLEAN NOT NULL DEFAULT TRUE,
    show_for_customers BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_frontend BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_user_dashboard BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);
```

## Test Scenarios

### 1. Login as Admin (Required for CRUD Operations)

```graphql
mutation Login {
  login(input: { email: "admin@example.com", password: "password123" }) {
    success
    message
    data {
      accessToken
      refreshToken
      user {
        id
        name
        email
        isAdmin
      }
    }
  }
}
```

**Set the Authorization header** for subsequent requests:

```
Authorization: Bearer <accessToken>
```

---

### 2. Create Announcement

#### Test Case 2.1: Basic Announcement (All Defaults)

```graphql
mutation CreateBasicAnnouncement {
  createAnnouncement(
    input: {
      title: "System Maintenance"
      content: "<p>Our system will undergo scheduled maintenance on Saturday.</p>"
    }
  ) {
    success
    message
    data {
      id
      title
      content
      startsAt
      endsAt
      isActive
      isDismissible
      showForCustomers
      showOnFrontend
      showOnUserDashboard
      createdAt
      updatedAt
    }
  }
}
```

**Expected Result:**

- `success: true`
- `isActive: true` (default)
- `isDismissible: true` (default)
- All `show*` fields: `true` (defaults)

---

#### Test Case 2.2: Scheduled Announcement with Date Range

```graphql
mutation CreateScheduledAnnouncement {
  createAnnouncement(
    input: {
      title: "Holiday Sale - 50% Off!"
      content: "<h2>Special Holiday Offer</h2><p>Get 50% off all premium plans until New Year!</p>"
      startsAt: 1735689600 # Dec 31, 2024 00:00:00 UTC
      endsAt: 1735862399 # Jan 1, 2025 23:59:59 UTC
      isActive: true
      showForCustomers: true
      showOnFrontend: true
      showOnUserDashboard: false
    }
  ) {
    success
    message
    data {
      id
      title
      content
      startsAt
      endsAt
      isActive
      showOnFrontend
      showOnUserDashboard
    }
  }
}
```

**Expected Result:**

- `startsAt` and `endsAt` timestamps set correctly
- `showOnUserDashboard: false`
- `showOnFrontend: true`

---

#### Test Case 2.3: Non-Dismissible Critical Alert

```graphql
mutation CreateCriticalAlert {
  createAnnouncement(
    input: {
      title: "⚠️ Critical Security Update Required"
      content: "<div style='color:red;'><strong>Action Required:</strong> Please update your password immediately.</div>"
      isActive: true
      isDismissible: false
      showForCustomers: true
      showOnFrontend: true
      showOnUserDashboard: true
    }
  ) {
    success
    message
    data {
      id
      title
      isDismissible
      isActive
    }
  }
}
```

**Expected Result:**

- `isDismissible: false`
- `isActive: true`

---

### 3. Get Announcement by ID

```graphql
query GetAnnouncement {
  announcement(id: "1") {
    success
    message
    data {
      id
      title
      content
      startsAt
      endsAt
      isActive
      isDismissible
      showForCustomers
      showOnFrontend
      showOnUserDashboard
      createdAt
      updatedAt
    }
  }
}
```

**Expected Result:**

- Returns full announcement details
- All fields properly formatted

---

### 4. Get All Announcements (Paginated)

#### Test Case 4.1: First Page (Default)

```graphql
query GetAllAnnouncements {
  announcements(page: 1, perPage: 10, sortBy: "created_at", sortOrder: "desc") {
    success
    message
    data {
      announcements {
        id
        title
        content
        isActive
        startsAt
        endsAt
        createdAt
      }
      total
      page
      perPage
    }
  }
}
```

**Expected Result:**

- Returns up to 10 announcements
- Sorted by `created_at` descending (newest first)
- `total` reflects total count in database

---

#### Test Case 4.2: Search Announcements

```graphql
query SearchAnnouncements {
  announcements(
    page: 1
    perPage: 10
    search: "maintenance"
    sortBy: "created_at"
    sortOrder: "desc"
  ) {
    success
    message
    data {
      announcements {
        id
        title
        content
      }
      total
    }
  }
}
```

**Expected Result:**

- Returns only announcements matching "maintenance" in title or content
- Case-insensitive search

---

### 5. Get Active Announcements (Public Endpoint)

#### Test Case 5.1: Frontend Active Announcements

```graphql
query GetFrontendAnnouncements {
  activeAnnouncements(forFrontend: true) {
    success
    message
    data {
      id
      title
      content
      isDismissible
      startsAt
      endsAt
    }
  }
}
```

**Expected Result:**

- Returns only active announcements where:
  - `is_active = true`
  - `show_on_frontend = true`
  - Current time is between `starts_at` and `ends_at` (if set)

---

#### Test Case 5.2: User Dashboard Announcements

```graphql
query GetUserDashboardAnnouncements {
  activeAnnouncements(forUserDashboard: true) {
    success
    message
    data {
      id
      title
      content
      isDismissible
    }
  }
}
```

**Expected Result:**

- Returns announcements where `show_on_user_dashboard = true`

---

#### Test Case 5.3: Multiple Filters

```graphql
query GetMultipleVisibilityAnnouncements {
  activeAnnouncements(
    forFrontend: true
    forUserDashboard: true
    forCustomers: true
  ) {
    success
    message
    data {
      id
      title
      showOnFrontend
      showOnUserDashboard
      showForCustomers
    }
  }
}
```

**Expected Result:**

- Returns announcements matching ANY of the visibility criteria (OR logic)

---

### 6. Update Announcement

#### Test Case 6.1: Update Content and Title

```graphql
mutation UpdateAnnouncementContent {
  updateAnnouncement(
    input: {
      id: "1"
      title: "System Maintenance - Updated"
      content: "<p>Maintenance rescheduled to Sunday at 2 AM.</p>"
      isActive: true
      isDismissible: true
      showForCustomers: true
      showOnFrontend: true
      showOnUserDashboard: true
    }
  ) {
    success
    message
    data {
      id
      title
      content
      updatedAt
    }
  }
}
```

**Expected Result:**

- Title and content updated
- `updatedAt` timestamp reflects current time

---

#### Test Case 6.2: Deactivate Announcement

```graphql
mutation DeactivateAnnouncement {
  updateAnnouncement(
    input: {
      id: "2"
      title: "Holiday Sale - 50% Off!"
      content: "<p>Sale has ended. Thank you!</p>"
      isActive: false
      isDismissible: true
      showForCustomers: true
      showOnFrontend: true
      showOnUserDashboard: false
    }
  ) {
    success
    message
    data {
      id
      isActive
      updatedAt
    }
  }
}
```

**Expected Result:**

- `isActive: false`
- Announcement no longer appears in `activeAnnouncements` query

---

#### Test Case 6.3: Update Date Range

```graphql
mutation UpdateAnnouncementDates {
  updateAnnouncement(
    input: {
      id: "1"
      title: "Extended Maintenance Window"
      content: "<p>Maintenance window extended by 2 hours.</p>"
      startsAt: 1735689600
      endsAt: 1735696800
      isActive: true
      isDismissible: true
      showForCustomers: true
      showOnFrontend: true
      showOnUserDashboard: true
    }
  ) {
    success
    message
    data {
      id
      startsAt
      endsAt
    }
  }
}
```

**Expected Result:**

- `startsAt` and `endsAt` updated correctly

---

### 7. Delete Announcement

```graphql
mutation DeleteAnnouncement {
  deleteAnnouncement(id: "3") {
    success
    message
  }
}
```

**Expected Result:**

- `success: true`
- `message: "Announcement deleted successfully"`
- Subsequent queries for ID 3 return "Announcement not found"

---

## Error Cases to Test

### 8.1 Create Without Authentication

```graphql
mutation CreateWithoutAuth {
  createAnnouncement(input: { title: "Test", content: "Test content" }) {
    success
    message
  }
}
```

**Expected Result:**

- `success: false`
- `message: "Unauthorized: authentication required"`

---

### 8.2 Non-Admin User Attempts CRUD

Set authorization header with a **non-admin user token**, then:

```graphql
mutation NonAdminCreate {
  createAnnouncement(input: { title: "Test", content: "Test" }) {
    success
    message
  }
}
```

**Expected Result:**

- `success: false`
- `message: "Forbidden: admin access required"`

---

### 8.3 Invalid Date Range (End Before Start)

```graphql
mutation InvalidDateRange {
  createAnnouncement(
    input: {
      title: "Invalid Dates"
      content: "Test"
      startsAt: 1735862399
      endsAt: 1735689600
    }
  ) {
    success
    message
  }
}
```

**Expected Result:**

- `success: false`
- `message: "end date must be after start date"`

---

### 8.4 Get Non-Existent Announcement

```graphql
query GetNonExistent {
  announcement(id: "999999") {
    success
    message
  }
}
```

**Expected Result:**

- `success: false`
- `message: "Announcement not found"`

---

### 8.5 Update Non-Existent Announcement

```graphql
mutation UpdateNonExistent {
  updateAnnouncement(
    input: {
      id: "999999"
      title: "Test"
      content: "Test"
      isActive: true
      isDismissible: true
      showForCustomers: true
      showOnFrontend: true
      showOnUserDashboard: true
    }
  ) {
    success
    message
  }
}
```

**Expected Result:**

- `success: false`
- `message: "announcement not found"`

---

## Performance Testing

### 9.1 Bulk Create (10 Announcements)

Create 10 announcements sequentially and measure total time.

### 9.2 Large Pagination Test

```graphql
query LargePage {
  announcements(page: 1, perPage: 100) {
    success
    data {
      total
      announcements {
        id
        title
      }
    }
  }
}
```

**Expected Result:**

- Query executes within acceptable time (< 500ms)
- Index on `is_active` and date columns improves performance

---

## Database Validation

After completing tests, verify database state:

```sql
-- Check all announcements
SELECT id, title, is_active, starts_at, ends_at
FROM announcements
ORDER BY created_at DESC;

-- Check active announcements with date range
SELECT id, title, starts_at, ends_at
FROM announcements
WHERE is_active = TRUE
  AND (starts_at IS NULL OR starts_at <= NOW())
  AND (ends_at IS NULL OR ends_at >= NOW());

-- Check visibility flags
SELECT id, title,
       show_for_customers,
       show_on_frontend,
       show_on_user_dashboard
FROM announcements
WHERE is_active = TRUE;
```

---

## Integration Points

### Content Service (gRPC)

- **Host**: `localhost:50057`
- **Methods**:
  - `GetAnnouncementByID`
  - `GetAllAnnouncements`
  - `CreateAnnouncement`
  - `UpdateAnnouncement`
  - `DeleteAnnouncement`
  - `GetActiveAnnouncements`

### API Gateway (GraphQL)

- **Endpoint**: `http://localhost:8080/query`
- **Playground**: `http://localhost:8080/playground`
- **Auth**: Bearer token in `Authorization` header

---

## Summary of Test Coverage

✅ **CRUD Operations**: Create, Read, Update, Delete  
✅ **Authentication**: Admin-only access control  
✅ **Authorization**: Non-admin rejection  
✅ **Validation**: Date range validation, required fields  
✅ **Pagination**: Page, perPage, sorting  
✅ **Search**: Case-insensitive content/title search  
✅ **Filtering**: Active announcements by visibility flags  
✅ **Date Logic**: Scheduled announcements (start/end dates)  
✅ **Error Handling**: Not found, validation errors  
✅ **Database**: Indexes for performance optimization

---

## Next Steps

1. **Frontend Implementation**: Build Announcements CRUD UI following the Blog Post pattern
2. **Role-Based Access**: Extend to support editor/viewer roles
3. **Notifications**: Trigger push notifications when announcements are published
4. **Analytics**: Track announcement impressions and dismissals
5. **Rich Text Editor**: Implement HTML editor for content field
6. **Preview**: Add announcement preview before publishing
7. **Scheduling**: Auto-activate/deactivate based on date ranges (background job)

---

**Testing Completed**: [Date]  
**Tested By**: [Name]  
**Status**: ✅ All tests passing
