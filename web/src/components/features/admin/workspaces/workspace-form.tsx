import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface WorkspaceFormValues {
  name: string
  slug?: string
  domain?: string
}

interface WorkspaceFormProps {
  initialData?: Partial<WorkspaceFormValues>
  onSubmit: (
    data: WorkspaceFormValues,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
}

export function WorkspaceForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
}: WorkspaceFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      domain: initialData?.domain || '',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        const success = await onSubmit(value, false)
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
      const success = await onSubmit(values, true)
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
      {/* Row 1: Name and Slug */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return t('workspaces.form.workspace_name_required', {
                  defaultValue: 'Workspace name is required',
                })
              }
              if (value.trim().length < 3) {
                return t('workspaces.form.workspace_name_min', {
                  defaultValue: 'Name must be at least 3 characters',
                })
              }
              if (value.length > 100) {
                return t('workspaces.form.workspace_name_max', {
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
                {t('workspaces.form.workspace_name', {
                  defaultValue: 'Workspace Name',
                })}{' '}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                type="text"
                placeholder={t('workspaces.form.workspace_name_placeholder', {
                  defaultValue: 'My Workspace',
                })}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isSubmitting}
              />
              <FieldDescription>
                {t('workspaces.form.workspace_name_description', {
                  defaultValue: 'The display name for your workspace.',
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

        <form.Field
          name="slug"
          validators={{
            onChange: ({ value }) => {
              if (value && value.trim().length > 0) {
                if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
                  return t('workspaces.form.slug_invalid', {
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
                {t('workspaces.form.slug', { defaultValue: 'Slug' })}
              </FieldLabel>
              <Input
                type="text"
                placeholder={t('workspaces.form.slug_placeholder', {
                  defaultValue: 'my-workspace',
                })}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isSubmitting || !!initialData?.slug}
              />
              <FieldDescription>
                {t('workspaces.form.slug_description', {
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

      {/* Row 2: Domain */}
      <form.Field
        name="domain"
        validators={{
          onChange: ({ value }) => {
            if (value && value.trim().length > 0) {
              if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(value)) {
                return t('workspaces.form.domain_invalid', {
                  defaultValue:
                    'Please enter a valid domain (e.g., example.com)',
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
              {t('workspaces.form.domain', { defaultValue: 'Domain' })}
            </FieldLabel>
            <Input
              type="text"
              placeholder={t('workspaces.form.domain_placeholder', {
                defaultValue: 'workspace.example.com',
              })}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('workspaces.form.domain_description', {
                defaultValue: 'Custom domain for this workspace (optional).',
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
            {t('workspaces.form.create_another', {
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
          {t('workspaces.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
