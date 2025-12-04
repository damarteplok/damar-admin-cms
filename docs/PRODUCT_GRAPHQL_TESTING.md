# Product GraphQL API Testing Guide

This guide demonstrates how to test Product CRUD operations via GraphQL API Gateway.

## Prerequisites

1. Start all services using Tilt:

```bash
tilt up
```

2. Make sure these services are running:

   - API Gateway (port 8080)
   - Auth Service (port 50052)
   - User Service (port 50051)
   - Product Service (port 50054)
   - PostgreSQL
   - RabbitMQ

3. Access GraphQL Playground: http://localhost:8080/playground

## Authentication

All Product mutations (create, update, delete) require **admin authentication**.

### 1. Login as Admin

First, login to get an access token:

```graphql
mutation Login {
  login(input: { email: "admin@example.com", password: "admin123" }) {
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

### 2. Set Authorization Header

Copy the `accessToken` from the response and add it to HTTP Headers in GraphQL Playground:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

## Product Queries

### Get All Products (Public - No Auth Required)

```graphql
query GetProducts {
  products(page: 1, perPage: 10) {
    success
    message
    data {
      products {
        id
        name
        slug
        description
        metadata
        features
        isPopular
        isDefault
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

### Get Product by ID (Public)

```graphql
query GetProduct {
  product(id: "1") {
    success
    message
    data {
      id
      name
      slug
      description
      metadata
      features
      isPopular
      isDefault
      createdAt
      updatedAt
    }
  }
}
```

### Get Product by Slug (Public)

```graphql
query GetProductBySlug {
  productBySlug(slug: "basic-plan") {
    success
    message
    data {
      id
      name
      slug
      description
      metadata
      features
      isPopular
      isDefault
    }
  }
}
```

## Product Mutations (Admin Only)

### Create Product

```graphql
mutation CreateProduct {
  createProduct(
    input: {
      name: "Premium Plan"
      slug: "premium-plan"
      description: "Premium subscription with advanced features"
      metadata: "{\"color\": \"gold\", \"badge\": \"premium\"}"
      features: "[\"Unlimited users\", \"Priority support\", \"Advanced analytics\", \"Custom integrations\"]"
      isPopular: true
      isDefault: false
    }
  ) {
    success
    message
    data {
      id
      name
      slug
      description
      metadata
      features
      isPopular
      isDefault
      createdAt
      updatedAt
    }
  }
}
```

**Minimal Create (only name required):**

```graphql
mutation CreateMinimalProduct {
  createProduct(input: { name: "Basic Plan" }) {
    success
    message
    data {
      id
      name
      slug
      isPopular
      isDefault
    }
  }
}
```

### Update Product

```graphql
mutation UpdateProduct {
  updateProduct(
    input: {
      id: "1"
      name: "Premium Plan Updated"
      slug: "premium-plan-v2"
      description: "Updated premium subscription"
      isPopular: true
      isDefault: false
    }
  ) {
    success
    message
    data {
      id
      name
      slug
      description
      isPopular
      isDefault
      updatedAt
    }
  }
}
```

### Delete Product

```graphql
mutation DeleteProduct {
  deleteProduct(id: "1") {
    success
    message
  }
}
```

## Testing Scenarios

### Scenario 1: Complete Product Lifecycle

1. **Create a new product:**

```graphql
mutation {
  createProduct(
    input: {
      name: "Starter Plan"
      slug: "starter-plan"
      description: "Perfect for individuals and small teams"
      features: "[\"5 users\", \"10 GB storage\", \"Email support\"]"
      isPopular: false
      isDefault: true
    }
  ) {
    success
    message
    data {
      id
      name
      slug
    }
  }
}
```

2. **Query the created product:**

```graphql
query {
  productBySlug(slug: "starter-plan") {
    success
    data {
      id
      name
      description
      features
    }
  }
}
```

3. **Update the product:**

```graphql
mutation {
  updateProduct(
    input: { id: "INSERT_ID_HERE", name: "Starter Plan Pro", isPopular: true }
  ) {
    success
    message
  }
}
```

4. **Delete the product:**

```graphql
mutation {
  deleteProduct(id: "INSERT_ID_HERE") {
    success
    message
  }
}
```

### Scenario 2: Authorization Testing

**Test without authentication (should work for queries):**

- Remove Authorization header
- Try querying products - should work
- Try creating a product - should return "Admin access required"

**Test with non-admin user:**

- Login as regular user
- Try creating a product - should return "Admin access required"

**Test with admin user:**

- Login as admin
- Try creating a product - should succeed

## Expected Responses

### Successful Create:

```json
{
  "data": {
    "createProduct": {
      "success": true,
      "message": "Product created successfully",
      "data": {
        "id": "1",
        "name": "Premium Plan",
        "slug": "premium-plan",
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
    "createProduct": {
      "success": false,
      "message": "Admin access required",
      "data": null
    }
  }
}
```

### Not Found:

```json
{
  "data": {
    "product": {
      "success": false,
      "message": "Product not found",
      "data": null
    }
  }
}
```

## Notes

1. **Admin Authorization**: All mutations require `isAdmin: true` in the JWT token
2. **Slug Auto-generation**: If slug is not provided, it will be auto-generated from the name
3. **Pagination**: Products query supports pagination with `page` and `perPage` parameters
4. **JSON Fields**: `metadata` and `features` are stored as JSON strings
5. **Boolean Flags**: `isPopular` and `isDefault` default to `false` if not provided

## Troubleshooting

### "Admin access required" error

- Verify you're logged in with an admin account
- Check the Authorization header is set correctly
- Ensure the token hasn't expired

### "Product not found" error

- Verify the product ID exists
- Try querying all products to see available IDs

### gRPC connection errors

- Ensure product-service is running (port 50054)
- Check Tilt dashboard for service status
- Review product-service logs for errors

## Next Steps

After testing Product operations, you can proceed to:

1. **Plan Integration** - Add Plan CRUD operations
2. **Discount Integration** - Add Discount functionality
3. **Plan Prices** - Associate pricing with plans
4. **Plan Meters** - Add usage-based billing features
