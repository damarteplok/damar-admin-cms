import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  GET_DISCOUNT_QUERY,
  UPDATE_DISCOUNT_MUTATION,
} from '@/lib/graphql/discount.graphql'
import type {
  DiscountResponse,
  UpdateDiscountInput,
  CreateDiscountInput,
} from '@/types'
import { DiscountForm } from '@/components/features/admin/discounts'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UpdateDiscountResponse {
  updateDiscount: {
    success: boolean
    message: string
    data: any
  }
}

export const Route = createFileRoute('/admin/discounts/$id/edit')({
  component: EditDiscountPage,
})

function EditDiscountPage() {
  const { id } = useParams({ from: '/admin/discounts/$id/edit' })
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [result] = useQuery<DiscountResponse>({
    query: GET_DISCOUNT_QUERY,
    variables: { id },
  })

  const [, updateDiscountMutation] = useMutation<UpdateDiscountResponse>(
    UPDATE_DISCOUNT_MUTATION,
  )

  const { data, fetching, error } = result

  const handleUpdate = async (
    data: CreateDiscountInput | UpdateDiscountInput,
    _createAnother?: boolean,
  ) => {
    // Ensure we send all fields required for update
    const updateInput: UpdateDiscountInput = {
      ...data,
      id,
    }

    const result = await updateDiscountMutation({ input: updateInput })

    if (result.data?.updateDiscount.success) {
      toast.success(
        t('discounts.form.updated_success', {
          defaultValue: 'Discount updated successfully!',
        }),
      )
      navigate({ to: '/admin/discounts' })
      return true
    } else {
      toast.error(
        result.data?.updateDiscount.message ||
          t('discounts.form.updated_failed', {
            defaultValue: 'Failed to update discount',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/discounts' })
  }

  if (fetching) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
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
        actionLabel={t('common.go_back', { defaultValue: 'Go Back' })}
        onAction={() => navigate({ to: '/admin/discounts' })}
      />
    )
  }

  const discount = data.discount.data

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
            {t('discounts.edit_title', { defaultValue: 'Edit Discount' })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('discounts.edit_description', {
              defaultValue: 'Update discount details',
            })}
          </p>
        </div>
      </div>

      {/* Discount Form */}
      <Card>
        <CardContent className="pt-6">
          <DiscountForm
            initialData={{
              name: discount.name,
              description: discount.description || undefined,
              type: discount.type,
              amount: discount.amount,
              validUntil: discount.validUntil || undefined,
              isActive: discount.isActive,
              actionType: discount.actionType || undefined,
              maxRedemptions: discount.maxRedemptions || undefined,
              maxRedemptionsPerUser:
                discount.maxRedemptionsPerUser || undefined,
              isRecurring: discount.isRecurring,
              durationInMonths: discount.durationInMonths || undefined,
              maximumRecurringIntervals:
                discount.maximumRecurringIntervals || undefined,
              redeemType: discount.redeemType || undefined,
              bonusDays: discount.bonusDays || undefined,
              isEnabledForAllPlans: discount.isEnabledForAllPlans,
              isEnabledForAllOneTimeProducts:
                discount.isEnabledForAllOneTimeProducts,
            }}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t('discounts.form.save', { defaultValue: 'Save' })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
