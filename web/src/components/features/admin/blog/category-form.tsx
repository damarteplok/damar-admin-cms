import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import type { CreateCategoryInput, UpdateCategoryInput } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'

interface CategoryFormProps {
  initialData?: Partial<CreateCategoryInput>
  onSubmit: (
    data: CreateCategoryInput | UpdateCategoryInput,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
}

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
}: CategoryFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
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

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    form.setFieldValue('slug', slug)
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
        {/* Name Field */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return t('category.form.name_required', {
                  defaultValue: 'Category name is required',
                })
              }
              if (value.trim().length < 3) {
                return t('category.form.name_min', {
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
                {t('category.name_label', { defaultValue: 'Name' })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  handleNameChange(e.target.value)
                }}
                placeholder={t('category.name_placeholder', {
                  defaultValue: 'Enter category name',
                })}
              />
              <FieldDescription>
                {t('category.name_help', {
                  defaultValue:
                    'The name of the category (will auto-generate slug)',
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

        {/* Slug Field */}
        <form.Field
          name="slug"
          validators={{
            onChange: ({ value }) => {
              if (value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
                return t('category.form.slug_invalid', {
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
                {t('category.slug_label', { defaultValue: 'Slug' })}
              </FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('category.slug_placeholder', {
                  defaultValue: 'category-slug (auto-generated)',
                })}
              />
              <FieldDescription>
                {t('category.slug_help', {
                  defaultValue:
                    'URL-friendly version of the name (auto-generated if empty)',
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
            {t('category.form.create_another', {
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
          {t('category.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
