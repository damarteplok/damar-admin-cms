import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { CreateProductInput, UpdateProductInput } from '@/types'
import { MetadataInput, MetadataItem } from './metadata-input'
import { FeaturesInput } from './features-input'

interface ProductFormProps {
  initialData?: Partial<CreateProductInput>
  onSubmit: (
    data: CreateProductInput | UpdateProductInput,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
}: ProductFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Parse metadata and features from JSON strings
  const parseMetadata = (metadataStr?: string): MetadataItem[] => {
    if (!metadataStr) return []
    try {
      const parsed = JSON.parse(metadataStr)
      return Object.entries(parsed).map(([name, value]) => ({
        name,
        value: String(value),
      }))
    } catch {
      return []
    }
  }

  const parseFeatures = (featuresStr?: string): string[] => {
    if (!featuresStr) return []
    try {
      const parsed = JSON.parse(featuresStr)
      // If it's an object with numeric keys, convert to array
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.keys(parsed)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((key) => parsed[key])
      }
      // If it's already an array, return as is (backward compatibility)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      isPopular: initialData?.isPopular || false,
      isDefault: initialData?.isDefault || false,
      metadata: parseMetadata(initialData?.metadata),
      features: parseFeatures(initialData?.features),
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        // Ensure metadata and features are arrays
        const metadataArray = Array.isArray(value.metadata)
          ? value.metadata
          : []
        const featuresArray = Array.isArray(value.features)
          ? value.features
          : []

        // Convert metadata array to JSON string object
        const metadataObj = metadataArray.reduce(
          (acc, item) => {
            acc[item.name] = item.value
            return acc
          },
          {} as Record<string, string>,
        )

        // Convert features array to JSON object with index as key
        const featuresObj = featuresArray.reduce(
          (acc, feature, index) => {
            acc[index.toString()] = feature
            return acc
          },
          {} as Record<string, string>,
        )

        // Convert to JSON strings
        const submitData = {
          ...value,
          metadata: JSON.stringify(metadataObj),
          features: JSON.stringify(featuresObj),
        }

        const success = await onSubmit(submitData, false)
        if (!success) {
          setIsSubmitting(false)
        }
        // If success, parent component will handle navigation
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

      // Ensure metadata and features are arrays
      const metadataArray = Array.isArray(values.metadata)
        ? values.metadata
        : []
      const featuresArray = Array.isArray(values.features)
        ? values.features
        : []

      // Convert metadata array to JSON string object
      const metadataObj = metadataArray.reduce(
        (acc, item) => {
          acc[item.name] = item.value
          return acc
        },
        {} as Record<string, string>,
      )

      // Convert features array to JSON object with index as key
      const featuresObj = featuresArray.reduce(
        (acc, feature, index) => {
          acc[index.toString()] = feature
          return acc
        },
        {} as Record<string, string>,
      )

      // Convert to JSON strings
      const submitData = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        isPopular: values.isPopular,
        isDefault: values.isDefault,
        metadata: JSON.stringify(metadataObj),
        features: JSON.stringify(featuresObj),
      }

      const success = await onSubmit(submitData, true)
      if (success) {
        // Reset form for creating another
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
                return t('products.form.name_required', {
                  defaultValue: 'Product name is required',
                })
              }
              if (value.trim().length < 3) {
                return t('products.form.name_min', {
                  defaultValue: 'Name must be at least 3 characters',
                })
              }
              if (value.length > 100) {
                return t('products.form.name_max', {
                  defaultValue: 'Name must not exceed 100 characters',
                })
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel>
                {t('products.form.name', { defaultValue: 'Product Name' })}{' '}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                type="text"
                placeholder={t('products.form.name_placeholder', {
                  defaultValue: 'My Product',
                })}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isSubmitting}
              />
              <FieldDescription>
                {t('products.form.name_description', {
                  defaultValue: 'The display name for your product.',
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

        {/* Slug */}
        <form.Field
          name="slug"
          validators={{
            onChange: ({ value }) => {
              if (value && value.trim().length > 0) {
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
                  return t('products.form.slug_invalid', {
                    defaultValue:
                      'Slug must be lowercase alphanumeric with hyphens',
                  })
                }
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Field>
              <FieldLabel>
                {t('products.form.slug', { defaultValue: 'Slug' })}
              </FieldLabel>
              <Input
                type="text"
                placeholder={t('products.form.slug_placeholder', {
                  defaultValue: 'my-product',
                })}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isSubmitting || !!initialData?.slug}
              />
              <FieldDescription>
                {t('products.form.slug_description', {
                  defaultValue: 'Optional, auto-generated if left empty.',
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
      </div>

      {/* Description */}
      <form.Field name="description">
        {(field) => (
          <Field>
            <FieldLabel>
              {t('products.form.description', { defaultValue: 'Description' })}
            </FieldLabel>
            <Textarea
              placeholder={t('products.form.description_placeholder', {
                defaultValue: 'Product description...',
              })}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('products.form.description_description', {
                defaultValue: 'A brief description of the product.',
              })}
            </FieldDescription>
          </Field>
        )}
      </form.Field>

      {/* Metadata */}
      <form.Field name="metadata">
        {(field) => (
          <MetadataInput
            value={field.state.value}
            onChange={(metadata) => field.handleChange(metadata)}
            disabled={isSubmitting}
          />
        )}
      </form.Field>

      {/* Features */}
      <form.Field name="features">
        {(field) => (
          <FeaturesInput
            value={field.state.value}
            onChange={(features) => field.handleChange(features)}
            disabled={isSubmitting}
          />
        )}
      </form.Field>

      <div className="flex gap-6">
        {/* Is Popular */}
        <form.Field name="isPopular">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPopular"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                disabled={isSubmitting}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="isPopular"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('products.form.is_popular', { defaultValue: 'Popular' })}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t('products.form.is_popular_description', {
                    defaultValue: 'Mark this product as popular.',
                  })}
                </p>
              </div>
            </div>
          )}
        </form.Field>

        {/* Is Default */}
        <form.Field name="isDefault">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                disabled={isSubmitting}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('products.form.is_default', { defaultValue: 'Default' })}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t('products.form.is_default_description', {
                    defaultValue: 'Mark this product as default.',
                  })}
                </p>
              </div>
            </div>
          )}
        </form.Field>
      </div>

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
            {t('products.form.create_another', {
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
          {t('products.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
