---
description: Complete frontend development workflow guide
---

# Frontend Development Workflow

## Tech Stack Overview

This project uses a modern React-based stack:

- **Framework**: TanStack Start (full-stack React meta-framework)
- **Forms**: TanStack Form with Zod validation
- **GraphQL**: urql (lightweight GraphQL client)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Safety**: TypeScript with strict mode
- **State Management**: TanStack Query for server state
- **Routing**: File-based routing via TanStack Router

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── admin/           # Admin-specific components
│   │   └── public/          # Public-facing components
│   ├── routes/              # File-based routing
│   │   ├── _layout/         # Public layout routes
│   │   └── admin/           # Admin routes
│   ├── lib/                 # Utilities and helpers
│   │   ├── graphql/         # GraphQL client setup
│   │   └── utils.ts         # Common utilities
│   ├── styles/              # Global styles
│   └── app.tsx              # App entry point
├── public/                  # Static assets
└── package.json
```

## Getting Started

### 1. Navigate to Frontend Directory

```bash
cd web
```

### 2. Install Dependencies

// turbo
```bash
pnpm install
```

### 3. Start Development Server

// turbo
```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## Development Workflows

### Creating a New Route

TanStack Start uses file-based routing. Routes are defined in `src/routes/`.

#### 1. Create Route File

For a new page at `/about`, create:
```
src/routes/_layout/about.tsx
```

#### 2. Implement Route Component

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold">About Us</h1>
      <p className="mt-4 text-muted-foreground">
        Welcome to our platform
      </p>
    </div>
  )
}
```

#### 3. Nested Routes

For `/admin/users`, create:
```
src/routes/admin/users.tsx
```

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/users')({
  component: UsersPage,
})

function UsersPage() {
  return <div>Users Management</div>
}
```

### Creating Forms with TanStack Form

#### 1. Define Form Schema with Zod

```typescript
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>
```

#### 2. Create Form Component

```typescript
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'

function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      // Handle form submission
      console.log('Form data:', value)
    },
    validators: {
      onChange: loginSchema,
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: z.string().email(),
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            {field.state.meta.errors && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <button type="submit" className="mt-4 px-4 py-2 bg-primary text-white rounded">
        Submit
      </button>
    </form>
  )
}
```

#### 3. Integration with shadcn/ui Components

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<form.Field name="email">
  {(field) => (
    <div className="space-y-2">
      <Label htmlFor={field.name}>Email</Label>
      <Input
        id={field.name}
        type="email"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errors && (
        <p className="text-sm text-destructive">
          {field.state.meta.errors[0]}
        </p>
      )}
    </div>
  )}
</form.Field>
```

### GraphQL Integration with urql

#### 1. Setup GraphQL Client

The client is configured in `src/lib/graphql/client.ts`:

```typescript
import { Client, cacheExchange, fetchExchange } from 'urql'

export const graphqlClient = new Client({
  url: 'http://localhost:8080/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-and-network',
})
```

#### 2. Making GraphQL Queries

```typescript
import { useQuery } from 'urql'

const UsersQuery = `
  query GetUsers {
    users {
      id
      email
      name
      role
    }
  }
`

function UsersList() {
  const [result, reexecuteQuery] = useQuery({
    query: UsersQuery,
  })

  const { data, fetching, error } = result

  if (fetching) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data.users.map((user) => (
        <div key={user.id}>
          {user.name} - {user.email}
        </div>
      ))}
    </div>
  )
}
```

#### 3. GraphQL Mutations

```typescript
import { useMutation } from 'urql'

const CreateUserMutation = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
    }
  }
`

function CreateUserForm() {
  const [result, createUser] = useMutation(CreateUserMutation)

  const handleSubmit = async (formData) => {
    const { data, error } = await createUser({
      input: formData,
    })

    if (error) {
      console.error('Mutation error:', error)
      return
    }

    console.log('User created:', data.createUser)
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(/* form data */)
    }}>
      {/* Form fields */}
    </form>
  )
}
```

#### 4. GraphQL with Variables

```typescript
const UserQuery = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      posts {
        id
        title
      }
    }
  }
`

function UserProfile({ userId }: { userId: string }) {
  const [result] = useQuery({
    query: UserQuery,
    variables: { id: userId },
  })

  // Handle result...
}
```

### Authentication Patterns

#### 1. Protected Routes

```typescript
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AdminLayout,
})
```

#### 2. Auth Context

```typescript
import { createContext, useContext, useState } from 'react'

interface AuthContext {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContext | null>(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    // Call login mutation
    const result = await loginMutation({ email, password })
    setUser(result.data.user)
  }

  const logout = () => {
    setUser(null)
    // Clear tokens, etc.
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Working with shadcn/ui Components

#### 1. Adding New Components

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add dialog
```

#### 2. Customizing Components

Edit the component in `src/components/ui/` after installation:

```typescript
// src/components/ui/button.tsx
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        custom: "bg-gradient-to-r from-purple-500 to-pink-500",
      },
    },
  }
)
```

#### 3. Using Components

```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'

function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  )
}
```

### Environment Variables

#### 1. Define Variables

Create `.env.local` in the `web/` directory:

```env
VITE_API_URL=http://localhost:8080
VITE_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
VITE_APP_NAME=My Admin CMS
```

#### 2. Access in Code

```typescript
const apiUrl = import.meta.env.VITE_API_URL
const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT

export const config = {
  apiUrl,
  graphqlEndpoint,
  appName: import.meta.env.VITE_APP_NAME,
}
```

#### 3. Type Safety for Env Variables

```typescript
// src/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GRAPHQL_ENDPOINT: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Best Practices

### 1. Component Organization

```
components/
├── ui/              # Reusable UI primitives (shadcn/ui)
├── admin/           # Admin-specific business components
├── public/          # Public-facing business components
└── layouts/         # Layout components
```

### 2. Code Style

- Use TypeScript strict mode
- Prefer function components over class components
- Use proper TypeScript types, avoid `any`
- Follow React hooks rules
- Keep components small and focused

### 3. Performance

```typescript
// Lazy load routes
const AdminRoute = lazy(() => import('./routes/admin'))

// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### 4. Error Handling

```typescript
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="p-4 bg-destructive/10 rounded">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <pre className="text-sm text-muted-foreground">{error.message}</pre>
    </div>
  )
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyComponent />
</ErrorBoundary>
```

### 5. Accessibility

- Use semantic HTML
- Provide ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper color contrast

```typescript
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <X className="h-4 w-4" />
</button>
```

## Common Tasks

### Adding a New Page

**Reference Implementation**: For a complete CRUD example, please refer to the following folders which serve as the standard reference for implementing new CRUD features, including table listings, forms, and data fetching patterns:
- **Product Module** (Newer, recommended): `web/src/routes/admin/products` and `web/src/components/features/admin/products`
- **Workspaces Module**: `web/src/routes/admin/workspaces` and `web/src/components/features/admin/workspaces`

1. Create route file in `src/routes/`
2. Define route with `createFileRoute`
3. Implement component
4. Add navigation link if needed

### Creating a Form

1. Define Zod schema
2. Create form with `useForm`
3. Add form fields with validation
4. Handle submission (usually GraphQL mutation)
5. Show success/error feedback

### Fetching Data

1. Write GraphQL query
2. Use `useQuery` hook
3. Handle loading/error states
4. Render data

### Building for Production

```bash
pnpm build
```

This creates optimized production build in `dist/`.

## Troubleshooting

### Dev Server Won't Start

1. Check if port 3000 is already in use
2. Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
3. Check for syntax errors in route files

### GraphQL Query Fails

1. Verify GraphQL endpoint is running (`http://localhost:8080/graphql`)
2. Check query syntax in GraphQL playground
3. Verify authentication headers if required
4. Check browser network tab for detailed error

### Type Errors

1. Regenerate GraphQL types if schema changed
2. Check TypeScript version compatibility
3. Clear TypeScript cache: `rm -rf .tsc-cache`

### Styling Not Applied

1. Verify Tailwind config includes all content paths
2. Check if CSS is imported in root
3. Clear build cache and restart dev server
4. Verify class names are correct (no typos)

## Resources

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Form Docs](https://tanstack.com/form)
- [TanStack Router Docs](https://tanstack.com/router)
- [urql Documentation](https://formidable.com/open-source/urql/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Zod Documentation](https://zod.dev/)

## Related Workflows

- See `/shadcn-component` for detailed component building guide
- See `/graphql-generation` for backend GraphQL schema updates
- See `/local-development` for running the full stack locally
