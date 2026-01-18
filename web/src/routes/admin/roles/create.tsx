import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArrowLeft } from 'lucide-react'
import type {
  CreateRoleInput,
  CreateRoleResponse,
  UpdateRoleInput,
} from '@/types'
import { CREATE_ROLE_MUTATION } from '@/lib/graphql/rbac.graphql'
import { RoleForm } from '@/components/features/admin/roles'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/roles/create')({
  component: CreateRolePage,
})

function CreateRolePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, createRoleMutation] =
    useMutation<CreateRoleResponse>(CREATE_ROLE_MUTATION)

  const handleCreate = async (
    data: CreateRoleInput | UpdateRoleInput,
    createAnother: boolean = false,
  ) => {
    const result = await createRoleMutation({
      input: data as CreateRoleInput,
    })

    if (result.data?.createRole.success) {
      toast.success(
        createAnother
          ? t('roles.form.created_another', {
              defaultValue: 'Role created! Create another one.',
            })
          : t('roles.form.created_success', {
              defaultValue: 'Role created successfully!',
            }),
      )

      if (!createAnother) {
        navigate({ to: '/admin/roles' })
      }
      return true
    } else {
      toast.error(
        result.data?.createRole.message ||
          t('roles.form.created_failed', {
            defaultValue: 'Failed to create role',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/roles' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {t('roles.create_title', { defaultValue: 'Create Role' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('roles.create_description', {
                defaultValue: 'Create a new role',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Role Form */}
      <Card>
        <CardContent className="pt-6">
          <RoleForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            submitLabel={t('roles.form.create', { defaultValue: 'Create' })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
