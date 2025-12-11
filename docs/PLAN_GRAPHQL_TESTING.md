# Plan GraphQL API Testing Guide

This guide demonstrates how to test Plan CRUD operations via GraphQL API Gateway.

## Prerequisites

1. Start all services using Tilt (product-service now auto-starts):

```bash
tilt up
```

2. Make sure these services are running:

   - API Gateway (port 8080)
   - Auth Service (port 50052)
   - User Service (port 50051)
   - Product Service (port 50054)
   - PostgreSQL

3. Access GraphQL Playground: http://localhost:8080/playground

## Authentication

All Plan mutations (create, update, delete) require **admin authentication**.

### 1. Login as Admin

```graphql
mutation Login {
  login(input: { email: "admin@example.com", password: "admin123" }) {
    success
    message
    data {
      accessToken
      user {
        isAdmin
      }
    }
  }
}
```

### 2. Set Authorization Header

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

## Plan Queries

### Get All Plans (Public)

```graphql
query GetPlans {
  plans(
    page: 1
    perPage: 10
    search: ""
    sortBy: "name"
    sortOrder: "asc"
    activeOnly: true
    visibleOnly: true
  ) {
    success
    message
    data {
      plans {
        id
        name
        slug
        intervalId
        productId
        isActive
        hasTrial
        trialIntervalId
        intervalCount
        trialIntervalCount
        description
        type
        maxUsersPerTenant
        meterId
        isVisible
        createdAt
        updatedAt
      }
      total
      page
      perPage
    }
  }
}
```

### Get Plans with Search

```graphql
query SearchPlans {
  plans(page: 1, perPage: 10, search: "basic") {
    success
    message
    data {
      plans {
        id
        name
        slug
        type
      }
      total
    }
  }
}
```

### Get Plans with Sorting

```graphql
query SortedPlans {
  plans(page: 1, perPage: 10, sortBy: "created_at", sortOrder: "desc") {
    success
    message
    data {
      plans {
        id
        name
        slug
        createdAt
      }
      total
    }
  }
}
```

### Get Plans with Filters

```graphql
query GetActivePlans {
  plans(page: 1, perPage: 10, activeOnly: true, visibleOnly: true) {
    success
    message
    data {
      plans {
        id
        name
        slug
        type
        isActive
        isVisible
      }
      total
    }
  }
}
```

### Get Plan by ID

```graphql
query GetPlan {
  plan(id: "1") {
    success
    message
    data {
      id
      name
      slug
      productId
      type
      intervalId
      intervalCount
      description
      isActive
      isVisible
    }
  }
}
```

### Get Plan by Slug

```graphql
query GetPlanBySlug {
  planBySlug(slug: "basic-monthly") {
    success
    message
    data {
      id
      name
      slug
      type
      description
    }
  }
}
```

### Get Plans by Product

```graphql
query GetPlansByProduct {
  plansByProduct(productId: "1") {
    success
    message
    data {
      id
      name
      slug
      type
      intervalCount
      intervalId
    }
  }
}
```

## Plan Mutations (Admin Only)

### Create Plan

**Important: Slug is now optional!** If you don't provide a slug, the backend will automatically generate one from the plan name.

```graphql
mutation CreatePlan {
  createPlan(
    input: {
      name: "Basic Monthly"
      # slug is optional - will auto-generate if not provided
      productId: "1"
      intervalId: "3"
      intervalCount: 1
      type: "flat_rate"
      description: "Basic plan billed monthly"
      maxUsersPerTenant: 10
      isActive: true
      isVisible: true
      hasTrial: true
      trialIntervalId: "1"
      trialIntervalCount: 14
    }
  ) {
    success
    message
    data {
      id
      name
      slug
      productId
      type
      intervalId
      intervalCount
      isActive
      isVisible
      hasTrial
      trialIntervalId
      trialIntervalCount
      createdAt
    }
  }
}
```

**With custom slug:**

```graphql
mutation CreatePlanWithSlug {
  createPlan(
    input: {
      name: "Enterprise Plan"
      slug: "custom-enterprise-slug"
      productId: "1"
      intervalId: "4"
      intervalCount: 1
      type: "per_unit"
    }
  ) {
    success
    data {
      id
      name
      slug
    }
  }
}
```

**Minimal Create (auto-generated slug):**

```graphql
mutation CreateMinimalPlan {
  createPlan(
    input: {
      name: "Pro Annual"
      productId: "1"
      intervalId: "4"
      intervalCount: 1
      type: "per_unit"
    }
  ) {
    success
    message
    data {
      id
      name
      slug
      type
    }
  }
}
```

### Update Plan

```graphql
mutation UpdatePlan {
  updatePlan(
    input: {
      id: "1"
      name: "Basic Monthly Updated"
      slug: "basic-monthly-v2"
      intervalId: "3"
      intervalCount: 1
      type: "flat_rate"
      description: "Updated basic monthly plan"
      maxUsersPerTenant: 20
      isActive: true
      isVisible: true
    }
  ) {
    success
    message
    data {
      id
      name
      slug
      maxUsersPerTenant
      updatedAt
    }
  }
}
```

### Delete Plan

```graphql
mutation DeletePlan {
  deletePlan(id: "1") {
    success
    message
  }
}
```

## Field Descriptions

### Query Parameters

**Pagination:**

- **page**: Page number (default: 1)
- **perPage**: Items per page (default: 10)

**Search & Sort:**

- **search**: Search by plan name, slug, or description
- **sortBy**: Field to sort by (e.g., "name", "created_at", "interval_count")
- **sortOrder**: Sort direction ("asc" or "desc", default: "asc")

**Filters:**

- **activeOnly**: Show only active plans
- **visibleOnly**: Show only visible plans

### Plan Types

- **flat_rate**: Fixed price subscription (e.g., $10/month)
- **per_unit**: Price per seat/user (e.g., $5/user/month)
- **tiered**: Different pricing tiers based on usage

### Interval IDs

You need to reference existing interval IDs from your database. Common intervals:

- **1**: Day
- **2**: Week
- **3**: Month
- **4**: Year

Example query to get intervals:

```sql
SELECT id, name FROM intervals;
```

### Trial Configuration

- **hasTrial**: Boolean flag to enable trial period
- **trialIntervalId**: Interval type for trial (usually days)
- **trialIntervalCount**: Number of intervals (e.g., 14 for 14 days)

### Visibility & Status

- **isActive**: Plan is available for new subscriptions
- **isVisible**: Plan is displayed in public listings
- **maxUsersPerTenant**: Maximum users allowed per tenant (null = unlimited)

## Testing Scenarios

### Scenario 1: Create Complete Plan

1. **First, get a product ID:**

```graphql
query {
  products(page: 1, perPage: 1) {
    data {
      products {
        id
        name
      }
    }
  }
}
```

2. **Create plan with all features:**

```graphql
mutation {
  createPlan(
    input: {
      name: "Enterprise Annual"
      productId: "1"
      intervalId: "4"
      intervalCount: 1
      type: "per_unit"
      description: "Enterprise plan with annual billing"
      maxUsersPerTenant: 100
      isActive: true
      isVisible: true
      hasTrial: true
      trialIntervalId: "1"
      trialIntervalCount: 30
    }
  ) {
    success
    data {
      id
      name
      slug
    }
  }
}
```

3. **Query the created plan:**

```graphql
query {
  planBySlug(slug: "enterprise-annual") {
    success
    data {
      id
      name
      type
      maxUsersPerTenant
      hasTrial
      trialIntervalCount
    }
  }
}
```

### Scenario 2: Create Plans for a Product

```graphql
# Basic Plan
mutation CreateBasic {
  createPlan(
    input: {
      name: "Starter"
      productId: "1"
      intervalId: "3"
      intervalCount: 1
      type: "flat_rate"
      maxUsersPerTenant: 5
      isActive: true
      isVisible: true
    }
  ) {
    success
    data {
      id
      name
    }
  }
}

# Pro Plan
mutation CreatePro {
  createPlan(
    input: {
      name: "Professional"
      productId: "1"
      intervalId: "3"
      intervalCount: 1
      type: "per_unit"
      maxUsersPerTenant: 50
      isActive: true
      isVisible: true
      hasTrial: true
      trialIntervalId: "1"
      trialIntervalCount: 14
    }
  ) {
    success
    data {
      id
      name
    }
  }
}

# Then get all plans for the product
query GetProductPlans {
  plansByProduct(productId: "1") {
    success
    data {
      id
      name
      type
      maxUsersPerTenant
    }
  }
}
```

### Scenario 3: Update Plan Configuration

```graphql
mutation {
  updatePlan(
    input: {
      id: "1"
      name: "Starter Pro"
      intervalId: "3"
      intervalCount: 1
      type: "flat_rate"
      maxUsersPerTenant: 10
      isVisible: true
    }
  ) {
    success
    message
  }
}
```

### Scenario 4: Authorization Testing

**Without auth (queries should work):**

```graphql
query {
  plans(page: 1, perPage: 5) {
    success
    data {
      plans {
        id
        name
      }
    }
  }
}
```

**Without auth (mutations should fail):**

```graphql
mutation {
  createPlan(
    input: {
      name: "Test"
      productId: "1"
      intervalId: "3"
      intervalCount: 1
      type: "flat_rate"
    }
  ) {
    success
    message
  }
}
# Expected: "Admin access required"
```

## Expected Responses

### Successful Create:

```json
{
  "data": {
    "createPlan": {
      "success": true,
      "message": "Plan created successfully",
      "data": {
        "id": "1",
        "name": "Basic Monthly",
        "slug": "basic-monthly",
        ...
      }
    }
  }
}
```

### Authorization Error:

```json
{
  "data": {
    "createPlan": {
      "success": false,
      "message": "Admin access required",
      "data": null
    }
  }
}
```

### Validation Error:

```json
{
  "data": {
    "createPlan": {
      "success": false,
      "message": "Invalid product ID",
      "data": null
    }
  }
}
```

## Notes

1. **Admin Authorization**: All mutations require `isAdmin: true` in JWT
2. **Product Dependency**: Plans must reference an existing product
3. **Interval Dependency**: intervalId must exist in your intervals table
4. **Slug Auto-generation**: If slug not provided in createPlan, it's auto-generated from name (similar to products and tenants)
5. **Default Values**:
   - `isActive`: defaults to `true`
   - `isVisible`: defaults to `true`
   - `hasTrial`: defaults to `false`
6. **Search**: Searches across plan name, slug, and description fields
7. **Sorting**: Supports sorting by any plan field (name, created_at, interval_count, etc.)
8. **Filters**: Use `activeOnly` and `visibleOnly` to filter plan listings
9. **Pagination**: Supports page and perPage parameters (default: page=1, perPage=10)

## Common Intervals Setup

Before creating plans, ensure you have interval types in database:

```sql
INSERT INTO intervals (name) VALUES
  ('day'),
  ('week'),
  ('month'),
  ('year');
```

## Troubleshooting

### "Admin access required"

- Verify logged in as admin
- Check Authorization header format
- Ensure token hasn't expired

### "Invalid product ID"

- Verify product exists using `products` query
- Ensure product ID is correct integer

### "Invalid interval ID"

- Check intervals table has required interval types
- Use correct interval ID for billing period

### gRPC connection errors

- Ensure product-service running (port 50054)
- Check Tilt dashboard status
- Review product-service logs

## Next Steps

After testing Plan operations:

1. **Plan Prices** - Add pricing information to plans
2. **Plan Meters** - Add usage-based billing features
3. **Discounts** - Apply discounts to plans
4. **Subscriptions** - Create subscriptions using these plans
