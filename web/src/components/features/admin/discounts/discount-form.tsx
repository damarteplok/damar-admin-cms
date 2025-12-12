import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { CreateDiscountInput, UpdateDiscountInput } from '@/types'

interface DiscountFormValues extends Omit<
  CreateDiscountInput,
  'isActive' | 'isRecurring'
> {
  isActive: boolean
  isRecurring: boolean
}

interface DiscountFormProps {
  initialData?: Partial<DiscountFormValues>
  onSubmit: (
    data: CreateDiscountInput | UpdateDiscountInput,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
}

export function DiscountForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
}: DiscountFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || 'percentage',
      amount: initialData?.amount || 0,
      validUntil: initialData?.validUntil || undefined,
      isActive: initialData?.isActive ?? true,
      actionType: initialData?.actionType || '',
      maxRedemptions: initialData?.maxRedemptions || undefined,
      maxRedemptionsPerUser: initialData?.maxRedemptionsPerUser || undefined,
      isRecurring: initialData?.isRecurring ?? false,
      durationInMonths: initialData?.durationInMonths || undefined,
      maximumRecurringIntervals:
        initialData?.maximumRecurringIntervals || undefined,
      redeemType: initialData?.redeemType || undefined,
      bonusDays: initialData?.bonusDays || undefined,
      isEnabledForAllPlans: initialData?.isEnabledForAllPlans ?? false,
      isEnabledForAllOneTimeProducts:
        initialData?.isEnabledForAllOneTimeProducts ?? false,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        const success = await onSubmit(value, false)
        if (!success) {
          setIsSubmitting(false)
        }
      } catch (error) {
        setIsSubmitting(false)
        console.error('Form submission error:', error)
      }
    },
  })

  const handleCreateAnother = async () => {
    setIsSubmitting(true)
    try {
      const values = form.state.values
      const success = await onSubmit(values, true)
      if (success) {
        form.reset()
      }
      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      console.error('Form submission error:', error)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Name */}
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            if (!value || value.trim().length === 0) {
              return t('discounts.form.name_required', {
                defaultValue: 'Discount name is required',
              })
            }
            if (value.trim().length < 3) {
              return t('discounts.form.name_min', {
                defaultValue: 'Name must be at least 3 characters',
              })
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel>
              {t('discounts.form.name', { defaultValue: 'Discount Name' })}{' '}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              type="text"
              placeholder={t('discounts.form.name_placeholder', {
                defaultValue: 'Black Friday Sale',
              })}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('discounts.form.name_description', {
                defaultValue: 'The display name for your discount.',
              })}
            </FieldDescription>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </Field>
        )}
      </form.Field>

      {/* Description */}
      <form.Field name="description">
        {(field) => (
          <Field>
            <FieldLabel>
              {t('discounts.form.description', {
                defaultValue: 'Description',
              })}
            </FieldLabel>
            <Textarea
              placeholder={t('discounts.form.description_placeholder', {
                defaultValue: 'Optional description for this discount',
              })}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
            <FieldDescription>
              {t('discounts.form.description_description', {
                defaultValue: 'Optional detailed description.',
              })}
            </FieldDescription>
          </Field>
        )}
      </form.Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Type */}
        <form.Field name="type">
          {(field) => (
            <Field className="col-span-2">
              <FieldLabel>
                {t('discounts.form.type', { defaultValue: 'Discount Type' })}{' '}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <RadioGroup
                value={field.state.value}
                onValueChange={(value: string) => field.handleChange(value)}
                className="grid gap-4 pt-2 md:grid-cols-2"
              >
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="percentage"
                      className="font-medium cursor-pointer"
                    >
                      Percentage
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Discount as a percentage of the price.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="fixed"
                      className="font-medium cursor-pointer"
                    >
                      Fixed Amount
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Discount as a fixed dollar amount.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </Field>
          )}
        </form.Field>

        {/* Amount */}
        <form.Field
          name="amount"
          validators={{
            onChange: ({ value }) => {
              if (value <= 0) {
                return t('discounts.form.amount_positive', {
                  defaultValue: 'Amount must be greater than 0',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel>
                {t('discounts.form.amount', { defaultValue: 'Amount' })}{' '}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder={
                  form.state.values.type === 'percentage' ? '10' : '5.00'
                }
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                disabled={isSubmitting}
              />
              <FieldDescription>
                {t('discounts.form.amount_description', {
                  defaultValue:
                    'If you choose percentage, enter a number between 0 and 100. For example: 90 for 90%. For fixed amount, enter the amount in cents. For example: 1000 for $10.00',
                })}
              </FieldDescription>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Valid Until */}
        <form.Field name="validUntil">
          {(field) => (
            <Field>
              <FieldLabel>
                {t('discounts.form.valid_until', {
                  defaultValue: 'Valid Until',
                })}
              </FieldLabel>
              <Input
                type="datetime-local"
                value={
                  field.state.value
                    ? new Date(field.state.value * 1000)
                        .toISOString()
                        .slice(0, 16)
                    : ''
                }
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const date = e.target.value
                    ? new Date(e.target.value).getTime() / 1000
                    : undefined
                  field.handleChange(date)
                }}
                disabled={isSubmitting}
              />
              <FieldDescription>
                {t('discounts.form.valid_until_description', {
                  defaultValue: 'Optional expiration date for this discount.',
                })}
              </FieldDescription>
            </Field>
          )}
        </form.Field>

        {/* Max Redemptions */}
        <form.Field name="maxRedemptions">
          {(field) => (
            <Field>
              <FieldLabel>
                {t('discounts.form.max_redemptions', {
                  defaultValue: 'Max Redemptions',
                })}
              </FieldLabel>
              <Input
                type="number"
                min="-1"
                placeholder="-1 for unlimited"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const val = e.target.value
                    ? Number(e.target.value)
                    : undefined
                  field.handleChange(val)
                }}
                disabled={isSubmitting}
              />
              <FieldDescription>
                {t('discounts.form.max_redemptions_description', {
                  defaultValue: 'Total redemptions allowed (-1 = unlimited).',
                })}
              </FieldDescription>
            </Field>
          )}
        </form.Field>

        {/* Max Redemptions Per User */}
        <form.Field name="maxRedemptionsPerUser">
          {(field) => (
            <Field>
              <FieldLabel>
                {t('discounts.form.max_redemptions_per_user', {
                  defaultValue: 'Max Per User',
                })}
              </FieldLabel>
              <Input
                type="number"
                min="-1"
                placeholder="-1 for unlimited"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  const val = e.target.value
                    ? Number(e.target.value)
                    : undefined
                  field.handleChange(val)
                }}
                disabled={isSubmitting}
              />
              <FieldDescription>
                {t('discounts.form.max_redemptions_per_user_description', {
                  defaultValue: 'Redemptions per user (-1 = unlimited).',
                })}
              </FieldDescription>
            </Field>
          )}
        </form.Field>
      </div>

      {/* Recurring Section */}
      <div className="space-y-4 rounded-lg border p-4">
        <form.Field name="isRecurring">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="isRecurring" className="cursor-pointer">
                {t('discounts.form.is_recurring', {
                  defaultValue: 'Apply to recurring payments',
                })}
              </Label>
            </div>
          )}
        </form.Field>

        {form.state.values.isRecurring && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="durationInMonths">
              {(field) => (
                <Field>
                  <FieldLabel>
                    {t('discounts.form.duration_in_months', {
                      defaultValue: 'Duration (Months)',
                    })}
                  </FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value
                        ? Number(e.target.value)
                        : undefined
                      field.handleChange(val)
                    }}
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    {t('discounts.form.duration_in_months_description', {
                      defaultValue: 'How many months the discount applies.',
                    })}
                  </FieldDescription>
                </Field>
              )}
            </form.Field>

            <form.Field name="maximumRecurringIntervals">
              {(field) => (
                <Field>
                  <FieldLabel>
                    {t('discounts.form.maximum_recurring_intervals', {
                      defaultValue: 'Max Intervals',
                    })}
                  </FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value
                        ? Number(e.target.value)
                        : undefined
                      field.handleChange(val)
                    }}
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    {t(
                      'discounts.form.maximum_recurring_intervals_description',
                      {
                        defaultValue: 'Maximum billing cycles to apply.',
                      },
                    )}
                  </FieldDescription>
                </Field>
              )}
            </form.Field>
          </div>
        )}
      </div>

      {/* Bonus Days */}
      <form.Field name="bonusDays">
        {(field) => (
          <Field>
            <FieldLabel>
              {t('discounts.form.bonus_days', { defaultValue: 'Bonus Days' })}
            </FieldLabel>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={field.state.value ?? ''}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined
                field.handleChange(val)
              }}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('discounts.form.bonus_days_description', {
                defaultValue: 'Additional days added when discount is applied.',
              })}
            </FieldDescription>
          </Field>
        )}
      </form.Field>

      {/* Checkboxes */}
      <div className="space-y-4 rounded-lg border p-4">
        <form.Field name="isActive">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {t('discounts.form.is_active', { defaultValue: 'Active' })}
              </Label>
            </div>
          )}
        </form.Field>

        <form.Field name="isEnabledForAllPlans">
          {(field) => (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEnabledForAllPlans"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="isEnabledForAllPlans"
                  className="cursor-pointer"
                >
                  {t('discounts.form.is_enabled_for_all_plans', {
                    defaultValue: 'Enable for all plans',
                  })}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {t('discounts.form.is_enabled_for_all_plans_description', {
                  defaultValue:
                    'If enabled, this discount will be applied to all plans. If disabled, you can select specific plans.',
                })}
              </p>
            </div>
          )}
        </form.Field>

        <form.Field name="isEnabledForAllOneTimeProducts">
          {(field) => (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEnabledForAllOneTimeProducts"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="isEnabledForAllOneTimeProducts"
                  className="cursor-pointer"
                >
                  {t('discounts.form.is_enabled_for_all_one_time_products', {
                    defaultValue: 'Enable for all one-time products',
                  })}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {t(
                  'discounts.form.is_enabled_for_all_one_time_products_description',
                  {
                    defaultValue:
                      'If enabled, this discount will be applied to all one-time products. If disabled, you can select specific one-time products.',
                  },
                )}
              </p>
            </div>
          )}
        </form.Field>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        {showCreateAnother && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCreateAnother}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('discounts.form.create_another', {
              defaultValue: 'Save & Create Another',
            })}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('discounts.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
