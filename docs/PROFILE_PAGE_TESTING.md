# Profile Page Testing Guide

## Overview

Halaman profile telah berhasil dibuat dengan fitur CRUD lengkap mengikuti pola dari products, plans, dan discounts.

## Files Created

### Type Definitions

- `web/src/types/user.ts` - Type definitions untuk user profile, media, dan semua response types
- Exported di `web/src/types/index.ts`

### GraphQL Operations

- `web/src/lib/graphql/user.graphql.ts` - GraphQL queries dan mutations untuk profile:
  - `GET_MY_PROFILE_QUERY` - Get current user profile
  - `GET_USER_PROFILE_QUERY` - Get user profile by ID
  - `UPDATE_PROFILE_MUTATION` - Update profile information
  - `CHANGE_PASSWORD_MUTATION` - Change user password
  - `UPLOAD_AVATAR_MUTATION` - Upload profile picture
  - `DELETE_AVATAR_MUTATION` - Delete profile picture

### Components

- `web/src/components/features/profile/profile-form.tsx` - Form untuk update profile info
- `web/src/components/features/profile/change-password-form.tsx` - Form untuk ganti password
- `web/src/components/features/profile/avatar-upload.tsx` - Component untuk upload/delete avatar
- `web/src/components/features/profile/index.ts` - Export barrel file

### UI Components Created

- `web/src/components/ui/tabs.tsx` - Tabs component untuk profile navigation

### Page

- `web/src/routes/profile/index.tsx` - Main profile page dengan tabs untuk Profile Info dan Security

## Features

### Profile Information Tab

1. **Avatar Upload/Delete**

   - Upload image (JPG, PNG, GIF)
   - Max size 5MB
   - Preview dengan fallback initials
   - Delete avatar functionality

2. **Personal Information Form**

   - Full Name (required)
   - Email (disabled for own profile)
   - Display Name (public name)
   - Phone Number
   - Job Title/Position

3. **Account Details**
   - User ID (read-only)
   - Member Since (read-only)
   - Last Login (read-only)

### Security Tab

1. **Change Password Form**
   - Current password field with show/hide
   - New password field with show/hide
   - Confirm password field with show/hide
   - Password validation (min 8 characters)
   - Password match validation

## Backend Schema Status

✅ User schema sudah ada di GraphQL backend:

- User type dengan semua fields (id, name, email, publicName, phoneNumber, position, avatar, dll)
- Queries: `user(id)`, `me`
- Mutations: `updateUser`, `changePassword`
- Media mutations: `uploadFile`, `deleteMedia`

## Testing GraphQL Operations

### 1. Get My Profile

```graphql
query {
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
      emailVerified
      isAdmin
      avatar {
        id
        url
        fileName
      }
    }
  }
}
```

### 2. Update Profile

```graphql
mutation {
  updateUser(
    input: {
      id: "1"
      name: "John Doe"
      publicName: "JD"
      phoneNumber: "+1234567890"
      position: "Senior Developer"
    }
  ) {
    success
    message
    data {
      id
      name
      publicName
    }
  }
}
```

### 3. Change Password

```graphql
mutation {
  changePassword(
    input: { oldPassword: "currentpass123", newPassword: "newpass123" }
  ) {
    success
    message
  }
}
```

### 4. Upload Avatar

```graphql
mutation {
  uploadFile(input: {
    content: <file>
    fileName: "avatar.jpg"
    mimeType: "image/jpeg"
    modelType: "user"
    modelId: "1"
    collectionName: "avatar"
    disk: "public"
  }) {
    success
    message
    data {
      id
      url
      fileName
    }
  }
}
```

## Access Routes

- Profile page: `/profile`
- The page is accessible for all authenticated users
- Each user can only edit their own profile

## Translation Keys

Profile page menggunakan translation keys dengan prefix `profile.*`:

- `profile.title` - Page title
- `profile.subtitle` - Page subtitle
- `profile.form.*` - Form labels
- `profile.password.*` - Password form labels
- `profile.avatar.*` - Avatar upload labels
- `profile.account.*` - Account details labels

## Next Steps

1. **Test the Profile Page**:

   ```bash
   # Start development server
   cd web
   pnpm dev
   ```

2. **Navigate to `/profile` route** after logging in

3. **Test all features**:

   - View profile information
   - Update profile fields
   - Upload/change avatar
   - Delete avatar
   - Change password

4. **Verify GraphQL calls** in browser DevTools Network tab

5. **Check for any TypeScript errors**:
   ```bash
   cd web
   pnpm type-check
   ```

## Notes

- Avatar storage menggunakan media-service yang sudah ada
- Profile update menggunakan existing `updateUser` mutation
- Password change menggunakan existing `changePassword` mutation
- Email field disabled untuk own profile (security)
- Validation dilakukan di client dan server side
- Toast notifications untuk success/error feedback
- Responsive design untuk mobile dan desktop

## Related Files Pattern

Mengikuti pola dari:

- `web/src/routes/admin/products/` - Routing pattern
- `web/src/components/features/admin/products/` - Component organization
- `web/src/lib/graphql/product.graphql.ts` - GraphQL operations pattern
- `web/src/types/product.ts` - Type definitions pattern
