import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import {
  GET_TENANT_QUERY,
  UPDATE_TENANT_MUTATION,
} from '@/lib/graphql/tenant.graphql'
import type { TenantResponse, UpdateTenantResponse } from '@/types'

import { WorkspaceForm } from '@/components/features/admin/workspaces/workspace-form'
import { WorkspaceUsersTable } from '@/components/features/admin/workspaces/workspace-users-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/admin/workspaces/$id/edit')({
  component: EditWorkspacePage,
})

interface WorkspaceFormData {
  name: string
  slug?: string
  domain?: string
}

function EditWorkspacePage() {
  const { t } = useTranslation()
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const [{ data, fetching, error }] = useQuery<TenantResponse>({
    query: GET_TENANT_QUERY,
    variables: { id },
  })

  const [, updateTenantMutation] = useMutation<UpdateTenantResponse>(
    UPDATE_TENANT_MUTATION,
  )

  const handleSubmit = async (formData: WorkspaceFormData) => {
    const result = await updateTenantMutation({
      input: {
        id,
        name: formData.name,
        domain: formData.domain || undefined,
      },
    })

    if (result.data?.updateTenant.success) {
      toast.success(
        t('workspaces.form.updated_success', {
          defaultValue: 'Workspace updated successfully!',
        }),
      )
      navigate({ to: `/admin/workspaces/${id}` })
      return true
    } else {
      toast.error(
        result.data?.updateTenant.message ||
          t('workspaces.form.updated_failed', {
            defaultValue: 'Failed to update workspace',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: `/admin/workspaces/${id}` })
  }

  if (fetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data?.tenant.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('workspaces.edit_title', { defaultValue: 'Edit Workspace' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('workspaces.edit_description', {
              defaultValue: 'Update workspace details and manage users',
            })}
          </p>
        </div>
      </div>

      {/* Workspace Form */}
      <Card>
        <CardContent className="pt-6">
          <WorkspaceForm
            initialData={{
              name: workspace.name,
              slug: workspace.slug,
              domain: workspace.domain || '',
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      {/* Workspace Users */}
      <Card>
        <CardContent>
          <WorkspaceUsersTable workspaceId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
