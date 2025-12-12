import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { UpdateProfileInput } from '@/types'

interface ProfileFormProps {
  initialData?: Partial<UpdateProfileInput>
  onSubmit: (data: UpdateProfileInput) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  isOwnProfile?: boolean
}

export function ProfileForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Changes',
  isOwnProfile = false,
}: ProfileFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      publicName: initialData?.publicName || '',
      phoneNumber: initialData?.phoneNumber || '',
      position: initialData?.position || '',
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        const submitData: UpdateProfileInput = {
          id: initialData?.id || '',
          name: value.name,
          email: value.email || undefined,
          publicName: value.publicName || undefined,
          phoneNumber: value.phoneNumber || undefined,
          position: value.position || undefined,
        }

        const success = await onSubmit(submitData)
        if (!success) {
          setIsSubmitting(false)
        }
      } catch (error) {
        setIsSubmitting(false)
        console.error('Form submission error:', error)
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Name Field */}
      <form.Field name="name">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="required">
              {t('profile.form.name', { defaultValue: 'Full Name' })}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('profile.form.name_placeholder', {
                defaultValue: 'Enter your full name',
              })}
              disabled={isSubmitting}
            />
            {field.state.meta.errors && (
              <FieldDescription className="text-destructive">
                {field.state.meta.errors}
              </FieldDescription>
            )}
          </Field>
        )}
      </form.Field>

      {/* Email Field (optional, disabled for own profile) */}
      <form.Field name="email">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('profile.form.email', { defaultValue: 'Email Address' })}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('profile.form.email_placeholder', {
                defaultValue: 'your.email@example.com',
              })}
              disabled={isSubmitting || isOwnProfile}
            />
            {isOwnProfile && (
              <FieldDescription>
                {t('profile.form.email_disabled', {
                  defaultValue: 'Email cannot be changed',
                })}
              </FieldDescription>
            )}
          </Field>
        )}
      </form.Field>

      {/* Public Name Field */}
      <form.Field name="publicName">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('profile.form.public_name', { defaultValue: 'Display Name' })}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('profile.form.public_name_placeholder', {
                defaultValue: 'How others see your name',
              })}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('profile.form.public_name_help', {
                defaultValue: 'This name will be visible to other users',
              })}
            </FieldDescription>
          </Field>
        )}
      </form.Field>

      {/* Phone Number Field */}
      <form.Field name="phoneNumber">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('profile.form.phone', { defaultValue: 'Phone Number' })}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="tel"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('profile.form.phone_placeholder', {
                defaultValue: '+1 (555) 000-0000',
              })}
              disabled={isSubmitting}
            />
          </Field>
        )}
      </form.Field>

      {/* Position Field */}
      <form.Field name="position">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('profile.form.position', { defaultValue: 'Job Title' })}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('profile.form.position_placeholder', {
                defaultValue: 'e.g. Senior Developer',
              })}
              disabled={isSubmitting}
            />
          </Field>
        )}
      </form.Field>

      {/* Form Actions */}
      <div className="flex gap-3 justify-start pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
