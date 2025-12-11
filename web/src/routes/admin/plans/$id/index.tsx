import {
  createFileRoute,
  useNavigate,
  useParams,
  Link,
} from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import {
  GET_PLAN_QUERY,
  DELETE_PLAN_MUTATION,
} from '@/lib/graphql/plan.graphql'
import type { PlanResponse, DeletePlanResponse } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Check, X } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'

export const Route = createFileRoute('/admin/plans/$id/')({
  component: PlanDetailsPage,
})

function PlanDetailsPage() {
  const { id } = useParams({ from: '/admin/plans/$id/' })
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [result] = useQuery<PlanResponse>({
    query: GET_PLAN_QUERY,
    variables: { id },
  })

  const [, deletePlanMutation] =
    useMutation<DeletePlanResponse>(DELETE_PLAN_MUTATION)

  const { data, fetching, error } = result

  const handleEdit = () => {
    navigate({ to: `/admin/plans/${id}/edit` })
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    const result = await deletePlanMutation({ id })
    if (result.data?.deletePlan.success) {
      navigate({ to: '/admin/plans' })
    } else {
      alert(result.data?.deletePlan.message || 'Failed to delete plan')
    }
  }

  if (fetching) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={8}
      />
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
        action={
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/admin/plans' })}
          >
            {t('common.go_back', { defaultValue: 'Go Back' })}
          </Button>
        }
      />
    )
  }

  const plan = data.plan.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{plan.name}</h1>
          <Badge variant="outline" className="font-mono">
            {plan.slug}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleEdit}>
            {t('plans.actions.edit', { defaultValue: 'Edit' })}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t('plans.actions.delete', { defaultValue: 'Delete' })}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('plans.view_title', { defaultValue: 'Plan Details' })}
            </CardTitle>
            <CardDescription>
              {t('plans.view_description', {
                defaultValue: 'View plan details',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {t('plans.form.description', { defaultValue: 'Description' })}
              </h3>
              <p className="text-sm">{plan.description || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.type', { defaultValue: 'Type' })}
                </h3>
                <Badge variant="outline">{plan.type}</Badge>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.interval_count', {
                    defaultValue: 'Interval Count',
                  })}
                </h3>
                <p className="text-sm">{plan.intervalCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.product_id', { defaultValue: 'Product ID' })}
                </h3>
                <p className="text-sm font-mono">{plan.productId}</p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.interval_id', { defaultValue: 'Interval ID' })}
                </h3>
                <p className="text-sm font-mono">{plan.intervalId}</p>
              </div>
            </div>

            {plan.maxUsersPerTenant !== null &&
              plan.maxUsersPerTenant !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {t('plans.form.max_users_per_tenant', {
                      defaultValue: 'Max Users Per Tenant',
                    })}
                  </h3>
                  <p className="text-sm">
                    {plan.maxUsersPerTenant === 0
                      ? 'Unlimited'
                      : plan.maxUsersPerTenant}
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('plans.status_title', { defaultValue: 'Status & Settings' })}
            </CardTitle>
            <CardDescription>
              {t('plans.status_description', {
                defaultValue: 'Plan status and configuration',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.is_active', { defaultValue: 'Active' })}
                </h3>
                <div className="flex items-center">
                  {plan.isActive ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Active</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Inactive
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.is_visible', { defaultValue: 'Visible' })}
                </h3>
                <div className="flex items-center">
                  {plan.isVisible ? (
                    <>
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Visible</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Hidden
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">
                {t('plans.trial_title', { defaultValue: 'Trial Information' })}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('plans.form.has_trial', { defaultValue: 'Has Trial' })}
                  </span>
                  {plan.hasTrial ? (
                    <Badge variant="default">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </div>

                {plan.hasTrial && (
                  <>
                    {plan.trialIntervalId && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t('plans.form.trial_interval_id', {
                            defaultValue: 'Trial Interval ID',
                          })}
                        </span>
                        <span className="text-sm font-mono">
                          {plan.trialIntervalId}
                        </span>
                      </div>
                    )}
                    {plan.trialIntervalCount !== null &&
                      plan.trialIntervalCount !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {t('plans.form.trial_interval_count', {
                              defaultValue: 'Trial Interval Count',
                            })}
                          </span>
                          <span className="text-sm">
                            {plan.trialIntervalCount}
                          </span>
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {t('plans.created_at', { defaultValue: 'Created' })}{' '}
                  {new Date(plan.createdAt * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {t('plans.updated_at', { defaultValue: 'Updated' })}{' '}
                  {new Date(plan.updatedAt * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('plans.delete_title', { defaultValue: 'Delete Plan?' })}
        description={
          <>
            {t('plans.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the plan',
            })}{' '}
            <span className="font-semibold">{plan.name}</span>{' '}
            {t('plans.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('plans.delete_button', { defaultValue: 'Delete' })}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
