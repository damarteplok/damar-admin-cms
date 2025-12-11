import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'

import {
  GET_TENANTS_QUERY,
  DELETE_TENANT_MUTATION,
} from '@/lib/graphql/tenant.graphql'
import type { TenantsResponse, DeleteTenantResponse, Tenant } from '@/types'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

import { createWorkspaceColumns } from '@/components/features/admin/workspaces'

export const Route = createFileRoute('/admin/workspaces/')({
  component: WorkspacesPage,
})

function WorkspacesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Tenant | null>(
    null,
  )

  const [result] = useQuery<TenantsResponse>({
    query: GET_TENANTS_QUERY,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy,
      sortOrder,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteTenantMutation] = useMutation<DeleteTenantResponse>(
    DELETE_TENANT_MUTATION,
  )

  const { data: queryData, fetching, error } = result
  const isInitialLoad = fetching && !queryData

  const handleAddWorkspace = () => {
    navigate({ to: '/admin/workspaces/create' })
  }

  const handleViewWorkspace = (id: string) => {
    navigate({ to: `/admin/workspaces/${id}` })
  }

  const handleEditWorkspace = (id: string) => {
    navigate({ to: `/admin/workspaces/${id}/edit` })
  }

  const handleDeleteWorkspace = (id: string) => {
    const workspace = queryData?.tenants.data.tenants.find((t) => t.id === id)
    if (workspace) {
      setWorkspaceToDelete(workspace)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteWorkspace = async () => {
    if (!workspaceToDelete) return

    const result = await deleteTenantMutation({ id: workspaceToDelete.id })

    if (result.data?.deleteTenant.success) {
      setDeleteDialogOpen(false)
      setWorkspaceToDelete(null)
      // Refetch will happen automatically via URQL cache
      window.location.reload()
    } else {
      alert(result.data?.deleteTenant.message || 'Failed to delete workspace')
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
      createWorkspaceColumns({
        onView: handleViewWorkspace,
        onEdit: handleEditWorkspace,
        onDelete: handleDeleteWorkspace,
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
        columns={5}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={t('workspaces.failed_to_load', {
          defaultValue: 'Failed to load workspaces',
        })}
        description={
          error.message ||
          t('workspaces.error_occurred', {
            defaultValue:
              'An error occurred while fetching workspaces. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response
  if (!queryData?.tenants.success || !queryData?.tenants.data) {
    return (
      <ErrorState
        title={t('workspaces.failed_to_load', {
          defaultValue: 'Failed to load workspaces',
        })}
        description={
          queryData?.tenants.message ||
          t('workspaces.unable_to_fetch', {
            defaultValue: 'Unable to fetch workspaces data.',
          })
        }
      />
    )
  }

  const tenants = queryData.tenants.data.tenants

  const totalPages = queryData?.tenants.data
    ? Math.ceil(queryData.tenants.data.total / perPage)
    : 0

  return (
    <div className="space-y-4">
      <DataTable
        title={t('workspaces.title', { defaultValue: 'Workspaces' })}
        columns={columns}
        data={tenants}
        searchColumn="name"
        searchPlaceholder={t('workspaces.search_placeholder', {
          defaultValue: 'Search workspaces...',
        })}
        canAdd={true}
        addButtonTitle={t('workspaces.create_button', {
          defaultValue: 'Create workspace',
        })}
        onAddClick={handleAddWorkspace}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={queryData?.tenants.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteWorkspace}
        title={t('workspaces.delete_title', {
          defaultValue: 'Delete Workspace?',
        })}
        description={
          <>
            {t('workspaces.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the workspace',
            })}
            {workspaceToDelete && (
              <>
                {' '}
                <span className="font-semibold">{workspaceToDelete.name}</span>
              </>
            )}{' '}
            {t('workspaces.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('workspaces.delete_button', {
          defaultValue: 'Delete',
        })}
        variant="destructive"
      />
    </div>
  )
}
