# GraphQL Logout Testing Guide

Panduan untuk testing logout functionality dengan GraphQL mutation.

## Prerequisites

1. User sudah login dan memiliki:
   - `accessToken` (disimpan di localStorage dengan key `token`)
   - `refreshToken` (disimpan di localStorage dengan key `refreshToken`)

## Testing Scenarios

### Scenario 1: Normal Logout Flow

**Step 1: Login terlebih dahulu**

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
      }
    }
  }
}
```

**Step 2: Copy refreshToken dari response**

**Step 3: Call logout mutation**

```graphql
mutation Logout {
  logout(refreshToken: "YOUR_REFRESH_TOKEN_HERE") {
    success
    message
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "logout": {
      "success": true,
      "message": "Logged out successfully"
    }
  }
}
```

**Step 4: Verify token is invalidated**

Try to use the same accessToken for authenticated request:

```graphql
query Me {
  me {
    success
    message
    data {
      id
      name
      email
    }
  }
}
```

Expected: Should fail with 401 Unauthorized (token sudah invalid)

### Scenario 2: Logout from Frontend

**In Browser Console:**

```javascript
// Check current tokens
console.log("Access Token:", localStorage.getItem("token"));
console.log("Refresh Token:", localStorage.getItem("refreshToken"));

// Logout will be called automatically when clicking "Sign out" button
// The app will:
// 1. Call GraphQL logout mutation with refreshToken
// 2. Clear localStorage (token and refreshToken)
// 3. Clear auth state in React context
// 4. Redirect to homepage (PublicLayout) or /login (AdminLayout)

// After logout, verify tokens are cleared
console.log("Access Token:", localStorage.getItem("token")); // Should be null
console.log("Refresh Token:", localStorage.getItem("refreshToken")); // Should be null
```

### Scenario 3: Logout with Invalid Token

**Test with invalid/expired refreshToken:**

```graphql
mutation Logout {
  logout(refreshToken: "invalid-or-expired-token") {
    success
    message
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "logout": {
      "success": false,
      "message": "Invalid refresh token"
    }
  }
}
```

**Note**: Frontend akan tetap clear local storage bahkan jika server logout fails (graceful degradation)

### Scenario 4: Logout without Token

**Test logout tanpa refreshToken (empty string):**

```graphql
mutation Logout {
  logout(refreshToken: "") {
    success
    message
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "logout": {
      "success": false,
      "message": "Refresh token is required"
    }
  }
}
```

## Frontend Integration Points

### 1. UserNav Component (PublicLayout)

Location: `/web/src/components/layout/UserNav.tsx`

```tsx
const handleLogout = async () => {
  await logout(); // Calls GraphQL mutation + clears storage
  navigate({ to: "/" }); // Redirect to homepage
};
```

**User Flow:**

1. Click avatar in navbar
2. Dropdown menu muncul
3. Click "Sign out"
4. Logout mutation dipanggil
5. Storage cleared
6. Redirect ke homepage

### 2. NavUser Component (AdminLayout)

Location: `/web/src/components/nav-user.tsx`

```tsx
const handleLogout = async () => {
  await auth.logout(); // Calls GraphQL mutation + clears storage
  navigate({ to: "/login" }); // Redirect to login page
};
```

**User Flow:**

1. Click user menu di sidebar
2. Dropdown menu muncul
3. Click "Log out"
4. Logout mutation dipanggil
5. Storage cleared
6. Redirect ke login page

## Auth Context Implementation

Location: `/web/src/lib/auth-context.tsx`

```tsx
const logout = async () => {
  const refreshToken = getRefreshToken();

  // Call logout mutation if we have a refresh token
  if (refreshToken) {
    try {
      await client
        .mutation<LogoutResponse>(LOGOUT_MUTATION, {
          refreshToken,
        })
        .toPromise();
    } catch (error) {
      console.error("Logout mutation failed:", error);
      // Continue with local logout even if server call fails
    }
  }

  // Clear local storage and state
  removeAccessToken();
  removeRefreshToken();

  setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    isHydrated: true,
  });
};
```

**Key Features:**

- ✅ Async function untuk handle GraphQL mutation
- ✅ Graceful error handling (logout locally jika server fails)
- ✅ Clear localStorage tokens
- ✅ Reset auth state
- ✅ Maintain hydration flag

## GraphQL Mutation Definition

Location: `/web/src/lib/graphql/auth.graphql.ts`

```typescript
export const LOGOUT_MUTATION = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken) {
      success
      message
    }
  }
`;

export interface LogoutResponse {
  logout: {
    success: boolean;
    message: string;
  };
}
```

## Backend Behavior

When logout mutation is called, the backend:

1. Validates refreshToken format
2. Removes/invalidates the token from database/cache
3. Returns success response
4. Token cannot be used anymore for authentication or refresh

## Testing Checklist

- [ ] User can logout from PublicLayout (navbar avatar menu)
- [ ] User can logout from AdminLayout (sidebar user menu)
- [ ] Logout mutation is called with correct refreshToken
- [ ] localStorage is cleared after logout
- [ ] Auth state is reset after logout
- [ ] User is redirected correctly after logout
- [ ] Logout works even if server mutation fails (graceful degradation)
- [ ] After logout, old accessToken cannot access protected routes
- [ ] After logout, old refreshToken cannot refresh access token

## Common Issues & Solutions

### Issue: "Cannot read property 'logout' of undefined"

**Solution**: Ensure component is wrapped with `<AuthProvider>`

### Issue: Logout hangs/doesn't complete

**Solution**: Check network tab for GraphQL mutation response, verify server is running

### Issue: User stays logged in after logout

**Solution**: Check if localStorage is being cleared properly, verify auth state update

### Issue: Redirect doesn't work after logout

**Solution**: Ensure `navigate()` is called after `await logout()` completes

## Network Debug

**Check logout mutation in browser DevTools:**

1. Open DevTools → Network tab
2. Click "Sign out"
3. Look for GraphQL request to `/query`
4. Check request payload:

```json
{
  "query": "mutation Logout($refreshToken: String!) { logout(refreshToken: $refreshToken) { success message } }",
  "variables": {
    "refreshToken": "your-token-here"
  }
}
```

5. Check response:

```json
{
  "data": {
    "logout": {
      "success": true,
      "message": "Logged out successfully"
    }
  }
}
```

## cURL Example

```bash
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Logout($refreshToken: String!) { logout(refreshToken: $refreshToken) { success message } }",
    "variables": {
      "refreshToken": "your-refresh-token-here"
    }
  }'
```

**Expected Response:**

```json
{
  "data": {
    "logout": {
      "success": true,
      "message": "Logged out successfully"
    }
  }
}
```
