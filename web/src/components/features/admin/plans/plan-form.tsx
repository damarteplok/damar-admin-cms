import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Label } from '@/components/ui/label'
import { SearchSelect } from '@/components/common/search-select'
import { Loader2 } from 'lucide-react'
import { CreatePlanInput, UpdatePlanInput } from '@/types'
import { GET_PRODUCTS_QUERY } from '@/lib/graphql/product.graphql'

// Static intervals data matching database
const INTERVALS = [
  { id: '4', name: 'Daily', slug: 'daily' },
  { id: '3', name: 'Weekly', slug: 'weekly' },
  { id: '1', name: 'Monthly', slug: 'monthly' },
  { id: '2', name: 'Yearly', slug: 'yearly' },
]

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
  isEditMode?: boolean
}

export function PlanForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
  isEditMode = false,
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
            <Field className="col-span-2">
              <FieldLabel>
                {t('plans.form.type', { defaultValue: 'Plan Type' })}
              </FieldLabel>
              <RadioGroup
                value={field.state.value}
                onValueChange={(value: string) => field.handleChange(value)}
                className="grid gap-4 pt-2"
              >
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="flat_rate" id="flat_rate" />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="flat_rate"
                      className="font-medium cursor-pointer"
                    >
                      Flat Rate
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Fixed price per billing cycle.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="per_unit" id="per_unit" />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="per_unit"
                      className="font-medium cursor-pointer"
                    >
                      Seat-Based
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Charge per seat/user for each billing cycle.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="tiered" id="tiered" />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="tiered"
                      className="font-medium cursor-pointer"
                    >
                      Usage-Based
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Price per unit with optional tiers.
                    </p>
                  </div>
                </div>
              </RadioGroup>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </Field>
          )}
        </form.Field>

        {/* Product */}
        <form.Field
          name="productId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return t('plans.form.product_required', {
                  defaultValue: 'Product is required',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel>
                {t('plans.form.product', { defaultValue: 'Product' })}
              </FieldLabel>
              <SearchSelect
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                query={GET_PRODUCTS_QUERY}
                queryKey="products"
                placeholder={t('plans.form.product_placeholder', {
                  defaultValue: 'Select a product...',
                })}
                searchPlaceholder={t('plans.form.product_search', {
                  defaultValue: 'Search products...',
                })}
                emptyText={t('plans.form.product_empty', {
                  defaultValue: 'No products found.',
                })}
                disabled={isEditMode}
                formatOption={(product: any) => ({
                  value: product.id,
                  label: product.name,
                })}
              />
              <FieldDescription>
                {isEditMode
                  ? t('plans.form.product_description_readonly', {
                      defaultValue:
                        'Product cannot be changed after plan creation.',
                    })
                  : t('plans.form.product_description', {
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

        {/* Billing Interval */}
        <form.Field
          name="intervalId"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return t('plans.form.interval_id_required', {
                  defaultValue: 'Billing interval is required',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel>
                {t('plans.form.billing_interval', {
                  defaultValue: 'Billing Interval',
                })}
              </FieldLabel>
              <SearchSelect
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                staticData={INTERVALS}
                placeholder={t('plans.form.interval_placeholder', {
                  defaultValue: 'Select interval...',
                })}
                formatOption={(interval: any) => ({
                  value: interval.id,
                  label: interval.name,
                })}
              />
              <FieldDescription>
                {t('plans.form.interval_description', {
                  defaultValue: 'How often customers will be billed.',
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

        {/* Meter ID - Only show for usage-based plans */}
        <form.Subscribe selector={(state) => state.values.type}>
          {(planType) =>
            (planType === 'per_unit' || planType === 'tiered') && (
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
                        defaultValue:
                          'Meter ID for usage-based billing (optional).',
                      })}
                    </FieldDescription>
                  </Field>
                )}
              </form.Field>
            )
          }
        </form.Subscribe>
      </div>

      {/* Description - Full width */}
      <form.Field name="description">
        {(field) => (
          <Field>
            <FieldLabel>
              {t('plans.form.description', { defaultValue: 'Description' })}
            </FieldLabel>
            <RichTextEditor
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
            />
            <FieldDescription>
              {t('plans.form.description_description', {
                defaultValue:
                  'A detailed description of the plan features and benefits.',
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
                    {t('plans.form.has_trial', {
                      defaultValue: 'Enable Trial Period',
                    })}
                  </FieldLabel>
                </div>
                <FieldDescription>
                  {t('plans.form.has_trial_description', {
                    defaultValue: 'Allow customers to try this plan for free.',
                  })}
                </FieldDescription>
              </Field>
            )}
          </form.Field>
        </div>

        {/* Trial Interval and Count - Only show when hasTrial is true */}
        <form.Subscribe selector={(state) => state.values.hasTrial}>
          {(hasTrial) =>
            hasTrial && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                {/* Trial Interval ID */}
                <form.Field name="trialIntervalId">
                  {(field) => (
                    <Field>
                      <FieldLabel>
                        {t('plans.form.trial_interval_id', {
                          defaultValue: 'Trial Interval',
                        })}
                      </FieldLabel>
                      <SearchSelect
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                        staticData={INTERVALS}
                        placeholder={t(
                          'plans.form.trial_interval_placeholder',
                          {
                            defaultValue: 'Select trial interval...',
                          },
                        )}
                        formatOption={(interval: any) => ({
                          value: interval.id,
                          label: interval.name,
                        })}
                      />
                      <FieldDescription>
                        {t('plans.form.trial_interval_description', {
                          defaultValue: 'Duration unit for trial period.',
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
                          defaultValue: 'Trial Duration',
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
                        {t('plans.form.trial_interval_count_description', {
                          defaultValue: 'Number of intervals for trial period.',
                        })}
                      </FieldDescription>
                    </Field>
                  )}
                </form.Field>
              </div>
            )
          }
        </form.Subscribe>
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
