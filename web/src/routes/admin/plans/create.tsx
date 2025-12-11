import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CREATE_PLAN_MUTATION } from '@/lib/graphql/plan.graphql'
import type { CreatePlanResponse, CreatePlanInput } from '@/types'
import { PlanForm } from '@/components/features/admin/plans'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/admin/plans/create')({
  component: CreatePlanPage,
})

function CreatePlanPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, createPlanMutation] =
    useMutation<CreatePlanResponse>(CREATE_PLAN_MUTATION)

  const handleCreate = async (
    data: CreatePlanInput,
    createAnother: boolean = false,
  ) => {
    const result = await createPlanMutation({ input: data })

    if (result.data?.createPlan.success) {
      toast.success(
        createAnother
          ? t('plans.form.created_another', {
              defaultValue: 'Plan created! Create another one.',
            })
          : t('plans.form.created_success', {
              defaultValue: 'Plan created successfully!',
            }),
      )

      if (!createAnother) {
        navigate({ to: '/admin/plans' })
      }
      return true
    } else {
      toast.error(
        result.data?.createPlan.message ||
          t('plans.form.created_failed', {
            defaultValue: 'Failed to create plan',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/plans' })
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
              {t('plans.create_title', { defaultValue: 'Create Plan' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('plans.create_description', {
                defaultValue: 'Create a new subscription plan',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Form */}
      <Card>
        <CardContent className="pt-6">
          <PlanForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            submitLabel={t('plans.form.create', { defaultValue: 'Create' })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
