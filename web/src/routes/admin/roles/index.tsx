import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'

import type { DeleteRoleResponse, Role, RolesResponse } from '@/types'
import {
  DELETE_ROLE_MUTATION,
  GET_ROLES_QUERY,
} from '@/lib/graphql/rbac.graphql'

import { DataTable } from '@/components/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

import { createRoleColumns } from '@/components/features/admin/roles'

export const Route = createFileRoute('/admin/roles/')({
  component: RolesPage,
})

function RolesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const [result] = useQuery<RolesResponse>({
    query: GET_ROLES_QUERY,
    variables: {
      page,
      perPage,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteRoleMutation] =
    useMutation<DeleteRoleResponse>(DELETE_ROLE_MUTATION)

  const { data: queryData, fetching, error } = result
  const isInitialLoad = fetching && !queryData

  const handleAddRole = () => {
    navigate({ to: '/admin/roles/create' })
  }

  const handleViewRole = (id: string) => {
    navigate({ to: `/admin/roles/${id}` })
  }

  const handleEditRole = (id: string) => {
    navigate({ to: `/admin/roles/${id}/edit` })
  }

  const handleManagePermissions = (id: string) => {
    navigate({ to: `/admin/roles/${id}/permissions` })
  }

  const handleDeleteRole = (id: string) => {
    const role = queryData?.roles.data.roles.find((r) => r.id === id)
    if (role) {
      setRoleToDelete(role)
      setDeleteDialogOpen(true)
    }
  }

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return

    const result = await deleteRoleMutation({ id: roleToDelete.id })

    if (result.data?.deleteRole.success) {
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
      window.location.reload()
    } else {
      alert(result.data?.deleteRole.message || 'Failed to delete role')
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
      createRoleColumns({
        onView: handleViewRole,
        onEdit: handleEditRole,
        onDelete: handleDeleteRole,
        onManagePermissions: handleManagePermissions,
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
        title={t('roles.failed_to_load', {
          defaultValue: 'Failed to load roles',
        })}
        description={
          error.message ||
          t('roles.error_occurred', {
            defaultValue:
              'An error occurred while fetching roles. Please try again.',
          })
        }
      />
    )
  }

  // Empty or error response
  if (!queryData?.roles.success || !queryData?.roles.data) {
    return (
      <ErrorState
        title={t('roles.failed_to_load', {
          defaultValue: 'Failed to load roles',
        })}
        description={
          queryData?.roles.message ||
          t('roles.unable_to_fetch', {
            defaultValue: 'Unable to fetch roles data.',
          })
        }
      />
    )
  }

  const roles = queryData.roles.data.roles
  const totalPages = queryData?.roles.data
    ? Math.ceil(queryData.roles.data.total / perPage)
    : 0

  return (
    <div className="space-y-4">
      <DataTable
        title={t('roles.title', { defaultValue: 'Roles' })}
        columns={columns}
        data={roles}
        searchColumn="name"
        searchPlaceholder={t('roles.search_placeholder', {
          defaultValue: 'Search roles...',
        })}
        canAdd={true}
        addButtonTitle={t('roles.create_button', {
          defaultValue: 'Create role',
        })}
        onAddClick={handleAddRole}
        serverSideSearch={true}
        onSearchChange={setSearch}
        isLoading={fetching}
        showRowNumber={false}
        currentPage={page}
        pageSize={perPage}
        onPageSizeChange={setPerPage}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        totalItems={queryData?.roles.data.total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteRole}
        title={t('roles.delete_title', { defaultValue: 'Delete Role?' })}
        description={
          <>
            {t('roles.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the role',
            })}{' '}
            <span className="font-semibold">{roleToDelete?.name}</span>.
          </>
        }
        confirmText={t('roles.delete_button', { defaultValue: 'Delete' })}
        variant="destructive"
      />
    </div>
  )
}
