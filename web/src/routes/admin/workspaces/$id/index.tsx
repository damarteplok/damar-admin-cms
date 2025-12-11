import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils/date'

import {
  GET_TENANT_QUERY,
  DELETE_TENANT_MUTATION,
} from '@/lib/graphql/tenant.graphql'
import type { TenantResponse, DeleteTenantResponse } from '@/types'

import { WorkspaceUsersTable } from '@/components/features/admin/workspaces/workspace-users-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export const Route = createFileRoute('/admin/workspaces/$id/')({
  component: WorkspaceDetailPage,
})

function WorkspaceDetailPage() {
  const { t } = useTranslation()
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [{ data, fetching, error }] = useQuery<TenantResponse>({
    query: GET_TENANT_QUERY,
    variables: { id },
  })

  const [, executeMutation] = useMutation<DeleteTenantResponse>(
    DELETE_TENANT_MUTATION,
  )

  const handleEdit = () => {
    navigate({ to: `/admin/workspaces/${id}/edit` })
  }

  const handleDelete = async () => {
    const result = await executeMutation({ id })

    if (result.error) {
      toast.error(
        t('workspaces.delete_failed', {
          defaultValue: 'Failed to delete workspace',
        }),
      )
      return
    }

    if (!result.data?.deleteTenant.success) {
      toast.error(
        result.data?.deleteTenant.message ||
          t('workspaces.delete_failed', {
            defaultValue: 'Failed to delete workspace',
          }),
      )
      return
    }

    toast.success(
      t('workspaces.deleted', { defaultValue: 'Workspace deleted' }),
    )
    setIsDeleteDialogOpen(false)
    navigate({ to: '/admin/workspaces' })
  }

  const handleBack = () => {
    navigate({ to: '/admin/workspaces' })
  }

  if (fetching) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={5}
      />
    )
  }

  if (error || !data?.tenant.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('workspaces.not_found', {
                defaultValue: 'Workspace Not Found',
              })}
            </h1>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {data?.tenant.message ||
              error?.message ||
              t('workspaces.load_failed', {
                defaultValue: 'Failed to load workspace',
              })}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const workspace = data.tenant.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {workspace.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('workspaces.view_description', {
                defaultValue: 'View workspace details and manage users',
              })}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleEdit}>
            {t('workspaces.actions.edit', { defaultValue: 'Edit' })}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            {t('workspaces.actions.delete', { defaultValue: 'Delete' })}
          </Button>
        </div>
      </div>

      {/* Workspace Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('workspaces.information_title', {
              defaultValue: 'Workspace Information',
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('workspaces.form.workspace_name', {
                  defaultValue: 'Workspace Name',
                })}
              </label>
              <p className="mt-1 text-sm">{workspace.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('workspaces.form.slug', { defaultValue: 'Slug' })}
              </label>
              <p className="mt-1 text-sm font-mono">{workspace.slug}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {t('workspaces.form.domain', { defaultValue: 'Domain' })}
            </label>
            <p className="mt-1 text-sm">
              {workspace.domain || (
                <span className="text-muted-foreground italic">
                  {t('workspaces.no_domain_set', {
                    defaultValue: 'No domain set',
                  })}
                </span>
              )}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('workspaces.uuid', { defaultValue: 'UUID' })}
              </label>
              <p className="mt-1 text-sm font-mono">{workspace.uuid}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('workspaces.columns.created_at', {
                  defaultValue: 'Created At',
                })}
              </label>
              <p className="mt-1 text-sm">
                {formatDateTime(workspace.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspace Users */}
      <Card>
        <CardContent>
          <WorkspaceUsersTable workspaceId={id} readOnly={true} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('workspaces.delete_dialog.title', {
          defaultValue: 'Delete Workspace',
        })}
        description={t('workspaces.delete_dialog.description', {
          defaultValue:
            'Are you sure you want to delete this workspace? This action cannot be undone.',
        })}
        onConfirm={handleDelete}
        confirmText={t('workspaces.actions.delete', { defaultValue: 'Delete' })}
        cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
        variant="destructive"
      />
    </div>
  )
}
