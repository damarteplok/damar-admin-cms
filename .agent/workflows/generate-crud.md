---
description: How to generate and configure a new CRUD feature
---

# Generate CRUD Workflow

This workflow describes how to use the CRUD generator script to create a new admin feature and how to troubleshoot common issues.

## 1. Run the Generator

Run the following command in the `web` directory:

```bash
npx tsx scripts/generate-crud.ts --name "category" --pluralName "Categories"
```

- `--name`: Singular resource name (lowercase), e.g., `category`, `product`.
- `--pluralName`: Display name for the UI, e.g., `Categories`, `Products`.

## 2. Generated Files

The script will generate:
- `src/types/{name}.ts` - TypeScript interfaces
- `src/lib/graphql/{name}.graphql.ts` - GraphQL queries & mutations
- `src/features/{plural}/config.ts` - CRUD Configuration
- `src/components/features/admin/{plural}/{name}-form.tsx` - Form component
- `src/components/features/admin/{plural}/{name}-columns.tsx` - DataTable columns
- `src/routes/admin/{plural}/index.tsx` - List page
- `src/routes/admin/{plural}/create.tsx` - Create page
- `src/routes/admin/{plural}/$id/edit.tsx` - Edit page

## 3. Post-Generation Steps

1.  **Export Types**: Add `export * from './{name}'` in `src/types/index.ts`.
2.  **Generate Routes**: Run `npm run generate-routes` or `tilt` will handle it.
3.  **Implement Backend**: Ensure the GraphQL API exists for the resource.
4.  **Add to Sidebar**: Update `src/components/layout/sidebar.tsx` (or config) to include the new menu item.

## 4. Troubleshooting & Common Issues

### Mutation Keys Mismatch (e.g., `createCategor` vs `createCategory`)

**Symptom:** Create/Update action fails or shows success but data isn't returned correctly, or `undefined` error.
**Cause:** The generator assumes mutation names like `create{ResourceName}`. Sometimes the API uses a different name or the singular/plural logic fails (e.g. `category` -> `categor`).
**Fix:**
Open `src/features/{plural}/config.ts` and add explicit keys:

```typescript
queries: {
  // ...
  getKey: 'category',          // Key in query response
  createKey: 'createCategory', // Key in create mutation response
  updateKey: 'updateCategory', // Key in update mutation response
  deleteKey: 'deleteCategory', // Key in delete mutation response
},
```

### Search Not Working

**Symptom:** Typing in the search bar reloads the table but results are not filtered.
**Cause:** The GraphQL query in `src/lib/graphql/{name}.graphql.ts` might be missing the `$search` parameter definition.
**Fix:**
Update the query definition:

```graphql
query GetItems(
  $page: Int
  $perPage: Int
  $search: String  # <--- Ensure this is present
) {
  items(
    page: $page
    perPage: $perPage
    search: $search # <--- Ensure this is passed
  ) { ... }
}
```

### TypeScript Error in Columns (`onDelete`)

**Symptom:** Error in `config.ts`: `Type '(id: string) => void' is not assignable to type '(category: Category) => void'`.
**Cause:** The generic `CrudConfig` expects `onDelete` to take an `id` string, but the generated column component might be typed to take the full object.
**Fix:**
Update `src/components/features/admin/{plural}/{name}-columns.tsx`:

```typescript
// Change interface
interface ColumnProps {
  onDelete: (id: string) => void // <--- Use string ID
  // ...
}

// Update usage in dropdown
onClick={() => onDelete(row.original.id)} // <--- Pass ID
```

### Resource Name Mismatch (Backend)

**Symptom:** Frontend generates `createWorkspace` but backend expects `createTenant`.
**Fix:** Use the explicit keys in `config.ts` as described in "Mutation Keys Mismatch" above.
