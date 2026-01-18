import type { DocumentNode } from 'graphql'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import type { ComponentType } from 'react'

/**
 * Standard API response wrapper used across all CRUD operations
 */
export interface CrudApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

/**
 * Paginated list response from GraphQL queries
 */
export interface CrudPaginatedData<T> {
  items: Array<T>
  total: number
  page: number
  perPage: number
}

/**
 * CRUD column factory function type
 */
export interface ColumnFactoryProps {
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  t: TFunction
}

export type ColumnFactory<T> = (
  props: ColumnFactoryProps,
) => Array<ColumnDef<T>>

/**
 * Form component props interface for create/edit forms
 */
export interface CrudFormProps<TCreate, TUpdate = TCreate & { id: string }> {
  initialData?: Partial<TCreate>
  onSubmit: (
    data: TCreate | TUpdate,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
}

export type CrudFormComponent<
  TCreate,
  TUpdate = TCreate & { id: string },
> = ComponentType<CrudFormProps<TCreate, TUpdate>>

/**
 * State for list page table
 */
export interface CrudTableState {
  page: number
  perPage: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

/**
 * Delete dialog state
 */
export interface DeleteDialogState<T> {
  isOpen: boolean
  item: T | null
}

/**
 * Translations configuration for CRUD pages
 */
export interface CrudTranslations {
  // List page
  title: string
  searchPlaceholder: string
  createButton: string
  failedToLoad: string
  errorOccurred: string
  unableToFetch: string

  // Delete confirmation
  deleteTitle: string
  deleteDescription: string
  deleteConfirm: string

  // Create page
  createTitle: string
  createDescription: string

  // Edit page
  editTitle: string
  editDescription: string

  // View/Detail page
  viewTitle: string
  viewDescription: string
  notFound: string
  loadFailed: string

  // Toast messages
  createdSuccess: string
  createdAnother: string
  createFailed: string
  updatedSuccess: string
  updateFailed: string
  deletedSuccess: string
  deleteFailed: string
}

/**
 * GraphQL queries/mutations configuration for a CRUD resource
 */
export interface CrudQueries {
  list: DocumentNode
  get: DocumentNode
  create: DocumentNode
  update: DocumentNode
  delete: DocumentNode
  /** Key in GraphQL response for get query (e.g., 'tenant' for query { tenant { ... } }) */
  getKey?: string
  /** Key in GraphQL response for create mutation (e.g., 'createTenant') */
  createKey?: string
  /** Key in GraphQL response for update mutation (e.g., 'updateTenant') */
  updateKey?: string
  /** Key in GraphQL response for delete mutation (e.g., 'deleteTenant') */
  deleteKey?: string
}

/**
 * Main CRUD configuration for a resource
 */
export interface CrudConfig<
  TModel extends { id: string },
  TCreateInput = Omit<TModel, 'id' | 'createdAt' | 'updatedAt'>,
  TUpdateInput = TCreateInput & { id: string },
> {
  /** Resource name (e.g., 'discounts', 'products') */
  resourceName: string

  /** Data key in GraphQL response (e.g., 'discounts' for discounts.data.discounts) */
  dataKey: string

  /** Base path for routes (e.g., '/admin/discounts') */
  basePath: string

  /** GraphQL queries and mutations */
  queries: CrudQueries

  /** Column definitions factory */
  createColumns: ColumnFactory<TModel>

  /** Form component for create/edit */
  FormComponent: CrudFormComponent<TCreateInput, TUpdateInput>

  /** Optional: Detail component for view page */
  DetailComponent?: ComponentType<{ data: TModel }>

  /** Translation keys (will be prefixed with resourceName) */
  translations: Partial<CrudTranslations>

  /** Default sort configuration */
  defaultSort?: {
    field: string
    order: 'asc' | 'desc'
  }

  /** Search column for DataTable */
  searchColumn?: string

  /** Number of columns for skeleton loader */
  skeletonColumns?: number

  /** Extra variables for list query */
  listQueryVariables?: Record<string, unknown>
}

/**
 * Hook configuration for useCrudTable
 */
export interface UseCrudTableConfig {
  listQuery: DocumentNode
  deleteQuery: DocumentNode
  dataKey: string
  itemsKey?: string
  defaultSort?: { field: string; order: 'asc' | 'desc' }
  listQueryVariables?: Record<string, unknown>
}

/**
 * Hook return type for useCrudTable
 */
export interface UseCrudTableReturn<TModel extends { id: string }> {
  // State
  page: number
  perPage: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'

  // Data
  data: Array<TModel>
  total: number
  totalPages: number
  fetching: boolean
  error: Error | null
  isInitialLoad: boolean
  querySuccess: boolean
  queryMessage: string

  // Setters
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  setSearch: (search: string) => void
  setSortBy: (sortBy: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void

  // Delete dialog
  deleteDialogOpen: boolean
  itemToDelete: TModel | null
  openDeleteDialog: (item: TModel) => void
  closeDeleteDialog: () => void
  confirmDelete: () => Promise<boolean>

  // Handlers
  handlePageChange: (page: number) => void
  handleSortChange: (columnId: string, order: 'asc' | 'desc') => void
}

/**
 * Hook configuration for useCrudForm
 */
export interface UseCrudFormConfig {
  mutation: DocumentNode
  mutationKey: string
  onSuccess?: () => void
  successMessage?: string
  errorMessage?: string
}

/**
 * Hook return type for useCrudForm
 */
export interface UseCrudFormReturn<TInput> {
  handleSubmit: (data: TInput, createAnother?: boolean) => Promise<boolean>
  isSubmitting: boolean
}
