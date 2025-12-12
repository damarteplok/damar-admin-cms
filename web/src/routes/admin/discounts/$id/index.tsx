import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  GET_DISCOUNT_QUERY,
  DELETE_DISCOUNT_MUTATION,
} from '@/lib/graphql/discount.graphql'
import type { DiscountResponse, DeleteDiscountResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, X } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { formatDateTime } from '@/lib/utils/date'

export const Route = createFileRoute('/admin/discounts/$id/')({
  component: DiscountDetailsPage,
})

function DiscountDetailsPage() {
  const { id } = useParams({ from: '/admin/discounts/$id/' })
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [result] = useQuery<DiscountResponse>({
    query: GET_DISCOUNT_QUERY,
    variables: { id },
  })

  const [, deleteDiscountMutation] = useMutation<DeleteDiscountResponse>(
    DELETE_DISCOUNT_MUTATION,
  )

  const { data, fetching, error } = result

  const handleEdit = () => {
    navigate({ to: `/admin/discounts/${id}/edit` })
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleBack = () => {
    navigate({ to: '/admin/discounts' })
  }

  const confirmDelete = async () => {
    const result = await deleteDiscountMutation({ id })
    if (result.data?.deleteDiscount.success) {
      toast.success(
        t('discounts.deleted', { defaultValue: 'Discount deleted' }),
      )
      setDeleteDialogOpen(false)
      navigate({ to: '/admin/discounts' })
    } else {
      toast.error(
        result.data?.deleteDiscount.message ||
          t('discounts.delete_failed', {
            defaultValue: 'Failed to delete discount',
          }),
      )
    }
  }

  if (fetching) {
    return (
      <DataTableSkeleton
        showCreateButton={true}
        showSearch={true}
        rows={10}
        columns={7}
      />
    )
  }

  if (error || !data?.discount.success || !data?.discount.data) {
    return (
      <ErrorState
        title={t('discounts.not_found', { defaultValue: 'Discount Not Found' })}
        description={
          error?.message ||
          data?.discount.message ||
          t('discounts.load_failed', {
            defaultValue: 'Failed to load discount',
          })
        }
        action={
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/admin/discounts' })}
          >
            {t('common.go_back', { defaultValue: 'Go Back' })}
          </Button>
        }
      />
    )
  }

  const discount = data.discount.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {discount.name}
              </h1>
              {discount.isActive ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('discounts.view_description', {
                defaultValue: 'View discount details',
              })}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleEdit}>
            {t('discounts.actions.edit', { defaultValue: 'Edit' })}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t('discounts.actions.delete', { defaultValue: 'Delete' })}
          </Button>
        </div>
      </div>

      {/* Discount Details */}
      <div className="grid gap-6 grid-cols-1">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('discounts.basic_info', { defaultValue: 'Basic Information' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('discounts.form.name', { defaultValue: 'Name' })}
              </label>
              <p className="mt-1 text-sm font-medium">{discount.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('discounts.form.description', {
                  defaultValue: 'Description',
                })}
              </label>
              <p className="mt-1 text-sm">
                {discount.description || (
                  <span className="text-muted-foreground italic">
                    {t('discounts.no_description', {
                      defaultValue: 'No description',
                    })}
                  </span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.form.type', { defaultValue: 'Type' })}
                </label>
                <p className="mt-1">
                  <Badge
                    variant={
                      discount.type === 'percentage' ? 'default' : 'secondary'
                    }
                  >
                    {discount.type === 'percentage' ? 'Percentage' : 'Fixed'}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.form.amount', { defaultValue: 'Amount' })}
                </label>
                <p className="mt-1 text-sm font-semibold">
                  {discount.type === 'percentage'
                    ? `${discount.amount}%`
                    : `$${discount.amount.toFixed(2)}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('discounts.usage_info', { defaultValue: 'Usage Information' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('discounts.redemptions', { defaultValue: 'Redemptions' })}
              </label>
              <p className="mt-1 text-sm">
                <span className="font-semibold">{discount.redemptions}</span>
                {discount.maxRedemptions && discount.maxRedemptions > 0 && (
                  <span className="text-muted-foreground">
                    {' '}
                    / {discount.maxRedemptions}
                  </span>
                )}
              </p>
            </div>
            {discount.maxRedemptionsPerUser && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.max_per_user', {
                    defaultValue: 'Max Per User',
                  })}
                </label>
                <p className="mt-1 text-sm">
                  {discount.maxRedemptionsPerUser === -1
                    ? 'Unlimited'
                    : discount.maxRedemptionsPerUser}
                </p>
              </div>
            )}
            {discount.validUntil && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.valid_until', { defaultValue: 'Valid Until' })}
                </label>
                <p className="mt-1 text-sm">
                  {formatDateTime(discount.validUntil)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('discounts.configuration', { defaultValue: 'Configuration' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.is_active', { defaultValue: 'Active' })}
                </label>
                <p className="mt-1 text-sm">
                  {discount.isActive ? (
                    <span className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {t('common.yes', { defaultValue: 'Yes' })}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <X className="h-4 w-4 text-muted-foreground mr-2" />
                      {t('common.no', { defaultValue: 'No' })}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.is_recurring', { defaultValue: 'Recurring' })}
                </label>
                <p className="mt-1 text-sm">
                  {discount.isRecurring ? (
                    <span className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {t('common.yes', { defaultValue: 'Yes' })}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <X className="h-4 w-4 text-muted-foreground mr-2" />
                      {t('common.no', { defaultValue: 'No' })}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {discount.isRecurring && (
              <>
                {discount.durationInMonths && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t('discounts.duration_months', {
                        defaultValue: 'Duration (Months)',
                      })}
                    </label>
                    <p className="mt-1 text-sm">{discount.durationInMonths}</p>
                  </div>
                )}
                {discount.maximumRecurringIntervals && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t('discounts.max_intervals', {
                        defaultValue: 'Max Intervals',
                      })}
                    </label>
                    <p className="mt-1 text-sm">
                      {discount.maximumRecurringIntervals}
                    </p>
                  </div>
                )}
              </>
            )}
            {discount.bonusDays && discount.bonusDays > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.bonus_days', { defaultValue: 'Bonus Days' })}
                </label>
                <p className="mt-1 text-sm">{discount.bonusDays}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('discounts.availability', { defaultValue: 'Availability' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('discounts.enabled_for_all_plans', {
                  defaultValue: 'All Plans',
                })}
              </label>
              <p className="mt-1 text-sm">
                {discount.isEnabledForAllPlans ? (
                  <span className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {t('discounts.enabled', { defaultValue: 'Enabled' })}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <X className="h-4 w-4 text-muted-foreground mr-2" />
                    {t('discounts.disabled', { defaultValue: 'Disabled' })}
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('discounts.enabled_for_all_one_time', {
                  defaultValue: 'All One-Time Products',
                })}
              </label>
              <p className="mt-1 text-sm">
                {discount.isEnabledForAllOneTimeProducts ? (
                  <span className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {t('discounts.enabled', { defaultValue: 'Enabled' })}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <X className="h-4 w-4 text-muted-foreground mr-2" />
                    {t('discounts.disabled', { defaultValue: 'Disabled' })}
                  </span>
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.created_at', { defaultValue: 'Created' })}
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(discount.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('discounts.updated_at', { defaultValue: 'Updated' })}
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(discount.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={t('discounts.delete_title', {
          defaultValue: 'Delete Discount?',
        })}
        description={
          <>
            {t('discounts.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the discount',
            })}{' '}
            <span className="font-semibold">{discount.name}</span>{' '}
            {t('discounts.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('discounts.delete_button', {
          defaultValue: 'Delete',
        })}
        variant="destructive"
      />
    </div>
  )
}
