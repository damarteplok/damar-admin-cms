import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  GET_PLAN_QUERY,
  UPDATE_PLAN_MUTATION,
} from '@/lib/graphql/plan.graphql'
import type { PlanResponse, UpdatePlanResponse, UpdatePlanInput } from '@/types'
import { PlanForm } from '@/components/features/admin/plans'

import { ArrowLeft, Loader2 } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/plans/$id/edit')({
  component: EditPlanPage,
})

function EditPlanPage() {
  const { id } = useParams({ from: '/admin/plans/$id/edit' })
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [result] = useQuery<PlanResponse>({
    query: GET_PLAN_QUERY,
    variables: { id },
  })

  const [, updatePlanMutation] =
    useMutation<UpdatePlanResponse>(UPDATE_PLAN_MUTATION)

  const { data, fetching, error } = result

  const handleUpdate = async (updateData: UpdatePlanInput) => {
    const result = await updatePlanMutation({
      input: {
        id,
        ...updateData,
      },
    })

    if (result.data?.updatePlan.success) {
      toast.success(
        t('plans.form.updated_success', {
          defaultValue: 'Plan updated successfully!',
        }),
      )
      navigate({ to: '/admin/plans' })
      return true
    } else {
      toast.error(
        result.data?.updatePlan.message ||
          t('plans.form.updated_failed', {
            defaultValue: 'Failed to update plan',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/plans' })
  }

  if (fetching) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data?.plan.success || !data?.plan.data) {
    return (
      <ErrorState
        title={t('plans.not_found', { defaultValue: 'Plan Not Found' })}
        description={
          error?.message ||
          data?.plan.message ||
          t('plans.load_failed', { defaultValue: 'Failed to load plan' })
        }
        actionLabel={t('common.go_back', { defaultValue: 'Go Back' })}
        onAction={() => navigate({ to: '/admin/plans' })}
      />
    )
  }

  const plan = data.plan.data

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
            {t('plans.edit_title', { defaultValue: 'Edit Plan' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('plans.edit_description', {
              defaultValue: 'Update plan details',
            })}
          </p>
        </div>
      </div>

      {/* Plan Form */}
      <Card>
        <CardContent className="pt-6">
          <PlanForm
            initialData={{
              name: plan.name,
              slug: plan.slug,
              intervalId: plan.intervalId,
              productId: plan.productId,
              intervalCount: plan.intervalCount,
              type: plan.type,
              description: plan.description || undefined,
              isActive: plan.isActive,
              hasTrial: plan.hasTrial,
              trialIntervalId: plan.trialIntervalId || undefined,
              trialIntervalCount: plan.trialIntervalCount || undefined,
              maxUsersPerTenant: plan.maxUsersPerTenant || undefined,
              meterId: plan.meterId || undefined,
              isVisible: plan.isVisible,
            }}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t('plans.form.save', { defaultValue: 'Save' })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
