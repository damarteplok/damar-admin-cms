---
description: Build shadcn/ui components for the frontend
---

# shadcn/ui Component Builder Workflow

## Technology Stack

- **Frontend Framework**: TanStack Start (located in `web/` directory)
- **Component Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with design tokens
- **Type System**: TypeScript with strict typing
- **Variant Management**: Class Variance Authority (CVA)

## Component Architecture Principles

### 1. Plan Component Structure

Before coding, describe component architecture:
- Component hierarchy and composition
- Props interface and variants
- Accessibility requirements
- State management approach

### 2. Follow shadcn/ui Patterns

- Extend existing shadcn components rather than rebuilding
- Use Radix UI primitives as foundation for new components
- Follow shadcn/ui component API conventions
- Implement proper variant systems with sensible defaults

### 3. Clean Architecture

```typescript
// Component with forwardRef for interactive elements
export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"
```

## Component Implementation Steps

### 1. Define Props Interface

```typescript
import * as React from "react"
import { type VariantProps } from "class-variance-authority"

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
```

### 2. Create Variant System with CVA

```typescript
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### 3. Implement Component with Accessibility

```typescript
import { cn } from "@/lib/utils"
import * as React from "react"

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
```

### 4. Create Compound Components (if needed)

```typescript
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "Card.Header"

// Export as compound
export { Card, CardHeader, CardContent, CardFooter }
```

## Styling Guidelines

### 1. Use shadcn Design Tokens

```typescript
// Good: Use CSS variables for theme-aware styling
className="bg-primary text-primary-foreground"

// Good: Dark mode support through variables
className="bg-background text-foreground"

// Avoid: Hard-coded colors
className="bg-blue-500 text-white"
```

### 2. Implement Proper Focus States

```typescript
className={cn(
  "focus-visible:outline-none",
  "focus-visible:ring-2",
  "focus-visible:ring-ring",
  "focus-visible:ring-offset-2"
)}
```

### 3. Follow shadcn Spacing Scale

- Use predefined Tailwind spacing: `p-4`, `gap-2`, `space-y-4`
- Follow shadcn typography scale: `text-sm`, `text-base`, `text-lg`

## Accessibility Standards

### 1. ARIA Labels and Roles

```typescript
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  role="button"
>
  Close
</button>
```

### 2. Keyboard Navigation

```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onClick?.()
  }
}

<div
  tabIndex={0}
  onKeyDown={handleKeyDown}
  role="button"
>
  Click me
</div>
```

### 3. Screen Reader Support

```typescript
<span className="sr-only">Loading...</span>
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

## Component Patterns

### 1. Controlled vs Uncontrolled

```typescript
// Support both patterns
interface InputProps {
  value?: string          // Controlled
  defaultValue?: string   // Uncontrolled
  onChange?: (value: string) => void
}
```

### 2. Composition with Slot

```typescript
import { Slot } from "@radix-ui/react-slot"

// Allows component to render as child
<Button asChild>
  <a href="/login">Login</a>
</Button>
```

### 3. Error and Loading States

```typescript
interface FormFieldProps {
  error?: string
  isLoading?: boolean
}

{isLoading && <Spinner />}
{error && <p className="text-sm text-destructive">{error}</p>}
```

## Integration with Backend

Components consume GraphQL API via API Gateway:

```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const response = await fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ users { id email name } }'
      })
    })
    return response.json()
  }
})
```

## Best Practices

1. **Think step-by-step**: Plan component architecture in pseudocode first
2. **Complete implementation**: No TODOs or placeholders
3. **Include all imports**: Proper TypeScript types and dependencies
4. **Accessibility first**: WCAG 2.1 AA compliance
5. **Theme-aware**: Use CSS variables for colors
6. **Responsive**: Mobile-first approach
7. **Performance**: Optimize re-renders with React.memo when needed

## File Location

Frontend code is in `web/` directory using micro-frontend architecture:
- Components: `web/app/components/ui/`
- Pages: `web/app/routes/`
- Utilities: `web/app/lib/`

## Testing Components

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('button click handler is called', async () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  await userEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

## Resources

When uncertain about patterns:
- Search for latest shadcn/ui documentation
- Check Radix UI primitive documentation
- Review accessibility best practices (WCAG)
- Consult existing shadcn components in the project
