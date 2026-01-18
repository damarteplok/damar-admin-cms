import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Loader2 } from 'lucide-react'
import type { CreateRoleInput, UpdateRoleInput } from '@/types'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface RoleFormProps {
  initialData?: Partial<CreateRoleInput>
  onSubmit: (
    data: CreateRoleInput | UpdateRoleInput,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
  isEditMode?: boolean
}

export function RoleForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
}: RoleFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      guardName: initialData?.guardName || 'web',
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
      {/* Role Name */}
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            if (!value || value.trim().length === 0) {
              return t('roles.form.name_required', {
                defaultValue: 'Role name is required',
              })
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('roles.form.name', { defaultValue: 'Role Name' })}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('roles.form.name_placeholder', {
                defaultValue: 'e.g. admin, editor, viewer',
              })}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('roles.form.name_description', {
                defaultValue: 'A unique identifier for the role.',
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

      {/* Guard Name */}
      <form.Field name="guardName">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('roles.form.guard_name', { defaultValue: 'Guard Name' })}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="web"
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('roles.form.guard_name_description', {
                defaultValue:
                  'The authentication guard this role applies to. Default is "web".',
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
            {t('roles.form.create_another', {
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
          {t('roles.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
