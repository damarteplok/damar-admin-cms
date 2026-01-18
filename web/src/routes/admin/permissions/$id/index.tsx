import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArrowLeft, Calendar, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { DeletePermissionResponse, PermissionResponse } from '@/types'
import {
  DELETE_PERMISSION_MUTATION,
  GET_PERMISSION_QUERY,
} from '@/lib/graphql/rbac.graphql'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatDateTime } from '@/lib/utils/date'

export const Route = createFileRoute('/admin/permissions/$id/')({
  component: PermissionDetailPage,
})

function PermissionDetailPage() {
  const { id } = useParams({ from: '/admin/permissions/$id/' })
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [result] = useQuery<PermissionResponse>({
    query: GET_PERMISSION_QUERY,
    variables: { id },
  })

  const [, deletePermissionMutation] = useMutation<DeletePermissionResponse>(
    DELETE_PERMISSION_MUTATION,
  )

  const { data, fetching, error } = result

  const handleBack = () => {
    navigate({ to: '/admin/permissions' })
  }

  const handleEdit = () => {
    navigate({ to: `/admin/permissions/${id}/edit` })
  }

  const handleDelete = async () => {
    const result = await deletePermissionMutation({ id })

    if (result.data?.deletePermission.success) {
      toast.success(
        t('permissions.delete_success', {
          defaultValue: 'Permission deleted successfully!',
        }),
      )
      navigate({ to: '/admin/permissions' })
    } else {
      toast.error(
        result.data?.deletePermission.message ||
          t('permissions.delete_failed', {
            defaultValue: 'Failed to delete permission',
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

  if (error || !data?.permission.success || !data?.permission.data) {
    return (
      <ErrorState
        title={t('permissions.not_found', {
          defaultValue: 'Permission Not Found',
        })}
        description={
          error?.message ||
          data?.permission.message ||
          t('permissions.load_failed', {
            defaultValue: 'Failed to load permission',
          })
        }
        actionLabel={t('common.go_back', { defaultValue: 'Go Back' })}
        onAction={() => navigate({ to: '/admin/permissions' })}
      />
    )
  }

  const permission = data.permission.data

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header with Back Button and Permission Name */}
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
              <Badge variant="outline">{permission.guardName}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {permission.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            {t('permissions.metadata.title', {
              defaultValue: 'Additional Information',
            })}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('permissions.metadata.created_at', {
                    defaultValue: 'Created',
                  })}
                </p>
                <p className="font-medium">
                  {formatDateTime(permission.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('permissions.metadata.updated_at', {
                    defaultValue: 'Last Updated',
                  })}
                </p>
                <p className="font-medium">
                  {formatDateTime(permission.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('permissions.delete_title', {
          defaultValue: 'Delete Permission?',
        })}
        description={
          <>
            {t('permissions.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the permission',
            })}{' '}
            <span className="font-semibold">{permission.name}</span>.
          </>
        }
        confirmText={t('permissions.delete_button', { defaultValue: 'Delete' })}
        variant="destructive"
      />
    </div>
  )
}
