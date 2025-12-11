# Reusable UI Components

This directory contains generic, reusable UI components that can be used across the entire application.

## DataTableSkeleton

Skeleton loader that matches the structure of DataTable component.

### Usage

```tsx
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'

function MyComponent() {
  const { data, isLoading } = useQuery()

  if (isLoading) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={5}
      />
    )
  }

  return <DataTable {...props} />
}
```

### Props

| Prop               | Type      | Default | Description                     |
| ------------------ | --------- | ------- | ------------------------------- |
| `showCreateButton` | `boolean` | `true`  | Show skeleton for create button |
| `showSearch`       | `boolean` | `true`  | Show skeleton for search bar    |
| `rows`             | `number`  | `10`    | Number of skeleton rows         |
| `columns`          | `number`  | `5`     | Number of skeleton columns      |

---

## ErrorState

Generic error/info state component for displaying messages.

### Usage

```tsx
import { ErrorState } from '@/components/ui/error-state'

// Error
<ErrorState
  title="Failed to load data"
  description="Could not fetch users. Please try again."
/>

// Warning
<ErrorState
  title="Slow connection"
  description="Your internet connection seems slow."
  variant="warning"
/>

// Info
<ErrorState
  title="No results found"
  description="Try adjusting your search query."
  variant="info"
/>

// With action
<ErrorState
  title="Session expired"
  description="Please log in again to continue."
  action={<Button onClick={handleLogin}>Login</Button>}
/>
```

### Props

| Prop          | Type                                                | Default                     | Description                     |
| ------------- | --------------------------------------------------- | --------------------------- | ------------------------------- |
| `title`       | `string`                                            | `"Error"`                   | Title text                      |
| `description` | `ReactNode`                                         | `"Something went wrong..."` | Description (supports JSX)      |
| `variant`     | `'destructive' \| 'warning' \| 'info' \| 'success'` | `'destructive'`             | Visual style                    |
| `icon`        | `ReactNode`                                         | Auto based on variant       | Custom icon                     |
| `action`      | `ReactNode`                                         | -                           | Action button or custom element |

### Variants

- **destructive** (red) - Errors, failures
- **warning** (yellow) - Warnings, cautions
- **info** (blue) - Informational messages
- **success** (green) - Success messages

---

## ConfirmDialog

Generic confirmation dialog for any destructive or important action.

### Usage

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete Item</Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        title="Delete Item?"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  )
}
```

### Props

| Prop           | Type                         | Default                           | Description                       |
| -------------- | ---------------------------- | --------------------------------- | --------------------------------- |
| `open`         | `boolean`                    | -                                 | Controls dialog visibility        |
| `onOpenChange` | `(open: boolean) => void`    | -                                 | Callback when dialog should close |
| `onConfirm`    | `() => void`                 | -                                 | Callback when confirmed           |
| `title`        | `string`                     | `"Are you sure?"`                 | Dialog title                      |
| `description`  | `ReactNode`                  | `"This action cannot be undone."` | Dialog content                    |
| `confirmText`  | `string`                     | `"Confirm"`                       | Confirm button text               |
| `cancelText`   | `string`                     | `"Cancel"`                        | Cancel button text                |
| `variant`      | `'default' \| 'destructive'` | `'default'`                       | Button variant                    |

### Examples

**Delete Confirmation:**

```tsx
<ConfirmDialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  onConfirm={() => deleteUser(userId)}
  title="Delete User?"
  description={
    <>
      This will permanently delete <strong>{userName}</strong> and all their
      data.
    </>
  }
  variant="destructive"
  confirmText="Delete"
/>
```

**Logout Confirmation:**

```tsx
<ConfirmDialog
  open={logoutOpen}
  onOpenChange={setLogoutOpen}
  onConfirm={handleLogout}
  title="Logout?"
  description="Are you sure you want to log out?"
  confirmText="Logout"
/>
```

---

## DataTableActions

Generic dropdown action menu for data table rows.

### Usage

```tsx
import { DataTableActions, DataTableAction } from '@/components/ui/data-table-actions'
import { Pencil, Trash2, Copy } from 'lucide-react'

// In your column definition
{
  id: 'actions',
  cell: ({ row }) => {
    const item = row.original

    const actions: DataTableAction<User>[] = [
      {
        label: 'Copy ID',
        icon: Copy,
        onClick: (user) => navigator.clipboard.writeText(user.id)
      },
      { separator: true },
      {
        label: 'Edit',
        icon: Pencil,
        onClick: (user) => handleEdit(user.id)
      },
      {
        label: 'Delete',
        icon: Trash2,
        onClick: (user) => handleDelete(user.id),
        variant: 'destructive'
      }
    ]

    return <DataTableActions item={item} actions={actions} />
  }
}
```

### Props

| Prop      | Type                   | Default     | Description                |
| --------- | ---------------------- | ----------- | -------------------------- |
| `item`    | `T`                    | -           | The data item for this row |
| `actions` | `DataTableAction<T>[]` | -           | Array of actions           |
| `label`   | `string`               | `"Actions"` | Dropdown label             |

### Action Types

**Regular Action:**

```typescript
{
  label: string
  icon?: LucideIcon
  onClick: (item: T) => void
  variant?: 'default' | 'destructive'
}
```

**Separator:**

```typescript
{
  separator: true
}
```

### Examples

**User Table Actions:**

```tsx
const actions: DataTableAction<User>[] = [
  {
    label: 'View Profile',
    icon: Eye,
    onClick: (user) => router.push(`/users/${user.id}`),
  },
  {
    label: 'Copy Email',
    icon: Copy,
    onClick: (user) => navigator.clipboard.writeText(user.email),
  },
  { separator: true },
  {
    label: 'Edit',
    icon: Pencil,
    onClick: (user) => handleEdit(user.id),
  },
  {
    label: 'Block',
    icon: Ban,
    onClick: (user) => handleBlock(user.id),
    variant: 'destructive',
  },
  { separator: true },
  {
    label: 'Delete',
    icon: Trash2,
    onClick: (user) => handleDelete(user.id),
    variant: 'destructive',
  },
]
```

**Product Table Actions:**

```tsx
const actions: DataTableAction<Product>[] = [
  {
    label: 'View',
    icon: Eye,
    onClick: (product) => window.open(product.url, '_blank'),
  },
  {
    label: 'Duplicate',
    icon: Copy,
    onClick: (product) => handleDuplicate(product.id),
  },
  { separator: true },
  {
    label: 'Edit',
    icon: Pencil,
    onClick: (product) => handleEdit(product.id),
  },
  {
    label: 'Archive',
    icon: Archive,
    onClick: (product) => handleArchive(product.id),
  },
]
```

---

## Benefits

✅ **Consistent UI**: Same look and feel across all tables and dialogs  
✅ **Type Safe**: Full TypeScript support with generics  
✅ **DRY**: Write action logic once, reuse everywhere  
✅ **Flexible**: Support for custom icons, variants, and separators  
✅ **Maintainable**: Update once, affects all usages  
✅ **Accessible**: Built on shadcn/ui components with proper ARIA attributes

---

## Where These Components Are Used

### ConfirmDialog

- ✅ Workspace deletion (`/admin/workspaces`)
- 🔜 User deletion
- 🔜 Product deletion
- 🔜 Any destructive action

### DataTableActions

- ✅ Workspace list (`/admin/workspaces`)
- 🔜 User list
- 🔜 Product list
- 🔜 Any data table with actions

---

## Creating Similar Reusable Components

When creating new reusable components:

1. **Keep them generic** - Don't couple to specific business logic
2. **Use TypeScript generics** - Allow type inference
3. **Provide sensible defaults** - Make common cases easy
4. **Document thoroughly** - Examples and props table
5. **Follow shadcn patterns** - Consistent with existing UI components
