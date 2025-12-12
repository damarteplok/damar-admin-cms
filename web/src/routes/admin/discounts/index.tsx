import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'

import {
  GET_DISCOUNTS_QUERY,
  DELETE_DISCOUNT_MUTATION,
} from '@/lib/graphql/discount.graphql'
import type {
  DiscountsResponse,
  DeleteDiscountResponse,
  Discount,
} from '@/types'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

import { createDiscountColumns } from '@/components/features/admin/discounts'

export const Route = createFileRoute('/admin/discounts/')({
  component: DiscountsPage,
})

function DiscountsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeOnly] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(
    null,
  )

  const [result] = useQuery<DiscountsResponse>({
    query: GET_DISCOUNTS_QUERY,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      activeOnly: activeOnly || undefined,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteDiscountMutation] = useMutation<DeleteDiscountResponse>(
    DELETE_DISCOUNT_MUTATION,
  )

  const { data: queryData, fetching, error } = result
  const isInitialLoad = fetching && !queryData

  const handleAddDiscount = () => {
    navigate({ to: '/admin/discounts/create' })
  }

  const handleViewDiscount = (id: string) => {
    navigate({ to: `/admin/discounts/${id}` })
  }

  const handleEditDiscount = (id: string) => {
    navigate({ to: `/admin/discounts/${id}/edit` })
  }

  const handleDeleteDiscount = (id: string) => {
    const discount = queryData?.discounts.data.discounts.find(
      (d) => d.id === id,
    )
    if (discount) {
      setDiscountToDelete(discount)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteDiscount = async () => {
    if (!discountToDelete) return

    const result = await deleteDiscountMutation({ id: discountToDelete.id })

    if (result.data?.deleteDiscount.success) {
      setDeleteDialogOpen(false)
      setDiscountToDelete(null)
      // Refetch will happen automatically via URQL cache or page reload
      window.location.reload()
    } else {
      alert(result.data?.deleteDiscount.message || 'Failed to delete discount')
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSortChange = (columnId: string, order: 'asc' | 'desc') => {
    setSortBy(columnId)
    setSortOrder(order)
  }

  const columns = useMemo(
    () =>
      createDiscountColumns({
        onView: handleViewDiscount,
        onEdit: handleEditDiscount,
        onDelete: handleDeleteDiscount,
        t,
      }),
    [t],
  )

  // Loading state
  if (isInitialLoad) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={7}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={t('discounts.failed_to_load', {
          defaultValue: 'Failed to load discounts',
        })}
        description={
          error.message ||
          t('discounts.error_occurred', {
            defaultValue:
              'An error occurred while fetching discounts. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response
  if (!queryData?.discounts.success || !queryData?.discounts.data) {
    return (
      <ErrorState
        title={t('discounts.failed_to_load', {
          defaultValue: 'Failed to load discounts',
        })}
        description={
          queryData?.discounts.message ||
          t('discounts.unable_to_fetch', {
            defaultValue: 'Unable to fetch discounts data.',
          })
        }
      />
    )
  }

  const discounts = queryData.discounts.data.discounts

  const totalPages = queryData?.discounts.data
    ? Math.ceil(queryData.discounts.data.total / perPage)
    : 0

  return (
    <div className="space-y-4">
      <DataTable
        title={t('discounts.title', { defaultValue: 'Discounts' })}
        columns={columns}
        data={discounts}
        searchColumn="name"
        searchPlaceholder={t('discounts.search_placeholder', {
          defaultValue: 'Search discounts...',
        })}
        canAdd={true}
        addButtonTitle={t('discounts.create_button', {
          defaultValue: 'Create discount',
        })}
        onAddClick={handleAddDiscount}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={queryData?.discounts.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteDiscount}
        title={t('discounts.delete_title', {
          defaultValue: 'Delete Discount?',
        })}
        description={
          <>
            {t('discounts.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the discount',
            })}
            {discountToDelete && (
              <>
                {' '}
                <span className="font-semibold">{discountToDelete.name}</span>
              </>
            )}{' '}
            {t('discounts.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('discounts.delete_button', {
          defaultValue: 'Delete',
        })}
        variant="destructive"
      />
    </div>
  )
}
