import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { CreatePlanInput, UpdatePlanInput } from '@/types'

interface PlanFormValues extends Omit<
  CreatePlanInput,
  'isActive' | 'hasTrial' | 'isVisible'
> {
  isActive: boolean
  hasTrial: boolean
  isVisible: boolean
}

interface PlanFormProps {
  initialData?: Partial<PlanFormValues>
  onSubmit: (
    data: CreatePlanInput | UpdatePlanInput,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
}

export function PlanForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
}: PlanFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      intervalId: initialData?.intervalId || '',
      productId: initialData?.productId || '',
      intervalCount: initialData?.intervalCount || 1,
      type: initialData?.type || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
      hasTrial: initialData?.hasTrial ?? false,
      trialIntervalId: initialData?.trialIntervalId || '',
      trialIntervalCount: initialData?.trialIntervalCount || 0,
      maxUsersPerTenant: initialData?.maxUsersPerTenant || 0,
      meterId: initialData?.meterId || '',
      isVisible: initialData?.isVisible ?? true,
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Name */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return t('plans.form.name_required', {
                  defaultValue: 'Plan name is required',
                })
              }
              if (value.trim().length < 3) {
                return t('plans.form.name_min', {
                  defaultValue: 'Name must be at least 3 characters',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('plans.form.name', { defaultValue: 'Plan Name' })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('plans.form.name_placeholder', {
                  defaultValue: 'My Plan',
                })}
              />
              <FieldDescription>
                {t('plans.form.name_description', {
                  defaultValue: 'The display name for your plan.',
                })}
              </FieldDescription>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Slug */}
        <form.Field
          name="slug"
          validators={{
            onChange: ({ value }) => {
              if (value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
                return t('plans.form.slug_invalid', {
                  defaultValue:
                    'Slug must be lowercase alphanumeric with hyphens',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('plans.form.slug', { defaultValue: 'Slug' })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('plans.form.slug_placeholder', {
                  defaultValue: 'my-plan',
                })}
              />
              <FieldDescription>
                {t('plans.form.slug_description', {
                  defaultValue: 'Optional, auto-generated if left empty.',
                })}
              </FieldDescription>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Type */}
        <form.Field
          name="type"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return t('plans.form.type_required', {
                  defaultValue: 'Plan type is required',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('plans.form.type', { defaultValue: 'Type' })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('plans.form.type_placeholder', {
                  defaultValue: 'subscription',
                })}
              />
              <FieldDescription>
                {t('plans.form.type_description', {
                  defaultValue:
                    'The type of plan (e.g., subscription, one-time).',
                })}
              </FieldDescription>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Product ID */}
        <form.Field
          name="productId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return t('plans.form.product_id_required', {
                  defaultValue: 'Product ID is required',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('plans.form.product_id', { defaultValue: 'Product ID' })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('plans.form.product_id_placeholder', {
                  defaultValue: '1',
                })}
              />
              <FieldDescription>
                {t('plans.form.product_id_description', {
                  defaultValue: 'The product this plan belongs to.',
                })}
              </FieldDescription>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Interval ID */}
        <form.Field
          name="intervalId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return t('plans.form.interval_id_required', {
                  defaultValue: 'Interval ID is required',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('plans.form.interval_id', { defaultValue: 'Interval ID' })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('plans.form.interval_id_placeholder', {
                  defaultValue: '1',
                })}
              />
              <FieldDescription>
                {t('plans.form.interval_id_description', {
                  defaultValue: 'The billing interval (e.g., monthly, yearly).',
                })}
              </FieldDescription>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Interval Count */}
        <form.Field
          name="intervalCount"
          validators={{
            onChange: ({ value }) => {
              if (value < 1) {
                return t('plans.form.interval_count_min', {
                  defaultValue: 'Interval count must be at least 1',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('plans.form.interval_count', {
                  defaultValue: 'Interval Count',
                })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(parseInt(e.target.value, 10))
                }
                placeholder="1"
              />
              <FieldDescription>
                {t('plans.form.interval_count_description', {
                  defaultValue: 'Number of intervals for billing.',
                })}
              </FieldDescription>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Max Users Per Tenant */}
        <form.Field name="maxUsersPerTenant">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('plans.form.max_users_per_tenant', {
                  defaultValue: 'Max Users Per Tenant',
                })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                min="0"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(parseInt(e.target.value, 10))
                }
                placeholder="0"
              />
              <FieldDescription>
                {t('plans.form.max_users_per_tenant_description', {
                  defaultValue:
                    'Maximum users allowed per tenant (0 for unlimited).',
                })}
              </FieldDescription>
            </Field>
          )}
        </form.Field>

        {/* Meter ID */}
        <form.Field name="meterId">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                {t('plans.form.meter_id', { defaultValue: 'Meter ID' })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('plans.form.meter_id_placeholder', {
                  defaultValue: 'Optional',
                })}
              />
              <FieldDescription>
                {t('plans.form.meter_id_description', {
                  defaultValue: 'Meter ID for usage-based billing (optional).',
                })}
              </FieldDescription>
            </Field>
          )}
        </form.Field>
      </div>

      {/* Description - Full width */}
      <form.Field name="description">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('plans.form.description', { defaultValue: 'Description' })}
            </FieldLabel>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('plans.form.description_placeholder', {
                defaultValue: 'Plan description...',
              })}
              rows={4}
            />
            <FieldDescription>
              {t('plans.form.description_description', {
                defaultValue: 'A brief description of the plan.',
              })}
            </FieldDescription>
          </Field>
        )}
      </form.Field>

      {/* Trial Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-medium">
          {t('plans.form.trial_settings', { defaultValue: 'Trial Settings' })}
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Has Trial */}
          <form.Field name="hasTrial">
            {(field) => (
              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                  />
                  <FieldLabel htmlFor={field.name} className="cursor-pointer">
                    {t('plans.form.has_trial', { defaultValue: 'Has Trial' })}
                  </FieldLabel>
                </div>
                <FieldDescription>
                  {t('plans.form.has_trial_description', {
                    defaultValue: 'Enable trial period for this plan.',
                  })}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Trial Interval ID */}
          <form.Field name="trialIntervalId">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('plans.form.trial_interval_id', {
                    defaultValue: 'Trial Interval ID',
                  })}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t('plans.form.trial_interval_id_placeholder', {
                    defaultValue: 'Optional',
                  })}
                  disabled={!form.state.values.hasTrial}
                />
                <FieldDescription>
                  {t('plans.form.trial_interval_id_description', {
                    defaultValue: 'Interval for trial period.',
                  })}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Trial Interval Count */}
          <form.Field name="trialIntervalCount">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('plans.form.trial_interval_count', {
                    defaultValue: 'Trial Interval Count',
                  })}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(parseInt(e.target.value, 10))
                  }
                  placeholder="0"
                  disabled={!form.state.values.hasTrial}
                />
                <FieldDescription>
                  {t('plans.form.trial_interval_count_description', {
                    defaultValue: 'Number of intervals for trial period.',
                  })}
                </FieldDescription>
              </Field>
            )}
          </form.Field>
        </div>
      </div>

      {/* Status Checkboxes */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-medium">
          {t('plans.form.status_settings', { defaultValue: 'Status Settings' })}
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Is Active */}
          <form.Field name="isActive">
            {(field) => (
              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                  />
                  <FieldLabel htmlFor={field.name} className="cursor-pointer">
                    {t('plans.form.is_active', { defaultValue: 'Active' })}
                  </FieldLabel>
                </div>
                <FieldDescription>
                  {t('plans.form.is_active_description', {
                    defaultValue: 'Mark this plan as active.',
                  })}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Is Visible */}
          <form.Field name="isVisible">
            {(field) => (
              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(!!checked)}
                  />
                  <FieldLabel htmlFor={field.name} className="cursor-pointer">
                    {t('plans.form.is_visible', { defaultValue: 'Visible' })}
                  </FieldLabel>
                </div>
                <FieldDescription>
                  {t('plans.form.is_visible_description', {
                    defaultValue: 'Show this plan to customers.',
                  })}
                </FieldDescription>
              </Field>
            )}
          </form.Field>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>

        {showCreateAnother && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleCreateAnother}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('plans.form.create_another', {
              defaultValue: 'Create & Create Another',
            })}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('plans.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
