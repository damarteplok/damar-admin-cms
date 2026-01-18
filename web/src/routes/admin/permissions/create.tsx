import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ArrowLeft } from 'lucide-react'
import type {
  CreatePermissionInput,
  CreatePermissionResponse,
  UpdatePermissionInput,
} from '@/types'
import { CREATE_PERMISSION_MUTATION } from '@/lib/graphql/rbac.graphql'
import { PermissionForm } from '@/components/features/admin/permissions'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/permissions/create')({
  component: CreatePermissionPage,
})

function CreatePermissionPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, createPermissionMutation] = useMutation<CreatePermissionResponse>(
    CREATE_PERMISSION_MUTATION,
  )

  const handleCreate = async (
    data: CreatePermissionInput | UpdatePermissionInput,
    createAnother: boolean = false,
  ) => {
    const result = await createPermissionMutation({
      input: data as CreatePermissionInput,
    })

    if (result.data?.createPermission.success) {
      toast.success(
        createAnother
          ? t('permissions.form.created_another', {
              defaultValue: 'Permission created! Create another one.',
            })
          : t('permissions.form.created_success', {
              defaultValue: 'Permission created successfully!',
            }),
      )

      if (!createAnother) {
        navigate({ to: '/admin/permissions' })
      }
      return true
    } else {
      toast.error(
        result.data?.createPermission.message ||
          t('permissions.form.created_failed', {
            defaultValue: 'Failed to create permission',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/permissions' })
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
              {t('permissions.create_title', {
                defaultValue: 'Create Permission',
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('permissions.create_description', {
                defaultValue: 'Create a new permission',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Permission Form */}
      <Card>
        <CardContent className="pt-6">
          <PermissionForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            submitLabel={t('permissions.form.create', {
              defaultValue: 'Create',
            })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
