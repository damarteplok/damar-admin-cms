import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { ChangePasswordInput } from '@/types'

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordInput) => Promise<boolean>
  onCancel: () => void
}

export function ChangePasswordForm({
  onSubmit,
  onCancel,
}: ChangePasswordFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      if (value.newPassword !== value.confirmPassword) {
        alert(
          t('profile.password.mismatch', {
            defaultValue: 'New passwords do not match',
          }),
        )
        return
      }

      if (value.newPassword.length < 8) {
        alert(
          t('profile.password.too_short', {
            defaultValue: 'Password must be at least 8 characters',
          }),
        )
        return
      }

      setIsSubmitting(true)
      try {
        const submitData: ChangePasswordInput = {
          oldPassword: value.oldPassword,
          newPassword: value.newPassword,
        }

        const success = await onSubmit(submitData)
        if (success) {
          form.reset()
        } else {
          setIsSubmitting(false)
        }
      } catch (error) {
        setIsSubmitting(false)
        console.error('Password change error:', error)
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
      {/* Current Password */}
      <form.Field name="oldPassword">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="required">
              {t('profile.password.current', {
                defaultValue: 'Current Password',
              })}
            </FieldLabel>
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type={showOldPassword ? 'text' : 'password'}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('profile.password.current_placeholder', {
                  defaultValue: 'Enter your current password',
                })}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showOldPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </Field>
        )}
      </form.Field>

      {/* New Password */}
      <form.Field name="newPassword">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="required">
              {t('profile.password.new', { defaultValue: 'New Password' })}
            </FieldLabel>
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type={showNewPassword ? 'text' : 'password'}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('profile.password.new_placeholder', {
                  defaultValue: 'Enter new password (min 8 characters)',
                })}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <FieldDescription>
              {t('profile.password.requirements', {
                defaultValue: 'Must be at least 8 characters long',
              })}
            </FieldDescription>
          </Field>
        )}
      </form.Field>

      {/* Confirm Password */}
      <form.Field name="confirmPassword">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="required">
              {t('profile.password.confirm', {
                defaultValue: 'Confirm New Password',
              })}
            </FieldLabel>
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type={showConfirmPassword ? 'text' : 'password'}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t('profile.password.confirm_placeholder', {
                  defaultValue: 'Re-enter new password',
                })}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </Field>
        )}
      </form.Field>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('profile.password.change_button', {
            defaultValue: 'Change Password',
          })}
        </Button>
      </div>
    </form>
  )
}
