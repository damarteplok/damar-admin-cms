import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArrowLeft, Loader2 } from 'lucide-react'
import type {
  CreateRoleInput,
  RoleResponse,
  UpdateRoleInput,
  UpdateRoleResponse,
} from '@/types'
import {
  GET_ROLE_QUERY,
  UPDATE_ROLE_MUTATION,
} from '@/lib/graphql/rbac.graphql'
import { RoleForm } from '@/components/features/admin/roles'

import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/roles/$id/edit')({
  component: EditRolePage,
})

function EditRolePage() {
  const { id } = useParams({ from: '/admin/roles/$id/edit' })
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [result] = useQuery<RoleResponse>({
    query: GET_ROLE_QUERY,
    variables: { id },
  })

  const [, updateRoleMutation] =
    useMutation<UpdateRoleResponse>(UPDATE_ROLE_MUTATION)

  const { data, fetching, error } = result

  const handleUpdate = async (
    updateData: CreateRoleInput | UpdateRoleInput,
  ) => {
    const result = await updateRoleMutation({
      input: {
        id,
        ...updateData,
      },
    })

    if (result.data?.updateRole.success) {
      toast.success(
        t('roles.form.updated_success', {
          defaultValue: 'Role updated successfully!',
        }),
      )
      navigate({ to: '/admin/roles' })
      return true
    } else {
      toast.error(
        result.data?.updateRole.message ||
          t('roles.form.updated_failed', {
            defaultValue: 'Failed to update role',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/roles' })
  }

  if (fetching) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data?.role.success || !data?.role.data) {
    return (
      <ErrorState
        title={t('roles.not_found', { defaultValue: 'Role Not Found' })}
        description={
          error?.message ||
          data?.role.message ||
          t('roles.load_failed', { defaultValue: 'Failed to load role' })
        }
        actionLabel={t('common.go_back', { defaultValue: 'Go Back' })}
        onAction={() => navigate({ to: '/admin/roles' })}
      />
    )
  }

  const role = data.role.data

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
            {t('roles.edit_title', { defaultValue: 'Edit Role' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('roles.edit_description', {
              defaultValue: 'Update role details',
            })}
          </p>
        </div>
      </div>

      {/* Role Form */}
      <Card>
        <CardContent className="pt-6">
          <RoleForm
            initialData={{
              name: role.name,
              guardName: role.guardName,
            }}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t('roles.form.save', { defaultValue: 'Save' })}
            isEditMode={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
