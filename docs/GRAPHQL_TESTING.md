# GraphQL API Testing Guide

Panduan lengkap untuk testing GraphQL API `damar-admin-cms`.

## Akses GraphQL Playground

Setelah menjalankan `tilt up`, GraphQL Playground bisa diakses di:

- **Primary**: http://localhost:8080/
- **Alternative**: http://localhost:8080/playground
- **Alternative**: http://localhost:8080/graphql

GraphQL Endpoint untuk client apps: http://localhost:8080/query

## Table of Contents

- [Authentication Flow](#authentication-flow)
- [User Management](#user-management)
- [Testing Scenarios](#testing-scenarios)

---

## Authentication Flow

### 1. Register New User

**Mutation:**

```graphql
mutation RegisterUser {
  createUser(
    input: {
      name: "John Doe"
      email: "john.doe@example.com"
      password: "SecurePassword123!"
      publicName: "Johnny"
      phoneNumber: "+628123456789"
      position: "Software Engineer"
    }
  ) {
    success
    message
    data {
      id
      name
      email
      publicName
      phoneNumber
      position
      isAdmin
      isBlocked
      emailVerified
      createdAt
    }
  }
}
```

### 2. Login

**Mutation:**

```graphql
mutation Login {
  login(
    input: { email: "john.doe@example.com", password: "SecurePassword123!" }
  ) {
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
        emailVerified
      }
    }
  }
}
```

**Response akan menghasilkan:**

```json
{
  "data": {
    "login": {
      "success": true,
      "message": "Login successful",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "some-refresh-token",
        "user": {
          "id": "1",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "isAdmin": false,
          "emailVerified": false
        }
      }
    }
  }
}
```

**Copy `accessToken` untuk request berikutnya yang memerlukan authentication.**

### 3. Setup Authentication Header

Di GraphQL Playground, klik tab **HTTP HEADERS** (di bawah query editor) dan tambahkan:

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE"
}
```

Ganti `YOUR_ACCESS_TOKEN_HERE` dengan token dari response login.

---

## User Management

### Get Current User (Me)

**Query:**

```graphql
query Me {
  me {
    success
    message
    data {
      id
      name
      email
      publicName
      phoneNumber
      position
      isAdmin
      isBlocked
      emailVerified
      emailVerifiedAt
      lastLoginAt
      createdAt
      updatedAt
    }
  }
}
```

**Requires**: Authorization header

### Get User by ID

**Query:**

```graphql
query GetUser {
  user(id: "1") {
    success
    message
    data {
      id
      name
      email
      publicName
      phoneNumber
      position
      isAdmin
      isBlocked
      emailVerified
    }
  }
}
```

### Get All Users (Paginated)

**Query:**

```graphql
query GetAllUsers {
  users(page: 1, perPage: 10) {
    success
    message
    data {
      users {
        id
        name
        email
        isAdmin
        isBlocked
        emailVerified
        createdAt
      }
      total
      page
      perPage
    }
  }
}
```

### Search Users

**Query:**

```graphql
query SearchUsers {
  searchUsers(query: "john", page: 1, perPage: 10) {
    success
    message
    data {
      users {
        id
        name
        email
        phoneNumber
      }
      total
      page
      perPage
    }
  }
}
```

### Update User

**Mutation:**

```graphql
mutation UpdateUser {
  updateUser(
    input: {
      id: "1"
      name: "John Doe Updated"
      publicName: "Johnny D"
      phoneNumber: "+628987654321"
      position: "Senior Software Engineer"
    }
  ) {
    success
    message
    data {
      id
      name
      publicName
      phoneNumber
      position
      updatedAt
    }
  }
}
```

**Requires**: Authorization header (owner or admin)

### Delete User

**Mutation:**

```graphql
mutation DeleteUser {
  deleteUser(id: "1") {
    success
    message
  }
}
```

**Requires**: Authorization header (owner or admin)

---

## Password Management

### Change Password

**Mutation:**

```graphql
mutation ChangePassword {
  changePassword(
    input: {
      oldPassword: "SecurePassword123!"
      newPassword: "NewSecurePassword456!"
    }
  ) {
    success
    message
  }
}
```

**Requires**: Authorization header

### Forgot Password (Request Reset)

**Mutation:**

```graphql
mutation ForgotPassword {
  forgotPassword(email: "john.doe@example.com") {
    success
    message
  }
}
```

### Verify Reset Token

**Query:**

```graphql
query VerifyResetToken {
  verifyResetToken(token: "reset-token-from-email") {
    success
    message
  }
}
```

### Reset Password

**Mutation:**

```graphql
mutation ResetPassword {
  resetPassword(
    input: { token: "reset-token-from-email", newPassword: "NewPassword789!" }
  ) {
    success
    message
  }
}
```

---

## Email Verification

### Verify Email

**Mutation:**

```graphql
mutation VerifyEmail {
  verifyEmail(token: "verification-token-from-email") {
    success
    message
  }
}
```

### Resend Verification Email

**Mutation:**

```graphql
mutation ResendVerification {
  resendVerificationEmail {
    success
    message
  }
}
```

**Requires**: Authorization header

---

## Token Management

### Refresh Access Token

**Mutation:**

```graphql
mutation RefreshToken {
  refreshToken(input: { refreshToken: "your-refresh-token-here" }) {
    success
    message
    data {
      accessToken
    }
  }
}
```

### Logout

**Mutation:**

```graphql
mutation Logout {
  logout(refreshToken: "your-refresh-token-here") {
    success
    message
  }
}
```

---

## Admin Operations

### Bulk Delete Users

**Mutation:**

```graphql
mutation BulkDeleteUsers {
  bulkDeleteUsers(ids: ["2", "3", "4"]) {
    success
    message
    affectedCount
  }
}
```

**Requires**: Authorization header (admin only)

### Bulk Block/Unblock Users

**Mutation (Block):**

```graphql
mutation BulkBlockUsers {
  bulkBlockUsers(ids: ["2", "3"], isBlocked: true) {
    success
    message
    affectedCount
  }
}
```

**Mutation (Unblock):**

```graphql
mutation BulkUnblockUsers {
  bulkBlockUsers(ids: ["2", "3"], isBlocked: false) {
    success
    message
    affectedCount
  }
}
```

**Requires**: Authorization header (admin only)

---

## Testing Scenarios

### Scenario 1: Complete User Registration & Login Flow

1. **Register user:**

```graphql
mutation {
  createUser(
    input: {
      name: "Test User"
      email: "test@example.com"
      password: "Test123!"
    }
  ) {
    success
    data {
      id
      email
    }
  }
}
```

2. **Login:**

```graphql
mutation {
  login(input: { email: "test@example.com", password: "Test123!" }) {
    success
    data {
      accessToken
      user {
        id
        name
      }
    }
  }
}
```

3. **Set Authorization header dengan accessToken**

4. **Get current user:**

```graphql
query {
  me {
    success
    data {
      id
      name
      email
    }
  }
}
```

### Scenario 2: User Profile Update

1. **Login first dan get accessToken**

2. **Update profile:**

```graphql
mutation {
  updateUser(
    input: {
      id: "YOUR_USER_ID"
      name: "Updated Name"
      phoneNumber: "+628123456789"
    }
  ) {
    success
    message
    data {
      name
      phoneNumber
    }
  }
}
```

3. **Verify update:**

```graphql
query {
  me {
    success
    data {
      name
      phoneNumber
    }
  }
}
```

### Scenario 3: Password Reset Flow

1. **Request password reset:**

```graphql
mutation {
  forgotPassword(email: "test@example.com") {
    success
    message
  }
}
```

2. **Check logs/email untuk reset token (development mode akan print di console)**

3. **Verify token:**

```graphql
query {
  verifyResetToken(token: "TOKEN_FROM_EMAIL") {
    success
    message
  }
}
```

4. **Reset password:**

```graphql
mutation {
  resetPassword(
    input: { token: "TOKEN_FROM_EMAIL", newPassword: "NewPassword123!" }
  ) {
    success
    message
  }
}
```

5. **Login dengan password baru**

### Scenario 4: Admin User Management

1. **Login sebagai admin**

2. **Get all users:**

```graphql
query {
  users(page: 1, perPage: 20) {
    success
    data {
      users {
        id
        name
        email
        isBlocked
      }
      total
    }
  }
}
```

3. **Block multiple users:**

```graphql
mutation {
  bulkBlockUsers(ids: ["2", "3"], isBlocked: true) {
    success
    affectedCount
  }
}
```

4. **Verify users are blocked:**

```graphql
query {
  users {
    data {
      users {
        id
        isBlocked
      }
    }
  }
}
```

---

## Common Errors & Solutions

### Error: "Unauthorized: Please login first"

**Solution**: Tambahkan Authorization header dengan valid access token.

### Error: "Invalid user ID"

**Solution**: Pastikan ID yang digunakan adalah string (dalam quotes) dan valid.

### Error: "User not found"

**Solution**: Cek apakah user dengan email/ID tersebut exists di database.

### Error: "Email already exists"

**Solution**: Gunakan email yang berbeda untuk registrasi.

### Error: "Invalid credentials"

**Solution**: Pastikan email dan password benar.

---

## Tips

1. **Use Variables**: Di GraphQL Playground, gunakan tab "QUERY VARIABLES" untuk parameter yang dinamis:

```graphql
mutation Login($email: String!, $password: String!) {
  login(input: { email: $email, password: $password }) {
    success
    data {
      accessToken
    }
  }
}
```

Variables:

```json
{
  "email": "test@example.com",
  "password": "Test123!"
}
```

2. **Save Queries**: Simpan query yang sering digunakan di tab History atau export sebagai collection.

3. **Introspection**: Gunakan Explorer di Playground (klik tombol "Docs" di kanan) untuk explore available queries dan mutations.

4. **Multiple Operations**: Beri nama operation untuk menjalankan specific query:

```graphql
query GetUser {
  user(id: "1") { ... }
}

query GetAllUsers {
  users { ... }
}
```

Pilih operation yang ingin dijalankan di dropdown di Playground.

---

## cURL Examples

Jika ingin test dari command line:

### Login

```bash
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(input: { email: \"test@example.com\", password: \"Test123!\" }) { success data { accessToken } } }"
  }'
```

### Get User (with Auth)

```bash
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "query { me { success data { id name email } } }"
  }'
```

---

## Next Steps

- ✅ Test semua queries dan mutations di atas
- ✅ Explore schema menggunakan Docs panel
- ✅ Buat test cases untuk aplikasi client
- ✅ Integrate dengan frontend application
