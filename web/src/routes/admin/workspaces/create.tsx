import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'

import { CREATE_TENANT_MUTATION } from '@/lib/graphql/tenant.graphql'
import type { CreateTenantResponse } from '@/types'

import { WorkspaceForm } from '@/components/features/admin/workspaces/workspace-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/workspaces/create')({
  component: CreateWorkspacePage,
})

interface WorkspaceFormData {
  name: string
  slug?: string
  domain?: string
}

function CreateWorkspacePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [, createTenantMutation] = useMutation<CreateTenantResponse>(
    CREATE_TENANT_MUTATION,
  )

  const handleSubmit = async (
    data: WorkspaceFormData,
    createAnother?: boolean,
  ) => {
    const result = await createTenantMutation({
      input: {
        name: data.name,
        slug: data.slug || undefined,
        domain: data.domain || undefined,
      },
    })

    if (result.data?.createTenant.success) {
      if (createAnother) {
        toast.success(
          t('workspaces.form.created_another', {
            defaultValue: 'Workspace created! Create another one.',
          }),
        )
        // Don't navigate, just return true to reset form
      } else {
        toast.success(
          t('workspaces.form.created_success', {
            defaultValue: 'Workspace created successfully!',
          }),
        )
        // Navigate back to workspace list
        navigate({ to: '/admin/workspaces' })
      }

      return true
    } else {
      toast.error(
        result.data?.createTenant.message ||
          t('workspaces.form.created_failed', {
            defaultValue: 'Failed to create workspace',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/workspaces' })
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
              {t('workspaces.create_title', {
                defaultValue: 'Create Workspace',
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('workspaces.create_description', {
                defaultValue: 'Create a new workspace and manage its users',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Form */}
      <Card>
        <CardContent className="pt-6">
          <WorkspaceForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel={t('workspaces.form.create', {
              defaultValue: 'Create',
            })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
