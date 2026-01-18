import { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'urql'
import type { DocumentNode } from 'graphql'

export interface UseCrudTableOptions {
  /** GraphQL query document for fetching list */
  listQuery: DocumentNode
  /** GraphQL mutation document for deleting item */
  deleteMutation: DocumentNode
  /** Key in the GraphQL response (e.g., 'discounts' for query { discounts { ... } }) */
  dataKey: string
  /** Key for items array inside data (e.g., 'discounts' for data.discounts) */
  itemsKey?: string
  /** Default sort configuration */
  defaultSort?: { field: string; order: 'asc' | 'desc' }
  /** Additional query variables */
  extraVariables?: Record<string, unknown>
  /** Callback after successful delete */
  onDeleteSuccess?: () => void
}

export interface UseCrudTableReturn<TModel extends { id: string }> {
  // Pagination state
  page: number
  perPage: number
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void

  // Search state
  search: string
  setSearch: (search: string) => void

  // Sort state
  sortBy: string
  sortOrder: 'asc' | 'desc'
  setSortBy: (sortBy: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void

  // Data
  data: Array<TModel>
  total: number
  totalPages: number
  fetching: boolean
  error: Error | null
  isInitialLoad: boolean
  querySuccess: boolean
  queryMessage: string

  // Delete dialog
  deleteDialogOpen: boolean
  itemToDelete: TModel | null
  openDeleteDialog: (item: TModel) => void
  closeDeleteDialog: () => void
  confirmDelete: () => Promise<boolean>

  // Handlers for DataTable
  handlePageChange: (page: number) => void
  handleSortChange: (columnId: string, order: 'asc' | 'desc') => void
}

/**
 * Generic hook for CRUD list page state management
 * Handles pagination, sorting, search, and delete operations
 *
 * @example
 * ```tsx
 * const {
 *   data, fetching, error,
 *   page, perPage, handlePageChange,
 *   deleteDialogOpen, confirmDelete,
 *   ...rest
 * } = useCrudTable<Discount>({
 *   listQuery: GET_DISCOUNTS_QUERY,
 *   deleteMutation: DELETE_DISCOUNT_MUTATION,
 *   dataKey: 'discounts',
 *   itemsKey: 'discounts',
 * })
 * ```
 */
export function useCrudTable<TModel extends { id: string }>(
  options: UseCrudTableOptions,
): UseCrudTableReturn<TModel> {
  const {
    listQuery,
    deleteMutation,
    dataKey,
    itemsKey,
    defaultSort = { field: 'created_at', order: 'desc' },
    extraVariables = {},
    onDeleteSuccess,
  } = options

  // Pagination state
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Search state
  const [search, setSearch] = useState('')

  // Sort state
  const [sortBy, setSortBy] = useState(defaultSort.field)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSort.order)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<TModel | null>(null)

  // GraphQL query
  const [result] = useQuery({
    query: listQuery,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      ...extraVariables,
    },
    requestPolicy: 'cache-and-network',
  })

  // GraphQL delete mutation
  const [, executeDelete] = useMutation(deleteMutation)

  // Extract data from query result
  const queryData = result.data?.[dataKey]
  const items = itemsKey
    ? (queryData?.data?.[itemsKey] ?? [])
    : (queryData?.data?.items ?? queryData?.data ?? [])
  const total = queryData?.data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)
  const isInitialLoad = result.fetching && !result.data

  // Delete handlers
  const openDeleteDialog = useCallback((item: TModel) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }, [])

  const confirmDelete = useCallback(async (): Promise<boolean> => {
    if (!itemToDelete) return false

    const mutationResult = await executeDelete({ id: itemToDelete.id })

    // Extract success from mutation response (handles various response shapes)
    const mutationData = mutationResult.data
    const keys = mutationData ? Object.keys(mutationData) : []
    const responseKey = keys[0]
    const success = responseKey ? mutationData[responseKey]?.success : false

    if (success) {
      closeDeleteDialog()
      onDeleteSuccess?.()
      // Trigger page reload to refresh data
      window.location.reload()
      return true
    }

    return false
  }, [itemToDelete, executeDelete, closeDeleteDialog, onDeleteSuccess])

  // DataTable handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleSortChange = useCallback(
    (columnId: string, order: 'asc' | 'desc') => {
      setSortBy(columnId)
      setSortOrder(order)
    },
    [],
  )

  return {
    // Pagination
    page,
    perPage,
    setPage,
    setPerPage,

    // Search
    search,
    setSearch,

    // Sort
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,

    // Data
    data: items as Array<TModel>,
    total,
    totalPages,
    fetching: result.fetching,
    error: result.error ?? null,
    isInitialLoad,
    querySuccess: queryData?.success ?? false,
    queryMessage: queryData?.message ?? '',

    // Delete dialog
    deleteDialogOpen,
    itemToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,

    // Handlers
    handlePageChange,
    handleSortChange,
  }
}
