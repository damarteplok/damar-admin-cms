---
description: Generate CRUD feature boilerplate code
---

# Generate CRUD Feature

This workflow generates all boilerplate code for a new CRUD feature in the admin panel.

## When to Use

Use this workflow when you need to create a new admin CRUD feature with:

- List page with pagination, search, and sorting
- Create/Edit forms
- GraphQL queries and mutations
- Column definitions

## Usage

// turbo

1. Run the generator script:

```bash
cd web
npm run generate:crud -- --name "category" --pluralName "Categories"
```

2. Add export to `src/types/index.ts`:

```typescript
export * from './category'
```

// turbo 3. Regenerate routes:

```bash
cd web
npm run generate-routes
```

4. (Optional) Add sidebar menu item in admin layout

## Parameters

- `--name` - Singular name in lowercase (e.g., "category", "tag", "author")
- `--pluralName` - Display name for UI (e.g., "Categories", "Tags", "Authors")

## Generated Files

```
src/
├── types/{name}.ts                           # TypeScript types
├── lib/graphql/{name}.graphql.ts             # GraphQL queries/mutations
├── features/{plural}/
│   ├── config.ts                             # CRUD configuration
│   └── index.ts                              # Feature exports
├── components/features/admin/{plural}/
│   ├── {name}-columns.tsx                    # Table column definitions
│   ├── {name}-form.tsx                       # Form component
│   └── index.ts                              # Component exports
└── routes/admin/{plural}/
    ├── index.tsx                             # List page
    ├── create.tsx                            # Create page
    └── $id/
        └── edit.tsx                          # Edit page
```

## Architecture

The CRUD system uses:

1. **Generic Components** (`src/components/crud/`):
   - `CrudListPage` - Handles data table with pagination, search, sort, delete
   - `CrudCreatePage` - Wrapper for create forms
   - `CrudEditPage` - Fetches data and renders edit form

2. **Custom Hooks** (`src/hooks/crud/`):
   - `useCrudTable` - Manages list page state (pagination, sort, search, delete)
   - `useCrudForm` - Manages form submission and toast notifications

3. **Feature Config** (`src/features/{resource}/config.ts`):
   - Centralizes all configuration for a CRUD resource
   - Contains GraphQL queries, columns factory, form component, translations

## Customization

After generation, customize as needed:

1. **Add more fields**: Edit `{name}-form.tsx` and types
2. **Add columns**: Edit `{name}-columns.tsx`
3. **Custom detail page**: Create `routes/admin/{plural}/$id/index.tsx` manually
4. **Add filters**: Extend `config.ts` with `listQueryVariables`

## Example: Adding Categories

```bash
npm run generate:crud -- --name "category" --pluralName "Categories"
```

Then implement backend GraphQL resolvers:

- `categories(page, perPage, search, sortBy, sortOrder)` - Query
- `category(id)` - Query
- `createCategory(input)` - Mutation
- `updateCategory(input)` - Mutation
- `deleteCategory(id)` - Mutation
