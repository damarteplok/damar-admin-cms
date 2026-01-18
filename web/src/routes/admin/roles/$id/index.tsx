import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArrowLeft, Calendar, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { DeleteRoleResponse, RoleWithPermissionsResponse } from '@/types'
import {
  DELETE_ROLE_MUTATION,
  GET_ROLE_WITH_PERMISSIONS_QUERY,
} from '@/lib/graphql/rbac.graphql'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatDateTime } from '@/lib/utils/date'

export const Route = createFileRoute('/admin/roles/$id/')({
  component: RoleDetailPage,
})

function RoleDetailPage() {
  const { id } = useParams({ from: '/admin/roles/$id/' })
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [result] = useQuery<RoleWithPermissionsResponse>({
    query: GET_ROLE_WITH_PERMISSIONS_QUERY,
    variables: { id },
  })

  const [, deleteRoleMutation] =
    useMutation<DeleteRoleResponse>(DELETE_ROLE_MUTATION)

  const { data, fetching, error } = result

  const handleBack = () => {
    navigate({ to: '/admin/roles' })
  }

  const handleEdit = () => {
    navigate({ to: `/admin/roles/${id}/edit` })
  }

  const handleManagePermissions = () => {
    navigate({ to: `/admin/roles/${id}/permissions` })
  }

  const handleDelete = async () => {
    const result = await deleteRoleMutation({ id })

    if (result.data?.deleteRole.success) {
      toast.success(
        t('roles.delete_success', {
          defaultValue: 'Role deleted successfully!',
        }),
      )
      navigate({ to: '/admin/roles' })
    } else {
      toast.error(
        result.data?.deleteRole.message ||
          t('roles.delete_failed', {
            defaultValue: 'Failed to delete role',
          }),
      )
    }
    setDeleteDialogOpen(false)
  }

  if (fetching) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (
    error ||
    !data?.roleWithPermissions.success ||
    !data?.roleWithPermissions.data
  ) {
    return (
      <ErrorState
        title={t('roles.not_found', { defaultValue: 'Role Not Found' })}
        description={
          error?.message ||
          data?.roleWithPermissions.message ||
          t('roles.load_failed', { defaultValue: 'Failed to load role' })
        }
        actionLabel={t('common.go_back', { defaultValue: 'Go Back' })}
        onAction={() => navigate({ to: '/admin/roles' })}
      />
    )
  }

  const role = data.roleWithPermissions.data

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header with Back Button and Role Name */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{role.guardName}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{role.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleManagePermissions}>
            {t('roles.actions.manage_permissions', {
              defaultValue: 'Manage Permissions',
            })}
          </Button>
          <Button onClick={handleEdit}>
            {t('common.edit', { defaultValue: 'Edit' })}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            {t('common.delete', { defaultValue: 'Delete' })}
          </Button>
        </div>
      </div>

      {/* Permissions */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            {t('roles.columns.permissions_count', {
              defaultValue: 'Permissions',
            })}{' '}
            ({role.permissions.length})
          </h3>
          {role.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission.id} variant="secondary">
                  {permission.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('roles.metadata.no_permissions', {
                defaultValue: 'No permissions assigned to this role.',
              })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            {t('roles.metadata.title', {
              defaultValue: 'Additional Information',
            })}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('roles.metadata.created_at', { defaultValue: 'Created' })}
                </p>
                <p className="font-medium">{formatDateTime(role.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('roles.metadata.updated_at', {
                    defaultValue: 'Last Updated',
                  })}
                </p>
                <p className="font-medium">{formatDateTime(role.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('roles.delete_title', { defaultValue: 'Delete Role?' })}
        description={
          <>
            {t('roles.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the role',
            })}{' '}
            <span className="font-semibold">{role.name}</span>.
          </>
        }
        confirmText={t('roles.delete_button', { defaultValue: 'Delete' })}
        variant="destructive"
      />
    </div>
  )
}
