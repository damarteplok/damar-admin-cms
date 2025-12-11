# 🏗️ Project Structure Guide

## 📁 Directory Structure

```
web/src/
├── components/              # React components
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Layout components (Header, Footer, Sidebar)
│   │   └── index.ts        # Barrel export
│   ├── features/           # ✨ Feature-based components
│   │   └── auth/           # Authentication feature
│   │       ├── login-form.tsx
│   │       ├── signup-form.tsx
│   │       ├── forgot-password-form.tsx
│   │       └── index.ts    # Barrel export
│   ├── public/             # Public-facing components
│   │   └── index.ts        # Barrel export
│   ├── common/             # Shared components
│   │   └── index.ts        # Barrel export
│   └── admin/              # Admin-specific components
│
├── routes/                  # TanStack Router routes
│   ├── __root.tsx          # Root route
│   ├── _layout.tsx         # Layout wrapper
│   └── _layout/            # Nested routes
│
├── hooks/                   # Custom React hooks
│   ├── use-mobile.ts
│   └── demo.form.ts
│
├── config/                  # ✨ App configuration
│   ├── env.ts              # Environment variables (type-safe)
│   └── index.ts            # Barrel export
│
├── lib/                     # Core utilities and configurations
│   ├── graphql/            # ✨ GraphQL layer
│   │   ├── client.ts       # urql client setup
│   │   ├── auth.graphql.ts # Auth queries/mutations
│   │   └── tenant.graphql.ts # Tenant queries
│   ├── utils/              # Utility functions
│   │   ├── cn.ts           # className utility
│   │   ├── date.ts         # Date utilities
│   │   ├── string.ts       # String utilities
│   │   ├── number.ts       # Number utilities
│   │   └── index.ts        # Barrel export
│   ├── validations/        # Zod validation schemas
│   │   ├── auth.ts         # Auth validations
│   │   ├── blog.ts         # Blog validations
│   │   ├── common.ts       # Common validations
│   │   └── index.ts        # Barrel export
│   ├── auth.ts             # Auth utilities
│   ├── auth-context.tsx    # Auth context provider
│   ├── auth-hooks.ts       # Auth custom hooks
│   └── constants.ts        # App constants
│
├── types/                   # TypeScript type definitions
│   ├── models.ts           # Data models
│   ├── api.ts              # API & GraphQL response types
│   ├── auth.ts             # Auth types
│   └── index.ts            # Barrel export
│
├── data/                    # Static/mock data
│
├── locales/                 # i18n translations
│   ├── en/
│   └── id/
│
├── styles.css              # Global styles
├── router.tsx              # Router config
└── i18n.ts                 # i18n setup
```

---

## 📋 Best Practices

### 1. **Component Organization**

- **ui/**: Base components dari shadcn/ui (Button, Input, Card, dll)
- **layout/**: Layout wrapper (Header, Footer, Sidebar, AdminLayout, PublicLayout)
- **features/**: Feature-based components organized by domain
  - **auth/**: Authentication (login, signup, forgot password)
  - **blog/**: Blog management (future)
  - **dashboard/**: Dashboard widgets (future)
- **public/**: Komponen untuk halaman public (Hero, Features, Pricing)
- **common/**: Komponen yang shared antar features (Form, DataTable, Navigation)
- **admin/**: Komponen khusus admin panel

### 2. **Validations**

- **lib/validations/**: Zod schemas untuk reusable validation logic
- **TanStack Form**: Gunakan inline field-level validation dengan callback functions
- Zod schemas tetap berguna untuk pre-submit validation atau server-side validation

### 3. **Naming Conventions**

```typescript
// Components - PascalCase
BlogCard.tsx
UserProfile.tsx

// Hooks - camelCase + 'use' prefix
useAuth.ts
useFetch.ts

// Utils - camelCase
formatDate.ts
apiClient.ts

// Types - PascalCase
User
BlogPost
ApiResponse

// Constants - UPPER_SNAKE_CASE
API_URL
MAX_FILE_SIZE
```

### 4. **Import Best Practices**

```typescript
// ✅ DO: Use barrel exports
import { Button, Card } from '@/components/ui'
import { LoginForm, SignupForm } from '@/components/features/auth'
import { formatDate, slugify } from '@/lib/utils'
import { User, Blog } from '@/types'

// ✅ DO: Direct imports for GraphQL
import { urqlClient } from '@/lib/graphql/client'
import { LOGIN_MUTATION } from '@/lib/graphql/auth.graphql'

// ❌ DON'T: Deep imports without barrel exports
import Button from '@/components/ui/button'
import { formatDate } from '@/lib/utils/date'
import { LoginForm } from '@/components/features/auth/login-form' // ❌ Skip barrel export
```

### 5. **File Organization**

Untuk komponen yang kompleks, gunakan folder:

```
UserProfile/
├── UserProfile.tsx
├── UserProfile.test.tsx
├── UserAvatar.tsx
├── UserStats.tsx
└── index.ts           # Export barrel
```

---

## 🎯 Usage Examples

### Using Types

```typescript
import { User, LoginCredentials } from '@/types'

function loginUser(credentials: LoginCredentials): Promise<User> {
  // ...
}
```

### Using Validations (TanStack Form)

```typescript
import { useForm } from '@tanstack/react-form';

const form = useForm({
  defaultValues: {
    email: '',
    password: '',
  },
  onSubmit: async ({ value }) => {
    // Handle submit
  },
});

// Field-level validation
<form.Field
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value) return 'Email harus diisi'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Format email tidak valid'
      }
      return undefined
    },
  }}
>
  {(field) => (
    <Input
      value={field.state.value}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  )}
</form.Field>
```

### Using Utils

```typescript
import { formatDate, slugify, formatCurrency } from '@/lib/utils'

const date = formatDate(new Date()) // "9 Desember 2025"
const slug = slugify('Hello World') // "hello-world"
const price = formatCurrency(50000) // "Rp 50.000,00"
```

### Using Constants

```typescript
import { ROUTES, STORAGE_KEYS, APP_CONFIG } from '@/lib/constants'

// Navigate
router.navigate({ to: ROUTES.LOGIN })

// Storage
localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)

// Config
console.log(APP_CONFIG.APP_NAME) // "Damar Admin CMS"
```

### Using Config (Environment Variables)

```typescript
import { env } from '@/config'

// Type-safe access to environment variables
const apiUrl = env.apiUrl // "http://localhost:8080/query"
const isProduction = env.isProduction // false in development

// Environment-specific logic
if (env.isDevelopment) {
  console.log('Running in development mode')
}
```

### Using GraphQL

```typescript
import { useMutation, useQuery } from 'urql'
import { urqlClient } from '@/lib/graphql/client'
import { LOGIN_MUTATION, ME_QUERY } from '@/lib/graphql/auth.graphql'
import type { LoginResponse, MeResponse } from '@/types'

// Mutation
const [loginResult, loginMutation] = useMutation<LoginResponse>(LOGIN_MUTATION)
const result = await loginMutation({ input: { email, password } })

// Query
const [meResult] = useQuery<MeResponse>({ query: ME_QUERY })

// Direct client usage (advanced)
const result = await urqlClient.query<MeResponse>(ME_QUERY, {}).toPromise()
```

---

## 🚀 Benefits

### 1. **Type Safety**

Centralized types memberikan type safety di seluruh aplikasi

### 2. **Reusability**

Utility functions dan services bisa dipakai ulang

### 3. **Maintainability**

Struktur yang jelas memudahkan maintenance dan debugging

### 4. **Scalability**

Mudah untuk menambah feature baru tanpa mengubah struktur

### 5. **Clean Imports**

Barrel exports membuat imports lebih bersih dan readable

### 6. **Consistency**

Naming conventions dan organization patterns yang konsisten

---

## 📝 Key Files

| File                     | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `config/env.ts`          | Type-safe environment variables                 |
| `types/`                 | TypeScript definitions & interfaces             |
| `lib/validations/`       | Zod schemas (optional, for reusable validation) |
| `lib/utils/`             | Helper & utility functions                      |
| `lib/graphql/`           | GraphQL queries, mutations & urql client        |
| `lib/constants.ts`       | App-wide constants                              |
| `components/**/index.ts` | Barrel exports untuk clean imports              |

> **Note**: Untuk TanStack Form, gunakan inline field-level validation. Zod schemas di `lib/validations/` opsional untuk reusable validation logic.

---

## 🔄 Migration Guide

Jika kamu punya import yang lama, update ke struktur baru:

```typescript
// Before
import { cn } from '@/lib/utils'
import { urqlClient } from '@/lib/urql'

// After
import { cn } from '@/lib/utils'
import { urqlClient } from '@/lib/api'
```

---

## 💡 Tips

1. **Gunakan barrel exports** untuk imports yang lebih clean
2. **Pisahkan concerns**: UI, Logic, Data, Types
3. **Follow naming conventions** yang sudah ada
4. **Keep components small** dan focused
5. **Extract reusable logic** ke hooks atau utils
6. **Use TypeScript** untuk type safety
7. **Validate inputs** dengan Zod schemas

---

## 📚 Further Reading

- [TanStack Router](https://tanstack.com/router)
- [TanStack Form](https://tanstack.com/form)
- [urql GraphQL](https://formidable.com/open-source/urql/)
- [Zod Validation](https://zod.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Happy Coding! 🚀**
