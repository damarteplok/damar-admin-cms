# Workspaces Management Module

Clean, modular workspace management interface with Filament-inspired design using **reusable components**.

## Structure

```
# Route
routes/admin/workspaces/
└── index.tsx                          # Main page component

# Feature Components (reusable across admin)
components/features/admin/workspaces/
├── index.ts                           # Barrel export
├── workspace-columns.tsx              # Table column definitions
└── workspace-header.tsx               # Page header with stats

# Shared UI Components (reusable everywhere)
components/ui/
├── confirm-dialog.tsx                 # Generic confirmation dialog
└── data-table-actions.tsx             # Generic dropdown actions menu
```

## Architecture Pattern

### Main Page (`index.tsx`)

- **Responsibility**: Data fetching, state management, and orchestration
- **Clean by**: Delegating UI concerns to specialized components
- **Handles**: GraphQL queries, mutations, and global page state

### Component Modules

#### Feature Components (`components/features/admin/workspaces/`)

##### 1. **workspace-columns.tsx**

- Column definitions specific to workspace table
- Sortable headers with `ArrowUpDown` icons
- Custom cell renderers (badges, formatted dates)
- Factory function `createWorkspaceColumns()` that accepts handlers
- Uses generic `DataTableActions` component for action menu

##### 2. **workspace-header.tsx**

- Page title and description
- "Create Workspace" CTA button
- Statistics card showing total workspaces

#### Shared UI Components (`components/ui/`)

##### 3. **confirm-dialog.tsx** ⚡ REUSABLE

- Generic confirmation dialog
- Props: title, description, confirmText, cancelText, variant
- Can be used anywhere in the app
- Example: Delete confirmation, logout confirmation, etc.

##### 4. **data-table-actions.tsx** ⚡ REUSABLE

- Generic dropdown action menu for data tables
- Props: item, actions array
- Supports icons, separators, variants (default/destructive)
- Can be used for any entity (users, products, posts, etc.)

## Key Features

### 🎨 Filament-Inspired Design

- Clean table layout with proper spacing
- Badge-styled slug display
- Dropdown action menus
- Statistics cards
- Proper loading and error states

### 🧩 Modular Architecture

- Separated concerns (data vs presentation)
- Reusable components
- Easy to test and maintain
- Clear file organization

### 📊 Data Table Features

- Server-side search
- Sortable columns
- Pagination with configurable page sizes
- Loading states without layout shift
- Proper TypeScript typing

### 🎯 User Experience

- Confirmation dialogs for destructive actions
- Loading indicators
- Error handling with alerts
- Responsive action menus

## Usage Examples

### 1. Using ConfirmDialog in Other Pages

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

function MyComponent() {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <ConfirmDialog
      open={deleteOpen}
      onOpenChange={setDeleteOpen}
      onConfirm={() => console.log('Confirmed!')}
      title="Delete User?"
      description="This will permanently remove the user account."
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
    />
  )
}
```

### 2. Using DataTableActions in Other Tables

```tsx
import { DataTableActions, DataTableAction } from '@/components/ui/data-table-actions'
import { Copy, Pencil, Trash2 } from 'lucide-react'

// In your column definition
{
  id: 'actions',
  cell: ({ row }) => {
    const actions: DataTableAction<User>[] = [
      {
        label: 'Copy Email',
        icon: Copy,
        onClick: (user) => navigator.clipboard.writeText(user.email)
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

    return <DataTableActions item={row.original} actions={actions} />
  }
}
```

### 3. Adding a New Action to Workspace

1. **Update `workspace-columns.tsx`:**

```tsx
const actions: DataTableAction<Tenant>[] = [
  // ... existing actions
  {
    label: 'Duplicate',
    icon: Copy,
    onClick: (workspace) => onDuplicate(workspace.id),
  },
]
```

2. **Update column factory props:**

```tsx
interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void // Add new handler
}
```

3. **Implement in `index.tsx`:**

```tsx
const handleDuplicateWorkspace = (id: string) => {
  // Implementation
}

const columns = useMemo(
  () =>
    createWorkspaceColumns({
      onEdit: handleEditWorkspace,
      onDelete: handleDeleteWorkspace,
      onDuplicate: handleDuplicateWorkspace,
    }),
  [],
)
```

### Adding a New Column

Add to `columns.tsx`:

```tsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const status = row.getValue('status')
    return <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  },
}
```

## Component Props

### WorkspaceHeader

```typescript
interface WorkspaceHeaderProps {
  onAddClick: () => void
  totalWorkspaces: number
  isLoading?: boolean
}
```

### ConfirmDialog ⚡ REUSABLE

```typescript
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string // Default: "Are you sure?"
  description?: ReactNode // Default: "This action cannot be undone."
  confirmText?: string // Default: "Confirm"
  cancelText?: string // Default: "Cancel"
  variant?: 'default' | 'destructive' // Default: 'default'
}
```

### DataTableActions ⚡ REUSABLE

```typescript
interface DataTableActionsProps<T = any> {
  item: T // The data item for this row
  actions: DataTableAction<T>[] // Array of actions
  label?: string // Default: "Actions"
}

type DataTableAction<T> =
  | {
      label: string
      icon?: LucideIcon
      onClick: (item: T) => void
      variant?: 'default' | 'destructive'
    }
  | {
      separator: true // For separators
    }
```

### createWorkspaceColumns

```typescript
interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}
```

## Benefits of This Structure

1. **Reduced Boilerplate**: Components are focused and reusable
2. **Better Testing**: Easy to test individual components
3. **Maintainability**: Changes are localized to specific files
4. **Scalability**: Easy to add new features or columns
5. **Type Safety**: Full TypeScript support throughout
6. **Consistency**: Follows shadcn/ui patterns and conventions
7. **🎯 Reusability**: `ConfirmDialog` and `DataTableActions` can be used across the entire app
8. **🎯 TanStack Router Compatible**: No routing conflicts (moved from `_components/` to `components/features/`)
9. **🎯 Feature-based Organization**: Related components grouped by feature, not by route

## Next Steps

- [ ] Implement create workspace modal/page
- [ ] Implement edit workspace form
- [ ] Add bulk actions (select multiple workspaces)
- [ ] Add filters (by status, date range, etc)
- [ ] Add export functionality (CSV, Excel)
- [ ] Implement workspace settings management
