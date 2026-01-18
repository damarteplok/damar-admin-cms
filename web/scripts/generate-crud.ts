#!/usr/bin/env node
/**
 * CRUD Code Generator
 *
 * Generates boilerplate code for a new CRUD feature including:
 * - Feature config
 * - GraphQL queries
 * - Column definitions
 * - Form component
 * - Route files
 *
 * Usage:
 *   npx tsx scripts/generate-crud.ts --name "categories" --pluralName "Categories"
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// Parse command line arguments
const args = process.argv.slice(2)
const getArg = (name: string): string | undefined => {
  const index = args.indexOf(`--${name}`)
  return index !== -1 ? args[index + 1] : undefined
}

const singularName = getArg('name')
const pluralDisplayName = getArg('pluralName')

if (!singularName) {
  console.error(
    'Usage: npx tsx scripts/generate-crud.ts --name "category" --pluralName "Categories"',
  )
  console.error(
    '  --name         Singular name in lowercase (e.g., "category")',
  )
  console.error('  --pluralName   Display name for UI (e.g., "Categories")')
  process.exit(1)
}

// Derived names
const singular = singularName.toLowerCase()
const plural = singular.endsWith('y')
  ? singular.slice(0, -1) + 'ies'
  : singular + 's'
const PascalSingular = singular.charAt(0).toUpperCase() + singular.slice(1)
const PascalPlural = plural.charAt(0).toUpperCase() + plural.slice(1)
const displayName = pluralDisplayName || PascalPlural

const baseDir = process.cwd()
const srcDir = path.join(baseDir, 'src')

// Templates
const typesTemplate = `export interface ${PascalSingular} {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface ${PascalPlural}Response {
  ${plural}: {
    success: boolean
    message: string
    data: {
      ${plural}: ${PascalSingular}[]
      total: number
      page: number
      perPage: number
    }
  }
}

export interface ${PascalSingular}Response {
  ${singular}: {
    success: boolean
    message: string
    data: ${PascalSingular}
  }
}

export interface Create${PascalSingular}Input {
  name: string
  description?: string
  isActive: boolean
}

export interface Update${PascalSingular}Input {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface Delete${PascalSingular}Response {
  delete${PascalSingular}: {
    success: boolean
    message: string
  }
}
`

const graphqlTemplate = `import { gql } from 'urql'

export const GET_${plural.toUpperCase()}_QUERY = gql\`
  query Get${PascalPlural}(
    $page: Int
    $perPage: Int
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    ${plural}(
      page: $page
      perPage: $perPage
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      success
      message
      data {
        ${plural} {
          id
          name
          description
          isActive
          createdAt
          updatedAt
        }
        total
        page
        perPage
      }
    }
  }
\`

export const GET_${singular.toUpperCase()}_QUERY = gql\`
  query Get${PascalSingular}($id: ID!) {
    ${singular}(id: $id) {
      success
      message
      data {
        id
        name
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
\`

export const CREATE_${singular.toUpperCase()}_MUTATION = gql\`
  mutation Create${PascalSingular}($input: Create${PascalSingular}Input!) {
    create${PascalSingular}(input: $input) {
      success
      message
      data {
        id
        name
      }
    }
  }
\`

export const UPDATE_${singular.toUpperCase()}_MUTATION = gql\`
  mutation Update${PascalSingular}($input: Update${PascalSingular}Input!) {
    update${PascalSingular}(input: $input) {
      success
      message
      data {
        id
        name
      }
    }
  }
\`

export const DELETE_${singular.toUpperCase()}_MUTATION = gql\`
  mutation Delete${PascalSingular}($id: ID!) {
    delete${PascalSingular}(id: $id) {
      success
      message
    }
  }
\`
`

const columnsTemplate = `import { ColumnDef } from '@tanstack/react-table'
import type { ${PascalSingular} } from '@/types/${singular}'
import {
  DataTableActions,
  DataTableAction,
} from '@/components/ui/data-table-actions'
import { Badge } from '@/components/ui/badge'
import { Check, X, Pencil, Trash2, Eye } from 'lucide-react'
import type { TFunction } from 'i18next'
import { formatDateTime } from '@/lib/utils/date'

interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  t: TFunction
}

export const create${PascalSingular}Columns = ({
  onDelete,
  onEdit,
  onView,
  t,
}: ColumnProps): ColumnDef<${PascalSingular}>[] => [
  {
    accessorKey: 'name',
    header: t('${plural}.columns.name', { defaultValue: 'Name' }),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue('name')}</span>
          {row.original.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: t('${plural}.columns.is_active', { defaultValue: 'Active' }),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive')
      return isActive ? (
        <Badge variant="default" className="gap-1">
          <Check className="h-3 w-3" />
          Active
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <X className="h-3 w-3" />
          Inactive
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: t('${plural}.columns.created_at', { defaultValue: 'Created At' }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      return <span className="text-sm">{formatDateTime(timestamp)}</span>
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('${plural}.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const item = row.original

      const actions: DataTableAction<${PascalSingular}>[] = [
        {
          label: t('${plural}.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (item) => onView(item.id),
        },
        { separator: true },
        {
          label: t('${plural}.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (item) => onEdit(item.id),
        },
        {
          label: t('${plural}.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (item) => onDelete(item.id),
          variant: 'destructive',
        },
      ]

      return <DataTableActions item={item} actions={actions} />
    },
  },
]
`

const formTemplate = `import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { Create${PascalSingular}Input, Update${PascalSingular}Input } from '@/types/${singular}'

interface ${PascalSingular}FormProps {
  initialData?: Partial<Create${PascalSingular}Input>
  onSubmit: (
    data: Create${PascalSingular}Input | Update${PascalSingular}Input,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
}

export function ${PascalSingular}Form({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
}: ${PascalSingular}FormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        const success = await onSubmit(value, false)
        if (!success) {
          setIsSubmitting(false)
        }
      } catch (error) {
        setIsSubmitting(false)
        console.error('Form submission error:', error)
      }
    },
  })

  const handleCreateAnother = async () => {
    setIsSubmitting(true)
    try {
      const values = form.state.values
      const success = await onSubmit(values, true)
      if (success) {
        form.reset()
      }
      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      console.error('Form submission error:', error)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Name */}
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            if (!value || value.trim().length === 0) {
              return t('${plural}.form.name_required', {
                defaultValue: 'Name is required',
              })
            }
            if (value.trim().length < 3) {
              return t('${plural}.form.name_min', {
                defaultValue: 'Name must be at least 3 characters',
              })
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel>
              {t('${plural}.form.name', { defaultValue: 'Name' })}{' '}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              type="text"
              placeholder={t('${plural}.form.name_placeholder', {
                defaultValue: 'Enter name',
              })}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('${plural}.form.name_description', {
                defaultValue: 'The display name.',
              })}
            </FieldDescription>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </Field>
        )}
      </form.Field>

      {/* Description */}
      <form.Field name="description">
        {(field) => (
          <Field>
            <FieldLabel>
              {t('${plural}.form.description', {
                defaultValue: 'Description',
              })}
            </FieldLabel>
            <Textarea
              placeholder={t('${plural}.form.description_placeholder', {
                defaultValue: 'Optional description',
              })}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </Field>
        )}
      </form.Field>

      {/* Is Active */}
      <form.Field name="isActive">
        {(field) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(!!checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {t('${plural}.form.is_active', { defaultValue: 'Active' })}
            </Label>
          </div>
        )}
      </form.Field>

      {/* Form Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        {showCreateAnother && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCreateAnother}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('${plural}.form.create_another', {
              defaultValue: 'Save & Create Another',
            })}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('${plural}.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
`

const configTemplate = `import type { CrudConfig, CrudTranslations } from '@/types'
import type { ${PascalSingular}, Create${PascalSingular}Input, Update${PascalSingular}Input } from '@/types/${singular}'

import {
  GET_${plural.toUpperCase()}_QUERY,
  GET_${singular.toUpperCase()}_QUERY,
  CREATE_${singular.toUpperCase()}_MUTATION,
  UPDATE_${singular.toUpperCase()}_MUTATION,
  DELETE_${singular.toUpperCase()}_MUTATION,
} from '@/lib/graphql/${singular}.graphql'

import { create${PascalSingular}Columns } from '@/components/features/admin/${plural}/${singular}-columns'
import { ${PascalSingular}Form } from '@/components/features/admin/${plural}/${singular}-form'

export const ${plural}Config: CrudConfig<
  ${PascalSingular},
  Create${PascalSingular}Input,
  Update${PascalSingular}Input
> = {
  resourceName: '${plural}',
  dataKey: '${plural}',
  basePath: '/admin/${plural}',

  queries: {
    list: GET_${plural.toUpperCase()}_QUERY,
    get: GET_${singular.toUpperCase()}_QUERY,
    create: CREATE_${singular.toUpperCase()}_MUTATION,
    update: UPDATE_${singular.toUpperCase()}_MUTATION,
    delete: DELETE_${singular.toUpperCase()}_MUTATION,
  },

  createColumns: create${PascalSingular}Columns,
  FormComponent: ${PascalSingular}Form,

  translations: {
    title: '${displayName}',
    searchPlaceholder: 'Search ${plural}...',
    createButton: 'Create ${singular}',
    failedToLoad: 'Failed to load ${plural}',
    createTitle: 'Create ${PascalSingular}',
    createDescription: 'Create a new ${singular}',
    editTitle: 'Edit ${PascalSingular}',
    editDescription: 'Update ${singular} details',
    deleteTitle: 'Delete ${PascalSingular}?',
    deleteDescription: 'This will permanently delete the ${singular}',
    deleteConfirm: 'Delete',
    createdSuccess: '${PascalSingular} created successfully!',
    updatedSuccess: '${PascalSingular} updated successfully!',
  } as Partial<CrudTranslations>,

  defaultSort: { field: 'created_at', order: 'desc' },
  searchColumn: 'name',
  skeletonColumns: 4,
}

export function transform${PascalSingular}ToFormData(
  item: ${PascalSingular},
): Partial<Create${PascalSingular}Input> {
  return {
    name: item.name,
    description: item.description || undefined,
    isActive: item.isActive,
  }
}
`

const indexRouteTemplate = `import { createFileRoute } from '@tanstack/react-router'
import { CrudListPage } from '@/components/crud'
import { ${plural}Config } from '@/features/${plural}'
import type { ${PascalSingular} } from '@/types/${singular}'

export const Route = createFileRoute('/admin/${plural}/')({
  component: ${PascalPlural}Page,
})

function ${PascalPlural}Page() {
  return <CrudListPage<${PascalSingular}> config={${plural}Config} />
}
`

const createRouteTemplate = `import { createFileRoute } from '@tanstack/react-router'
import { CrudCreatePage } from '@/components/crud'
import { ${plural}Config } from '@/features/${plural}'
import type { ${PascalSingular}, Create${PascalSingular}Input, Update${PascalSingular}Input } from '@/types/${singular}'

export const Route = createFileRoute('/admin/${plural}/create')({
  component: Create${PascalSingular}Page,
})

function Create${PascalSingular}Page() {
  return (
    <CrudCreatePage<${PascalSingular}, Create${PascalSingular}Input, Update${PascalSingular}Input>
      config={${plural}Config}
    />
  )
}
`

const editRouteTemplate = `import { createFileRoute } from '@tanstack/react-router'
import { CrudEditPage } from '@/components/crud'
import { ${plural}Config, transform${PascalSingular}ToFormData } from '@/features/${plural}'
import type { ${PascalSingular}, Create${PascalSingular}Input, Update${PascalSingular}Input } from '@/types/${singular}'

export const Route = createFileRoute('/admin/${plural}/$id/edit')({
  component: Edit${PascalSingular}Page,
})

function Edit${PascalSingular}Page() {
  return (
    <CrudEditPage<${PascalSingular}, Create${PascalSingular}Input, Update${PascalSingular}Input>
      config={${plural}Config}
      routePath="/admin/${plural}/$id/edit"
      transformToFormData={transform${PascalSingular}ToFormData}
    />
  )
}
`

const featureIndexTemplate = `export { ${plural}Config, transform${PascalSingular}ToFormData } from './config'
`

// Helper function to create directory
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`  Created directory: ${dir}`)
  }
}

// Helper function to write file
function writeFile(filePath: string, content: string) {
  fs.writeFileSync(filePath, content)
  console.log(`  Created file: ${filePath}`)
}

// Generate files
console.log(`\nGenerating CRUD files for "${singular}" (${plural})...\n`)

// Types
const typesDir = path.join(srcDir, 'types')
writeFile(path.join(typesDir, `${singular}.ts`), typesTemplate)

// GraphQL
const graphqlDir = path.join(srcDir, 'lib/graphql')
writeFile(path.join(graphqlDir, `${singular}.graphql.ts`), graphqlTemplate)

// Features
const featuresDir = path.join(srcDir, 'features', plural)
ensureDir(featuresDir)
writeFile(path.join(featuresDir, 'config.ts'), configTemplate)
writeFile(path.join(featuresDir, 'index.ts'), featureIndexTemplate)

// Components
const componentsDir = path.join(srcDir, 'components/features/admin', plural)
ensureDir(componentsDir)
writeFile(path.join(componentsDir, `${singular}-columns.tsx`), columnsTemplate)
writeFile(path.join(componentsDir, `${singular}-form.tsx`), formTemplate)
writeFile(
  path.join(componentsDir, 'index.ts'),
  `export * from './${singular}-columns'\nexport * from './${singular}-form'\n`,
)

// Routes
const routesDir = path.join(srcDir, 'routes/admin', plural)
ensureDir(routesDir)
writeFile(path.join(routesDir, 'index.tsx'), indexRouteTemplate)
writeFile(path.join(routesDir, 'create.tsx'), createRouteTemplate)

const routeIdDir = path.join(routesDir, '$id')
ensureDir(routeIdDir)
writeFile(path.join(routeIdDir, 'edit.tsx'), editRouteTemplate)

console.log(`
✅ CRUD files generated successfully!

Next steps:
1. Add export to src/types/index.ts:
   export * from './${singular}'

2. Run route generation:
   npm run generate-routes

3. Add menu item to sidebar (if needed)

4. Implement backend GraphQL resolvers for:
   - ${plural} (query)
   - ${singular} (query)
   - create${PascalSingular} (mutation)
   - update${PascalSingular} (mutation)
   - delete${PascalSingular} (mutation)
`)
