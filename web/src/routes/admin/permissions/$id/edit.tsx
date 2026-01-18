import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArrowLeft, Loader2 } from 'lucide-react'
import type {
  CreatePermissionInput,
  PermissionResponse,
  UpdatePermissionInput,
  UpdatePermissionResponse,
} from '@/types'
import {
  GET_PERMISSION_QUERY,
  UPDATE_PERMISSION_MUTATION,
} from '@/lib/graphql/rbac.graphql'
import { PermissionForm } from '@/components/features/admin/permissions'

import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/permissions/$id/edit')({
  component: EditPermissionPage,
})

function EditPermissionPage() {
  const { id } = useParams({ from: '/admin/permissions/$id/edit' })
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [result] = useQuery<PermissionResponse>({
    query: GET_PERMISSION_QUERY,
    variables: { id },
  })

  const [, updatePermissionMutation] = useMutation<UpdatePermissionResponse>(
    UPDATE_PERMISSION_MUTATION,
  )

  const { data, fetching, error } = result

  const handleUpdate = async (
    updateData: CreatePermissionInput | UpdatePermissionInput,
  ) => {
    const result = await updatePermissionMutation({
      input: {
        id,
        ...updateData,
      },
    })

    if (result.data?.updatePermission.success) {
      toast.success(
        t('permissions.form.updated_success', {
          defaultValue: 'Permission updated successfully!',
        }),
      )
      navigate({ to: '/admin/permissions' })
      return true
    } else {
      toast.error(
        result.data?.updatePermission.message ||
          t('permissions.form.updated_failed', {
            defaultValue: 'Failed to update permission',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/permissions' })
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
            {t('permissions.edit_title', { defaultValue: 'Edit Permission' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('permissions.edit_description', {
              defaultValue: 'Update permission details',
            })}
          </p>
        </div>
      </div>

      {/* Permission Form */}
      <Card>
        <CardContent className="pt-6">
          <PermissionForm
            initialData={{
              name: permission.name,
              guardName: permission.guardName,
            }}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t('permissions.form.save', { defaultValue: 'Save' })}
            isEditMode={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
