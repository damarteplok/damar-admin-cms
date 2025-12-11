import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState, useEffect } from 'react'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'

import {
  GET_PLANS_QUERY,
  DELETE_PLAN_MUTATION,
} from '@/lib/graphql/plan.graphql'
import type { PlansResponse, DeletePlanResponse, Plan } from '@/types'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

import { createPlanColumns } from '@/components/features/admin/plans'

export const Route = createFileRoute('/admin/plans/')({
  component: PlansPage,
})

function PlansPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)

  const [result] = useQuery<PlansResponse>({
    query: GET_PLANS_QUERY,
    variables: {
      page,
      perPage,
      activeOnly: false,
      visibleOnly: false,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deletePlanMutation] =
    useMutation<DeletePlanResponse>(DELETE_PLAN_MUTATION)

  const { data: queryData, fetching, error } = result
  const isInitialLoad = fetching && !queryData

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setPage(1)
  }, [search, sortBy, sortOrder])

  const handleAddPlan = () => {
    navigate({ to: '/admin/plans/create' })
  }

  const handleViewPlan = (id: string) => {
    navigate({ to: `/admin/plans/${id}` })
  }

  const handleEditPlan = (id: string) => {
    navigate({ to: `/admin/plans/${id}/edit` })
  }

  const handleDeletePlan = (id: string) => {
    const plan = queryData?.plans.data.plans.find((p) => p.id === id)
    if (plan) {
      setPlanToDelete(plan)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeletePlan = async () => {
    if (!planToDelete) return

    const result = await deletePlanMutation({ id: planToDelete.id })

    if (result.data?.deletePlan.success) {
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
      window.location.reload()
    } else {
      alert(result.data?.deletePlan.message || 'Failed to delete plan')
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
      createPlanColumns({
        onView: handleViewPlan,
        onEdit: handleEditPlan,
        onDelete: handleDeletePlan,
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
        columns={8}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={t('plans.failed_to_load', {
          defaultValue: 'Failed to load plans',
        })}
        description={
          error.message ||
          t('plans.error_occurred', {
            defaultValue:
              'An error occurred while fetching plans. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response
  if (!queryData?.plans.success || !queryData?.plans.data) {
    return (
      <ErrorState
        title={t('plans.failed_to_load', {
          defaultValue: 'Failed to load plans',
        })}
        description={
          queryData?.plans.message ||
          t('plans.unable_to_fetch', {
            defaultValue: 'Unable to fetch plans data.',
          })
        }
      />
    )
  }

  const plans = queryData.plans.data.plans

  const totalPages = queryData?.plans.data
    ? Math.ceil(queryData.plans.data.total / perPage)
    : 0

  return (
    <div className="space-y-4">
      <DataTable
        title={t('plans.title', { defaultValue: 'Plans' })}
        columns={columns}
        data={plans}
        searchColumn="name"
        searchPlaceholder={t('plans.search_placeholder', {
          defaultValue: 'Search plans...',
        })}
        canAdd={true}
        addButtonTitle={t('plans.create_button', {
          defaultValue: 'Create plan',
        })}
        onAddClick={handleAddPlan}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={queryData?.plans.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeletePlan}
        title={t('plans.delete_title', {
          defaultValue: 'Delete Plan?',
        })}
        description={
          <>
            {t('plans.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the plan',
            })}
            {planToDelete && (
              <>
                {' '}
                <span className="font-semibold">{planToDelete.name}</span>
              </>
            )}{' '}
            {t('plans.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('plans.delete_button', {
          defaultValue: 'Delete',
        })}
        variant="destructive"
      />
    </div>
  )
}
