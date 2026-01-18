import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import type { ColumnFactoryProps, CrudConfig } from '@/types'
import { useCrudTable } from '@/hooks/crud'
import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'


interface CrudListPageProps<
  TModel extends { id: string; name?: string },
  TCreateInput = unknown,
  TUpdateInput = unknown,
> {
  config: CrudConfig<TModel, TCreateInput, TUpdateInput>
}

/**
 * Generic CRUD List Page Component
 * Handles data fetching, pagination, sorting, search, and delete operations
 *
 * @example
 * ```tsx
 * export function DiscountsPage() {
 *   return <CrudListPage config={discountsConfig} />
 * }
 * ```
 */
export function CrudListPage<
  TModel extends { id: string; name?: string },
  TCreateInput = unknown,
  TUpdateInput = unknown,
>({ config }: CrudListPageProps<TModel, TCreateInput, TUpdateInput>) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const {
    data,
    fetching,
    error,
    isInitialLoad,
    querySuccess,
    queryMessage,
    page,
    perPage,
    setPerPage,
    totalPages,
    total,
    deleteDialogOpen,
    itemToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    handlePageChange,
    handleSortChange,
    setSearch,
  } = useCrudTable<TModel>({
    listQuery: config.queries.list,
    deleteMutation: config.queries.delete,
    dataKey: config.dataKey,
    itemsKey: config.dataKey,
    defaultSort: config.defaultSort,
    extraVariables: config.listQueryVariables,
  })

  // Navigation handlers
  const handleAdd = () => {
    navigate({ to: `${config.basePath}/create` })
  }

  const handleView = (id: string) => {
    navigate({ to: `${config.basePath}/${id}` })
  }

  const handleEdit = (id: string) => {
    navigate({ to: `${config.basePath}/${id}/edit` })
  }

  const handleDelete = (id: string) => {
    const item = data.find((d) => d.id === id)
    if (item) {
      openDeleteDialog(item)
    }
  }

  // Create columns with memoization
  const columnProps: ColumnFactoryProps = {
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    t,
  }

  const columns = useMemo(
    () => config.createColumns(columnProps),
    [t, config.createColumns],
  )

  // Get translated strings with fallbacks
  const translations = config.translations
  const resourceName = config.resourceName

  // Loading state
  if (isInitialLoad) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={config.skeletonColumns ?? 7}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={
          translations.failedToLoad ||
          t(`${resourceName}.failed_to_load`, {
            defaultValue: 'Failed to load data',
          })
        }
        description={
          error.message ||
          translations.errorOccurred ||
          t(`${resourceName}.error_occurred`, {
            defaultValue: 'An error occurred. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response
  if (!querySuccess) {
    return (
      <ErrorState
        title={
          translations.failedToLoad ||
          t(`${resourceName}.failed_to_load`, {
            defaultValue: 'Failed to load data',
          })
        }
        description={
          queryMessage ||
          translations.unableToFetch ||
          t(`${resourceName}.unable_to_fetch`, {
            defaultValue: 'Unable to fetch data.',
          })
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <DataTable
        title={
          translations.title ||
          t(`${resourceName}.title`, { defaultValue: resourceName })
        }
        columns={columns}
        data={data}
        searchColumn={config.searchColumn ?? 'name'}
        searchPlaceholder={t(`${resourceName}.search_placeholder`, {
          defaultValue: translations.searchPlaceholder || 'Search...',
        })}
        canAdd={true}
        addButtonTitle={t(`${resourceName}.create_button`, {
          defaultValue: translations.createButton || 'Create',
        })}
        onAddClick={handleAdd}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        onConfirm={confirmDelete}
        title={
          translations.deleteTitle ||
          t(`${resourceName}.delete_title`, {
            defaultValue: 'Delete item?',
          })
        }
        description={
          <>
            {translations.deleteDescription ||
              t(`${resourceName}.delete_description`, {
                defaultValue:
                  'This action cannot be undone. This will permanently delete',
              })}
            {itemToDelete && 'name' in itemToDelete && (
              <>
                {' '}
                <span className="font-semibold">
                  {(itemToDelete as { name?: string }).name}
                </span>
              </>
            )}
            .
          </>
        }
        confirmText={
          translations.deleteConfirm ||
          t(`${resourceName}.delete_button`, {
            defaultValue: 'Delete',
          })
        }
        variant="destructive"
      />
    </div>
  )
}
