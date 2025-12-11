# DataTable Component Guide

This project has two DataTable components for different use cases:

## 1. DataTable (`data-table.tsx`)

**Use for: Server-Side Operations**

When your API supports pagination, sorting, and filtering on the backend (like with large datasets).

### Features

- Server-side pagination
- Server-side sorting
- Server-side search/filtering
- **Column visibility toggle** (show/hide columns)
- Optimized for large datasets
- Requires backend API support

### Example Usage

```tsx
<DataTable
  title="Products"
  columns={columns}
  data={products}
  searchColumn="name"
  serverSideSearch={true}
  onSearchChange={handleSearch}
  totalItems={totalCount}
  totalPages={totalPages}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  onSortChange={handleSort}
/>
```

## 2. DataTableClient (`data-table-client.tsx`)

**Use for: Client-Side Operations**

When you fetch all data at once and want to handle everything on the frontend (like for workspace users, small datasets).

### Features

- Client-side pagination
- Client-side sorting (built-in)
- Client-side filtering/search (built-in)
- **Column visibility toggle** (show/hide columns)
- Simpler API
- No backend changes needed
- Better for small-medium datasets (< 1000 rows)

### Example Usage

```tsx
<DataTableClient
  title="Workspace Users"
  columns={columns}
  data={allUsers} // All data loaded at once
  searchColumn="email"
  searchPlaceholder="Search by email..."
  defaultPageSize={10}
  pageSizeOptions={[5, 10, 20, 50]}
/>
```

## When to Use Which?

### Use `DataTable` (Server-Side) when:

- Dataset is large (1000+ records)
- API provides pagination/sorting/filtering
- Data changes frequently
- Need to optimize network bandwidth
- Examples: Product catalog, transaction logs, user directory

### Use `DataTableClient` (Client-Side) when:

- Dataset is small (< 1000 records)
- All data is fetched in one query
- Data is relatively static
- Simpler implementation preferred
- Examples: Workspace members, user roles, settings list, team members

## Column Definition

Both components use the same `ColumnDef` from `@tanstack/react-table`:

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <Badge>{row.original.role}</Badge>,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsMenu item={row.original} />,
  },
]
```

## Internationalization (i18n)

Both DataTable components are fully internationalized using `react-i18next`. All UI text automatically switches based on the user's selected language.

### Supported Translations

All text in the DataTable components is translatable:

- Column visibility button
- Loading messages
- Empty state messages
- Pagination labels (Showing X of Y, Previous, Next, etc.)
- Rows per page selector

### Available Languages

The project currently supports:

- **English** (`en.json`)
- **Indonesian** (`id.json`)

Translations are stored in `/web/src/locales/` and use the `datatable.*` namespace:

```json
{
  "datatable": {
    "columns": "Columns",
    "loading": "Loading...",
    "no_results": "No results found.",
    "showing": "Showing",
    "to": "to",
    "of": "of",
    "results": "results",
    "pages": "page(s)",
    "rows_per_page": "Rows per page",
    "previous": "Previous",
    "next": "Next",
    "typing": "Typing..."
  }
}
```

### Adding New Languages

To add a new language:

1. Create a new locale file in `/web/src/locales/` (e.g., `es.json` for Spanish)
2. Copy the `datatable` section from `en.json`
3. Translate all values to the new language
4. Register the new locale in your i18n configuration

## Column Visibility Toggle

Both components now include a column visibility toggle feature. Click the "Columns" button (with Settings2 icon) to show/hide columns.

### How it works:

- A dropdown menu appears with checkboxes for each column
- Only columns with `accessorFn` (data columns) can be toggled
- `rowNumber` and `actions` columns are automatically excluded
- Column visibility state is managed internally
- Users can show/hide multiple columns

### Controlling Column Visibility

To disable hiding for specific columns, add `enableHiding: false` to column definition:

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    enableHiding: false, // This column cannot be hidden
  },
  {
    accessorKey: 'role',
    header: 'Role',
    // Can be hidden (default: true)
  },
]
```

## Common Props

Both components share these props:

| Prop                | Type        | Description              |
| ------------------- | ----------- | ------------------------ |
| `title`             | string      | Table title              |
| `description`       | string      | Optional description     |
| `columns`           | ColumnDef[] | Column definitions       |
| `data`              | TData[]     | Table data               |
| `searchColumn`      | string      | Column to search in      |
| `searchPlaceholder` | string      | Search input placeholder |
| `canAdd`            | boolean     | Show add button          |
| `addButtonTitle`    | string      | Add button text          |
| `onAddClick`        | () => void  | Add button handler       |
| `showRowNumber`     | boolean     | Show row numbers         |
| `isLoading`         | boolean     | Loading state            |

## Migration from DataTable to DataTableClient

If you have an existing component using `DataTable` without server-side features:

```diff
- import { DataTable } from '@/components/data-table'
+ import { DataTableClient } from '@/components/data-table-client'

- <DataTable
+ <DataTableClient
    title="Users"
    columns={columns}
    data={users}
-   serverSideSearch={false}
-   currentPage={1}
-   pageSize={10}
+   defaultPageSize={10}
  />
```
