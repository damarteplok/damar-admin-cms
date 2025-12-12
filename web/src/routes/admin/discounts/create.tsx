import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CREATE_DISCOUNT_MUTATION } from '@/lib/graphql/discount.graphql'
import type { CreateDiscountInput, UpdateDiscountInput } from '@/types'
import { DiscountForm } from '@/components/features/admin/discounts'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

interface CreateDiscountResponse {
  createDiscount: {
    success: boolean
    message: string
    data: any
  }
}

export const Route = createFileRoute('/admin/discounts/create')({
  component: CreateDiscountPage,
})

function CreateDiscountPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, createDiscountMutation] = useMutation<CreateDiscountResponse>(
    CREATE_DISCOUNT_MUTATION,
  )

  const handleCreate = async (
    data: CreateDiscountInput | UpdateDiscountInput,
    createAnother: boolean = false,
  ) => {
    const result = await createDiscountMutation({
      input: data as CreateDiscountInput,
    })

    if (result.data?.createDiscount.success) {
      toast.success(
        createAnother
          ? t('discounts.form.created_another', {
              defaultValue: 'Discount created! Create another one.',
            })
          : t('discounts.form.created_success', {
              defaultValue: 'Discount created successfully!',
            }),
      )

      if (!createAnother) {
        navigate({ to: '/admin/discounts' })
      }
      return true
    } else {
      toast.error(
        result.data?.createDiscount.message ||
          t('discounts.form.created_failed', {
            defaultValue: 'Failed to create discount',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/discounts' })
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
              {t('discounts.create_title', { defaultValue: 'Create Discount' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('discounts.create_description', {
                defaultValue: 'Create a new discount',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Discount Form */}
      <Card>
        <CardContent className="pt-6">
          <DiscountForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            submitLabel={t('discounts.form.create', { defaultValue: 'Create' })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
