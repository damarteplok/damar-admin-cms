# Discount GraphQL API Testing Guide

Complete testing guide for Discount CRUD operations in the API Gateway.

## Prerequisites

1. **Start the services**: `tilt up` in project root
2. **Authenticate**: Obtain an admin access token (see Authentication section)
3. **GraphQL Playground**: Navigate to `http://localhost:8080/playground`

## Authentication

### Get Admin Access Token

```graphql
mutation Login {
  login(input: { email: "admin@example.com", password: "your-password" }) {
    success
    message
    data {
      accessToken
      refreshToken
      user {
        id
        email
        isAdmin
      }
    }
  }
}
```

**Set HTTP Headers** in GraphQL Playground:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

---

## Discount Queries

### Get Discount by ID

```graphql
query GetDiscount {
  discount(id: "1") {
    success
    message
    data {
      id
      name
      description
      type
      amount
      validUntil
      isActive
      actionType
      maxRedemptions
      maxRedemptionsPerUser
      redemptions
      isRecurring
      durationInMonths
      maximumRecurringIntervals
      redeemType
      bonusDays
      isEnabledForAllPlans
      isEnabledForAllOneTimeProducts
      createdAt
      updatedAt
    }
  }
}
```

### Get All Discounts

**Without filters:**

```graphql
query GetAllDiscounts {
  discounts {
    success
    message
    data {
      discounts {
        id
        name
        type
        amount
        isActive
        isRecurring
        createdAt
      }
      total
      page
      perPage
    }
  }
}
```

**With pagination and filters:**

```graphql
query GetActiveDiscounts {
  discounts(page: 1, perPage: 10, activeOnly: true) {
    success
    message
    data {
      discounts {
        id
        name
        description
        type
        amount
        validUntil
        isActive
        maxRedemptions
        redemptions
        isRecurring
        isEnabledForAllPlans
        isEnabledForAllOneTimeProducts
      }
      total
      page
      perPage
    }
  }
}
```

---

## Discount Mutations (Admin Only)

### Create Discount - Minimal Required Fields

**Fixed Amount Discount:**

```graphql
mutation CreateBasicDiscount {
  createDiscount(
    input: {
      name: "Black Friday 2024"
      type: "fixed"
      amount: 50.00
      isActive: true
      isRecurring: false
    }
  ) {
    success
    message
    data {
      id
      name
      type
      amount
      isActive
      isRecurring
      createdAt
      updatedAt
    }
  }
}
```

**Percentage Discount:**

```graphql
mutation CreatePercentageDiscount {
  createDiscount(
    input: {
      name: "Holiday Sale 20% Off"
      type: "percentage"
      amount: 20.0
      isActive: true
      isRecurring: false
    }
  ) {
    success
    message
    data {
      id
      name
      type
      amount
      isActive
      createdAt
    }
  }
}
```

### Create Discount - With All Optional Fields

**Comprehensive Discount:**

```graphql
mutation CreateComprehensiveDiscount {
  createDiscount(
    input: {
      name: "Premium Subscriber Discount"
      description: "Special recurring discount for premium subscribers"
      type: "percentage"
      amount: 15.0
      validUntil: 1735689600
      isActive: true
      actionType: "reduce_price"
      maxRedemptions: 1000
      maxRedemptionsPerUser: 1
      isRecurring: true
      durationInMonths: 12
      maximumRecurringIntervals: 12
      redeemType: 1
      bonusDays: 7
      isEnabledForAllPlans: false
      isEnabledForAllOneTimeProducts: false
    }
  ) {
    success
    message
    data {
      id
      name
      description
      type
      amount
      validUntil
      isActive
      actionType
      maxRedemptions
      maxRedemptionsPerUser
      redemptions
      isRecurring
      durationInMonths
      maximumRecurringIntervals
      redeemType
      bonusDays
      isEnabledForAllPlans
      isEnabledForAllOneTimeProducts
      createdAt
      updatedAt
    }
  }
}
```

**Discount for All Plans:**

```graphql
mutation CreateAllPlansDiscount {
  createDiscount(
    input: {
      name: "Welcome Discount"
      description: "10% off for all new subscribers"
      type: "percentage"
      amount: 10.0
      isActive: true
      isRecurring: false
      maxRedemptions: -1
      maxRedemptionsPerUser: -1
      isEnabledForAllPlans: true
      isEnabledForAllOneTimeProducts: false
    }
  ) {
    success
    message
    data {
      id
      name
      description
      type
      amount
      maxRedemptions
      maxRedemptionsPerUser
      isEnabledForAllPlans
      isEnabledForAllOneTimeProducts
    }
  }
}
```

### Update Discount

**Update Basic Fields:**

```graphql
mutation UpdateDiscount {
  updateDiscount(
    input: {
      id: "1"
      name: "Black Friday 2024 Updated"
      type: "percentage"
      amount: 25.0
      isActive: true
      isRecurring: false
    }
  ) {
    success
    message
    data {
      id
      name
      type
      amount
      isActive
      updatedAt
    }
  }
}
```

**Update with Extended Validity:**

```graphql
mutation ExtendDiscountValidity {
  updateDiscount(
    input: {
      id: "2"
      name: "Holiday Sale Extended"
      type: "percentage"
      amount: 20.0
      validUntil: 1738281600
      isActive: true
      isRecurring: false
      maxRedemptions: 2000
    }
  ) {
    success
    message
    data {
      id
      name
      validUntil
      maxRedemptions
      updatedAt
    }
  }
}
```

**Disable Discount:**

```graphql
mutation DisableDiscount {
  updateDiscount(
    input: {
      id: "3"
      name: "Expired Discount"
      type: "fixed"
      amount: 50.0
      isActive: false
      isRecurring: false
    }
  ) {
    success
    message
    data {
      id
      name
      isActive
      updatedAt
    }
  }
}
```

### Delete Discount

```graphql
mutation DeleteDiscount {
  deleteDiscount(id: "1") {
    success
    message
  }
}
```

---

## Field Descriptions

### Discount Type Fields

- **name** (String!, required): Discount display name
- **description** (String, optional): Detailed discount description
- **type** (String!, required): Discount type - `"fixed"` or `"percentage"`
- **amount** (Float!, required): Discount value (dollars for fixed, percentage for percentage)
- **validUntil** (Int, optional): Unix timestamp when discount expires (null = no expiration)
- **isActive** (Boolean!, required): Whether discount is currently active
- **actionType** (String, optional): Action type - `"add_subscription_time"` or `"reduce_price"`
- **maxRedemptions** (Int, optional): Maximum total redemptions (-1 = unlimited, null = no limit)
- **maxRedemptionsPerUser** (Int, optional): Maximum redemptions per user (-1 = unlimited)
- **redemptions** (Int!, read-only): Current number of redemptions
- **isRecurring** (Boolean!, required): Whether discount applies to recurring payments
- **durationInMonths** (Int, optional): Discount duration in months for recurring discounts
- **maximumRecurringIntervals** (Int, optional): Maximum recurring billing cycles
- **redeemType** (Int, optional): Redemption type (1 = normal, 2 = special)
- **bonusDays** (Int, optional): Bonus days added when discount is applied
- **isEnabledForAllPlans** (Boolean, default: false): Enable for all subscription plans
- **isEnabledForAllOneTimeProducts** (Boolean, default: false): Enable for all one-time products

### Special Values

- **maxRedemptions = -1**: Unlimited redemptions
- **maxRedemptionsPerUser = -1**: Unlimited per user
- **validUntil = null**: No expiration date
- **durationInMonths**: Only applicable when isRecurring = true

---

## Testing Scenarios

### Scenario 1: Limited-Time Fixed Discount

```graphql
mutation CreateLimitedTimeDiscount {
  createDiscount(
    input: {
      name: "Cyber Monday $100 Off"
      description: "Limited time offer - $100 off any annual plan"
      type: "fixed"
      amount: 100.0
      validUntil: 1733356800
      isActive: true
      maxRedemptions: 500
      maxRedemptionsPerUser: 1
      isRecurring: false
      isEnabledForAllPlans: true
    }
  ) {
    success
    message
    data {
      id
      name
      validUntil
      maxRedemptions
    }
  }
}
```

### Scenario 2: Recurring Percentage Discount

```graphql
mutation CreateRecurringDiscount {
  createDiscount(
    input: {
      name: "Loyal Customer 15% Off"
      description: "15% off for 6 months"
      type: "percentage"
      amount: 15.0
      isActive: true
      isRecurring: true
      durationInMonths: 6
      maximumRecurringIntervals: 6
      isEnabledForAllPlans: false
    }
  ) {
    success
    message
    data {
      id
      name
      isRecurring
      durationInMonths
      maximumRecurringIntervals
    }
  }
}
```

### Scenario 3: Welcome Bonus with Extra Days

```graphql
mutation CreateWelcomeBonus {
  createDiscount(
    input: {
      name: "New User Welcome"
      description: "Get 10% off plus 14 bonus days"
      type: "percentage"
      amount: 10.0
      isActive: true
      isRecurring: false
      bonusDays: 14
      actionType: "add_subscription_time"
      maxRedemptionsPerUser: 1
      isEnabledForAllPlans: true
    }
  ) {
    success
    message
    data {
      id
      name
      bonusDays
      actionType
    }
  }
}
```

---

## Common Errors & Solutions

### Error: "Admin access required"

**Solution**: Ensure you're using a valid admin access token in Authorization header

### Error: "Invalid discount ID"

**Solution**: Check that the ID is a valid integer and exists in the database

### Error: "Create discount failed"

**Possible causes**:

- Missing required fields (name, type, amount, isActive, isRecurring)
- Invalid type value (must be "fixed" or "percentage")
- Database connection issues

### Error: "Update discount failed"

**Possible causes**:

- Discount with specified ID doesn't exist
- Invalid field values
- Database constraint violations

---

## Authorization Notes

- **All mutations** require admin authentication
- **All queries** are publicly accessible (no auth required)
- Use `middleware.RequireAdmin(ctx)` check in resolvers
- Admin users have `isAdmin: true` in User data

---

## Next Steps

After testing Discount CRUD:

1. Test discount code generation and redemption
2. Associate discounts with specific plans (DiscountPlan junction)
3. Associate discounts with one-time products (DiscountOneTimeProduct junction)
4. Implement payment provider data (DiscountPaymentProviderData)
5. Test discount validation and expiration logic
