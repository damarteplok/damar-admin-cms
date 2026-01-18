import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'

import {
  GET_PERMISSIONS_QUERY,
  DELETE_PERMISSION_MUTATION,
} from '@/lib/graphql/rbac.graphql'
import type {
  PermissionsResponse,
  DeletePermissionResponse,
  Permission,
} from '@/types'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

import { createPermissionColumns } from '@/components/features/admin/permissions'

export const Route = createFileRoute('/admin/permissions/')({
  component: PermissionsPage,
})

function PermissionsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] =
    useState<Permission | null>(null)

  const [result] = useQuery<PermissionsResponse>({
    query: GET_PERMISSIONS_QUERY,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deletePermissionMutation] = useMutation<DeletePermissionResponse>(
    DELETE_PERMISSION_MUTATION,
  )

  const { data: queryData, fetching, error } = result
  const isInitialLoad = fetching && !queryData

  const handleAddPermission = () => {
    navigate({ to: '/admin/permissions/create' })
  }

  const handleViewPermission = (id: string) => {
    navigate({ to: `/admin/permissions/${id}` })
  }

  const handleEditPermission = (id: string) => {
    navigate({ to: `/admin/permissions/${id}/edit` })
  }

  const handleDeletePermission = (id: string) => {
    const permission = queryData?.permissions.data.permissions.find(
      (p) => p.id === id,
    )
    if (permission) {
      setPermissionToDelete(permission)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeletePermission = async () => {
    if (!permissionToDelete) return

    const result = await deletePermissionMutation({ id: permissionToDelete.id })

    if (result.data?.deletePermission.success) {
      setDeleteDialogOpen(false)
      setPermissionToDelete(null)
      window.location.reload()
    } else {
      alert(
        result.data?.deletePermission.message || 'Failed to delete permission',
      )
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
      createPermissionColumns({
        onView: handleViewPermission,
        onEdit: handleEditPermission,
        onDelete: handleDeletePermission,
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
        columns={4}
      />
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title={t('permissions.failed_to_load', {
          defaultValue: 'Failed to load permissions',
        })}
        description={
          error.message ||
          t('permissions.error_occurred', {
            defaultValue:
              'An error occurred while fetching permissions. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response
  if (!queryData?.permissions.success || !queryData?.permissions.data) {
    return (
      <ErrorState
        title={t('permissions.failed_to_load', {
          defaultValue: 'Failed to load permissions',
        })}
        description={
          queryData?.permissions.message ||
          t('permissions.unable_to_fetch', {
            defaultValue: 'Unable to fetch permissions data.',
          })
        }
      />
    )
  }

  const permissions = queryData.permissions.data.permissions
  const totalPages = queryData?.permissions.data
    ? Math.ceil(queryData.permissions.data.total / perPage)
    : 0

  return (
    <div className="space-y-4">
      <DataTable
        title={t('permissions.title', { defaultValue: 'Permissions' })}
        columns={columns}
        data={permissions}
        searchColumn="name"
        searchPlaceholder={t('permissions.search_placeholder', {
          defaultValue: 'Search permissions...',
        })}
        canAdd={true}
        addButtonTitle={t('permissions.create_button', {
          defaultValue: 'Create permission',
        })}
        onAddClick={handleAddPermission}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={queryData?.permissions.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeletePermission}
        title={t('permissions.delete_title', {
          defaultValue: 'Delete Permission?',
        })}
        description={
          <>
            {t('permissions.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the permission',
            })}{' '}
            <span className="font-semibold">{permissionToDelete?.name}</span>.
          </>
        }
        confirmText={t('permissions.delete_button', { defaultValue: 'Delete' })}
        variant="destructive"
      />
    </div>
  )
}
