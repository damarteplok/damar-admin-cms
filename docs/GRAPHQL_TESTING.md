# GraphQL API Testing Guide

Panduan lengkap untuk testing GraphQL API `damar-admin-cms`.

## Akses GraphQL Playground

Setelah menjalankan `tilt up`, GraphQL Playground bisa diakses di:

- **Primary**: http://localhost:8080/
- **Alternative**: http://localhost:8080/playground
- **Alternative**: http://localhost:8080/graphql

GraphQL Endpoint untuk client apps: http://localhost:8080/query

## Important Notes

### Soft Delete Implementation

**Users Table** menggunakan **soft delete** (sejak migration 000024):

- User yang dihapus TIDAK benar-benar hilang dari database
- Field `deleted_at` diset dengan timestamp saat delete
- **Email Uniqueness**: Menggunakan partial unique index - email hanya unique untuk user aktif (`deleted_at IS NULL`)
- **Re-registration**: User bisa sign up lagi dengan email yang sama setelah account dihapus
- **Login Prevention**: User yang sudah dihapus tidak bisa login (error: "this account has been deleted")
- **Tenant Relations**: Saat user dihapus, `tenants.created_by` tetap tersimpan (audit trail terjaga)

**Tenants Table** juga menggunakan **soft delete** (sejak migration 000025):

- Tenant yang dihapus tetap tersimpan dengan `deleted_at` timestamp
- **Slug/Domain/UUID Uniqueness**: Menggunakan partial unique index - hanya unique untuk tenant aktif (`deleted_at IS NULL`)
- **Re-creation**: Tenant bisa dibuat lagi dengan slug/domain yang sama setelah tenant lama dihapus
- Foreign key `created_by` REFERENCES `users(id)` dengan ON DELETE SET NULL
- Creator info tetap terjaga bahkan setelah user dihapus

### Soft Delete Behavior Summary

**What Happens to Deleted Users/Tenants:**

| Operation                                                 | Deleted User/Tenant | Status                 |
| --------------------------------------------------------- | ------------------- | ---------------------- |
| Get by ID                                                 | ❌ Not found        | Filtered out           |
| Get by Email/Slug                                         | ❌ Not found        | Filtered out           |
| List (GetAll/Search)                                      | ❌ Not shown        | Filtered out           |
| Update                                                    | ❌ Fails            | "not found"            |
| Delete (again)                                            | ❌ Fails            | "not found"            |
| Login (users only)                                        | ❌ Blocked          | "deleted"              |
| Create with same email/slug                               | ✅ Allowed          | Unique for active only |
| Related operations (tenant operations for deleted tenant) | ❌ Fails            | "tenant not found"     |

**Database State:**

- Record exists in database with `deleted_at` timestamp
- Audit trail preserved for compliance
- Foreign key relationships maintained (created_by not NULL)

## Table of Contents

- [Authentication Flow](#authentication-flow)
- [User Management](#user-management)
- [Tenant Management](#tenant-management)
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
        isAdmin
      }
    }
  }
}
```

**Note**: After successful login:

- Regular users (isAdmin: false) will be redirected to `/` (homepage)
- Admin users (isAdmin: true) can access `/admin` via the "Admin" menu item in their profile dropdown

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
      isAdmin
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

### Scenario 5: Soft Delete Testing (Users)

1. **Create test user:**

```graphql
mutation {
  createUser(
    input: {
      name: "Delete Test User"
      email: "deletetest@example.com"
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

2. **Delete user (soft delete):**

```graphql
mutation {
  deleteUser(id: "USER_ID_FROM_STEP_1") {
    success
    message
  }
}
```

3. **Try to get deleted user (should fail):**

```graphql
query {
  user(id: "USER_ID_FROM_STEP_1") {
    success
    message
  }
}
# Expected: { success: false, message: "user not found" }
```

4. **Try to login with deleted user (should fail):**

```graphql
mutation {
  login(input: { email: "deletetest@example.com", password: "Test123!" }) {
    success
    message
  }
}
# Expected: { success: false, message: "this account has been deleted" }
```

5. **Register again with same email (should succeed):**

```graphql
mutation {
  createUser(
    input: {
      name: "Delete Test User Reborn"
      email: "deletetest@example.com"
      password: "NewPassword123!"
    }
  ) {
    success
    data {
      id
      email
    }
  }
}
# Expected: success: true (new user created with different ID)
```

6. **Login with new account (should succeed):**

```graphql
mutation {
  login(
    input: { email: "deletetest@example.com", password: "NewPassword123!" }
  ) {
    success
    data {
      accessToken
    }
  }
}
```

### Scenario 6: Soft Delete Testing (Tenants)

1. **Create tenant:**

```graphql
mutation {
  createTenant(input: { name: "Delete Test Corp", slug: "delete-test" }) {
    success
    data {
      id
      slug
    }
  }
}
```

2. **Add user to tenant:**

```graphql
mutation {
  addUserToTenant(
    input: { userId: "8", tenantId: "TENANT_ID", role: "member" }
  ) {
    success
  }
}
```

3. **Delete tenant (soft delete):**

```graphql
mutation {
  deleteTenant(id: "TENANT_ID") {
    success
  }
}
```

4. **Try to get deleted tenant (should fail):**

```graphql
query {
  tenant(id: "TENANT_ID") {
    success
    message
  }
}
# Expected: { success: false, message: "tenant not found" }
```

5. **Try to get tenant users (should fail):**

```graphql
query {
  tenantUsers(tenantId: "TENANT_ID") {
    success
    message
  }
}
# Expected: { success: false, message: "tenant not found" }
```

6. **Try to update deleted tenant (should fail):**

```graphql
mutation {
  updateTenant(input: { id: "TENANT_ID", name: "New Name" }) {
    success
    message
  }
}
# Expected: { success: false, message: "tenant not found" }
```

7. **Create tenant with same slug (should succeed):**

```graphql
mutation {
  createTenant(input: { name: "Delete Test Corp V2", slug: "delete-test" }) {
    success
    data {
      id
      slug
    }
  }
}
# Expected: success: true (new tenant with different ID)
```

---

## Tenant Management

### Get Tenant by ID

**Query:**

```graphql
query GetTenant {
  tenant(id: "1") {
    success
    message
    data {
      id
      uuid
      name
      slug
      domain
      isNameAutoGenerated
      createdBy
      createdAt
      updatedAt
    }
  }
}
```

**Requires**: Authorization header (admin only)

### Get Tenant by Slug

**Query:**

```graphql
query GetTenantBySlug {
  tenantBySlug(slug: "acme-corp") {
    success
    message
    data {
      id
      name
      slug
      domain
    }
  }
}
```

### Get All Tenants

**Query:**

```graphql
query GetAllTenants {
  tenants(page: 1, perPage: 10) {
    success
    message
    data {
      tenants {
        id
        name
        slug
        domain
        createdBy
        createdAt
      }
      total
      page
      perPage
    }
  }
}
```

**Optional Parameters:**

- `search`: Search across tenant name, slug, and domain (case-insensitive)
- `sortBy`: Field to sort by (`name`, `slug`, `domain`, `created_at`, `updated_at`)
- `sortOrder`: Sort direction (`asc` or `desc`)

**Query with Search & Sort:**

```graphql
query SearchAndSortTenants {
  tenants(
    page: 1
    perPage: 10
    search: "acme"
    sortBy: "name"
    sortOrder: "asc"
  ) {
    success
    message
    data {
      tenants {
        id
        name
        slug
        domain
        createdAt
      }
      total
      page
      perPage
    }
  }
}
```

**Examples:**

```graphql
# Search only
query SearchTenants {
  tenants(search: "corp") {
    data {
      tenants {
        name
        slug
      }
      total
    }
  }
}

# Sort by created date (newest first)
query RecentTenants {
  tenants(sortBy: "created_at", sortOrder: "desc") {
    data {
      tenants {
        name
        createdAt
      }
    }
  }
}

# Search + Sort + Pagination
query SearchSortPaginate {
  tenants(
    page: 2
    perPage: 20
    search: "example.com"
    sortBy: "name"
    sortOrder: "asc"
  ) {
    data {
      tenants {
        name
        domain
      }
      total
      page
      perPage
    }
  }
}
```

### Create Tenant

**Mutation:**

```graphql
mutation CreateTenant {
  createTenant(
    input: {
      name: "Acme Corporation"
      slug: "acme-corp"
      domain: "acme.example.com"
    }
  ) {
    success
    message
    data {
      id
      uuid
      name
      slug
      domain
      createdAt
    }
  }
}
```

**Note**: Slug is optional (auto-generated if not provided)

### Update Tenant

**Mutation:**

```graphql
mutation UpdateTenant {
  updateTenant(
    input: {
      id: "1"
      name: "Acme Corp Updated"
      domain: "new-domain.example.com"
    }
  ) {
    success
    message
    data {
      id
      name
      domain
      updatedAt
    }
  }
}
```

### Delete Tenant

**Mutation:**

```graphql
mutation DeleteTenant {
  deleteTenant(id: "1") {
    success
    message
  }
}
```

---

## Tenant Users Management

### Get Tenant Users

**Query:**

```graphql
query GetTenantUsers {
  tenantUsers(tenantId: "1") {
    success
    message
    data {
      id
      userId
      tenantId
      role
      isDefault
      email
      createdAt
    }
  }
}
```

**Note**: Returns error if tenant is deleted or not found

### Get User Tenants

**Query:**

```graphql
query GetUserTenants {
  userTenants(userId: "8") {
    success
    message
    data {
      id
      tenantId
      role
      isDefault
      createdAt
    }
  }
}
```

### Add User to Tenant

**Mutation:**

```graphql
mutation AddUserToTenant {
  addUserToTenant(
    input: { userId: "8", tenantId: "1", role: "member", isDefault: false }
  ) {
    success
    message
    data {
      id
      userId
      tenantId
      role
      isDefault
      email
    }
  }
}
```

**Roles**: `owner`, `admin`, `member`, `guest`

### Remove User from Tenant

**Mutation:**

```graphql
mutation RemoveUserFromTenant {
  removeUserFromTenant(userId: "8", tenantId: "1") {
    success
    message
  }
}
```

### Update User Role

**Mutation:**

```graphql
mutation UpdateUserRole {
  updateUserRole(input: { userId: "8", tenantId: "1", role: "admin" }) {
    success
    message
  }
}
```

### Set Default Tenant

**Mutation:**

```graphql
mutation SetDefaultTenant {
  setDefaultTenant(input: { userId: "8", tenantId: "1" }) {
    success
    message
  }
}
```

**Note**: Only one tenant can be default per user

---

## Tenant Settings Management

### Get Tenant Setting

**Query:**

```graphql
query GetTenantSetting {
  tenantSetting(tenantId: "1", key: "theme") {
    success
    message
    data {
      id
      tenantId
      key
      value
      createdAt
      updatedAt
    }
  }
}
```

**Note**: Returns error if tenant is deleted or not found

### Get All Tenant Settings

**Query:**

```graphql
query GetAllTenantSettings {
  tenantSettings(tenantId: "1") {
    success
    message
    data {
      id
      key
      value
      createdAt
    }
  }
}
```

**Note**: Returns error if tenant is deleted or not found

### Set Tenant Setting

**Mutation:**

```graphql
mutation SetTenantSetting {
  setTenantSetting(input: { tenantId: "1", key: "theme", value: "dark" }) {
    success
    message
    data {
      id
      key
      value
      updatedAt
    }
  }
}
```

**Value Format Examples:**

```graphql
# Plain string
setTenantSetting(input: { tenantId: "1", key: "theme", value: "dark" })

# Number (as string)
setTenantSetting(input: { tenantId: "1", key: "max_users", value: "100" })

# Boolean (as string)
setTenantSetting(input: { tenantId: "1", key: "feature_enabled", value: "true" })

# JSON object (as string)
setTenantSetting(input: { tenantId: "1", key: "config", value: "{\"color\":\"blue\",\"size\":\"large\"}" })
```

**Note**:

- Upsert operation (creates if not exists, updates if exists)
- Value is stored as JSON in database
- Plain strings are automatically wrapped in JSON quotes
- JSON objects/arrays should be passed as stringified JSON

### Delete Tenant Setting

**Mutation:**

```graphql
mutation DeleteTenantSetting {
  deleteTenantSetting(tenantId: "1", key: "theme") {
    success
    message
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
