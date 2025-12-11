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

      <div className="space-y-6">
        {/* Plan Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('plans.view_title', { defaultValue: 'Plan Information' })}
            </CardTitle>
            <CardDescription>
              {t('plans.view_description', {
                defaultValue: 'Detailed information about this plan',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Description */}
            {plan.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.description', { defaultValue: 'Description' })}
                </h3>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: plan.description }}
                />
              </div>
            )}

            {/* Type */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('plans.form.type', { defaultValue: 'Plan Type' })}
              </h3>
              <Badge variant="outline" className="capitalize">
                {plan.type === 'flat_rate' && 'Flat Rate'}
                {plan.type === 'per_unit' && 'Seat-Based'}
                {plan.type === 'tiered' && 'Usage-Based'}
              </Badge>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('plans.form.product', { defaultValue: 'Product' })}
              </h3>
              <Link
                to="/admin/products/$id"
                params={{ id: plan.productId }}
                className="text-sm font-medium text-primary hover:underline inline-flex items-center"
              >
                Product #{plan.productId}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>

            {/* Billing Interval */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('plans.form.billing_interval', {
                  defaultValue: 'Billing Interval',
                })}
              </h3>
              <p className="text-sm">
                Every {plan.intervalCount}{' '}
                {plan.intervalId === '1' &&
                  (plan.intervalCount > 1 ? 'months' : 'month')}
                {plan.intervalId === '2' &&
                  (plan.intervalCount > 1 ? 'years' : 'year')}
                {plan.intervalId === '3' &&
                  (plan.intervalCount > 1 ? 'weeks' : 'week')}
                {plan.intervalId === '4' &&
                  (plan.intervalCount > 1 ? 'days' : 'day')}
              </p>
            </div>

            {/* Max Users Per Tenant */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
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

            {/* Meter ID - Only show if exists */}
            {plan.meterId && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.meter_id', { defaultValue: 'Meter ID' })}
                </h3>
                <p className="text-sm font-mono">{plan.meterId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('plans.status_title', { defaultValue: 'Status & Settings' })}
            </CardTitle>
            <CardDescription>
              {t('plans.status_description', {
                defaultValue: 'Plan status and visibility settings',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Active Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('plans.form.is_active', { defaultValue: 'Active Status' })}
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

            {/* Visible Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('plans.form.is_visible', { defaultValue: 'Visibility' })}
              </h3>
              <div className="flex items-center">
                {plan.isVisible ? (
                  <>
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Visible to customers</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Hidden from customers
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial Information - Only show if has trial */}
        {plan.hasTrial && (
          <Card>
            <CardHeader>
              <CardTitle>
                {t('plans.trial_title', { defaultValue: 'Trial Information' })}
              </CardTitle>
              <CardDescription>Free trial period configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Trial Enabled Badge */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('plans.form.has_trial', { defaultValue: 'Trial Period' })}
                </h3>
                <Badge variant="default">Enabled</Badge>
              </div>

              {/* Trial Duration */}
              {plan.trialIntervalId && plan.trialIntervalCount && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {t('plans.form.trial_interval_count', {
                      defaultValue: 'Trial Duration',
                    })}
                  </h3>
                  <p className="text-sm">
                    {plan.trialIntervalCount}{' '}
                    {plan.trialIntervalId === '1' &&
                      (plan.trialIntervalCount > 1 ? 'months' : 'month')}
                    {plan.trialIntervalId === '2' &&
                      (plan.trialIntervalCount > 1 ? 'years' : 'year')}
                    {plan.trialIntervalId === '3' &&
                      (plan.trialIntervalCount > 1 ? 'weeks' : 'week')}
                    {plan.trialIntervalId === '4' &&
                      (plan.trialIntervalCount > 1 ? 'days' : 'day')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {t('plans.created_at', { defaultValue: 'Created' })}{' '}
                  {new Date(plan.createdAt * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {t('plans.updated_at', { defaultValue: 'Updated' })}{' '}
                  {new Date(plan.updatedAt * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
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
