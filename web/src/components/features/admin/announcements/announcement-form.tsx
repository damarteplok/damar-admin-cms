import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Loader2 } from 'lucide-react'
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from '@/types'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

interface AnnouncementFormValues extends Omit<
  CreateAnnouncementInput,
  'startsAt' | 'endsAt'
> {
  startsAtDate: string
  startsAtTime: string
  endsAtDate: string
  endsAtTime: string
  isActive: boolean
  isDismissible: boolean
  showForCustomers: boolean
  showOnFrontend: boolean
  showOnUserDashboard: boolean
}

interface AnnouncementFormProps {
  initialData?: Partial<CreateAnnouncementInput>
  onSubmit: (
    data: CreateAnnouncementInput | UpdateAnnouncementInput,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
  isEditMode?: boolean
}

// Helper functions for date/time conversion
function timestampToDate(timestamp?: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return date.toISOString().split('T')[0]
}

function timestampToTime(timestamp?: number | null): string {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return date.toTimeString().slice(0, 5)
}

function dateTimeToTimestamp(date: string, time: string): number | undefined {
  if (!date) return undefined
  const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`
  return Math.floor(new Date(dateTime).getTime() / 1000)
}

export function AnnouncementForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
  isEditMode = false,
}: AnnouncementFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      startsAtDate: timestampToDate(initialData?.startsAt),
      startsAtTime: timestampToTime(initialData?.startsAt),
      endsAtDate: timestampToDate(initialData?.endsAt),
      endsAtTime: timestampToTime(initialData?.endsAt),
      isActive: initialData?.isActive ?? true,
      isDismissible: initialData?.isDismissible ?? true,
      showForCustomers: initialData?.showForCustomers ?? true,
      showOnFrontend: initialData?.showOnFrontend ?? true,
      showOnUserDashboard: initialData?.showOnUserDashboard ?? true,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        const submitData: CreateAnnouncementInput | UpdateAnnouncementInput = {
          title: value.title,
          content: value.content,
          startsAt: dateTimeToTimestamp(value.startsAtDate, value.startsAtTime),
          endsAt: dateTimeToTimestamp(value.endsAtDate, value.endsAtTime),
          isActive: value.isActive,
          isDismissible: value.isDismissible,
          showForCustomers: value.showForCustomers,
          showOnFrontend: value.showOnFrontend,
          showOnUserDashboard: value.showOnUserDashboard,
        }

        const success = await onSubmit(submitData, false)
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
      const submitData: CreateAnnouncementInput = {
        title: values.title,
        content: values.content,
        startsAt: dateTimeToTimestamp(values.startsAtDate, values.startsAtTime),
        endsAt: dateTimeToTimestamp(values.endsAtDate, values.endsAtTime),
        isActive: values.isActive,
        isDismissible: values.isDismissible,
        showForCustomers: values.showForCustomers,
        showOnFrontend: values.showOnFrontend,
        showOnUserDashboard: values.showOnUserDashboard,
      }

      const success = await onSubmit(submitData, true)
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
      {/* Title */}
      <form.Field
        name="title"
        validators={{
          onChange: ({ value }) => {
            if (!value || value.trim().length === 0) {
              return t('announcements.form.title_required', {
                defaultValue: 'Title is required',
              })
            }
            if (value.trim().length < 3) {
              return t('announcements.form.title_min', {
                defaultValue: 'Title must be at least 3 characters',
              })
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('announcements.form.title', { defaultValue: 'Title' })}
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('announcements.form.title_placeholder', {
                defaultValue: 'System Maintenance Scheduled',
              })}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('announcements.form.title_description', {
                defaultValue: 'A clear, concise title for your announcement.',
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

      {/* Content (Rich Text Editor) */}
      <form.Field
        name="content"
        validators={{
          onChange: ({ value }) => {
            if (!value || value.trim().length === 0) {
              return t('announcements.form.content_required', {
                defaultValue: 'Content is required',
              })
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              {t('announcements.form.content', { defaultValue: 'Content' })}
            </FieldLabel>
            <RichTextEditor
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              placeholder={t('announcements.form.content_placeholder', {
                defaultValue: 'Enter your announcement content here...',
              })}
              disabled={isSubmitting}
            />
            <FieldDescription>
              {t('announcements.form.content_description', {
                defaultValue:
                  'The full content of your announcement. Supports HTML formatting.',
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

      {/* Schedule Section */}
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-semibold">
          {t('announcements.form.schedule', { defaultValue: 'Schedule' })}
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Start Date */}
          <form.Field name="startsAtDate">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('announcements.form.starts_at_date', {
                    defaultValue: 'Start Date',
                  })}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  {t('announcements.form.starts_at_description', {
                    defaultValue: 'When the announcement becomes visible.',
                  })}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Start Time */}
          <form.Field name="startsAtTime">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('announcements.form.starts_at_time', {
                    defaultValue: 'Start Time',
                  })}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="time"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>
            )}
          </form.Field>

          {/* End Date */}
          <form.Field name="endsAtDate">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('announcements.form.ends_at_date', {
                    defaultValue: 'End Date',
                  })}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  {t('announcements.form.ends_at_description', {
                    defaultValue: 'When the announcement stops being visible.',
                  })}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* End Time */}
          <form.Field name="endsAtTime">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('announcements.form.ends_at_time', {
                    defaultValue: 'End Time',
                  })}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="time"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>
            )}
          </form.Field>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-semibold">
          {t('announcements.form.visibility', {
            defaultValue: 'Visibility Settings',
          })}
        </h3>

        <div className="space-y-3">
          {/* Show on Frontend */}
          <form.Field name="showOnFrontend">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(Boolean(checked))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  {t('announcements.form.show_on_frontend', {
                    defaultValue: 'Show on Frontend',
                  })}
                </Label>
              </div>
            )}
          </form.Field>

          {/* Show on User Dashboard */}
          <form.Field name="showOnUserDashboard">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(Boolean(checked))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  {t('announcements.form.show_on_user_dashboard', {
                    defaultValue: 'Show on User Dashboard',
                  })}
                </Label>
              </div>
            )}
          </form.Field>

          {/* Show for Customers */}
          <form.Field name="showForCustomers">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(Boolean(checked))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  {t('announcements.form.show_for_customers', {
                    defaultValue: 'Show for Customers',
                  })}
                </Label>
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Behavior Settings */}
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-semibold">
          {t('announcements.form.behavior', { defaultValue: 'Behavior' })}
        </h3>

        <div className="space-y-3">
          {/* Is Active */}
          <form.Field name="isActive">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(Boolean(checked))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  {t('announcements.form.is_active', {
                    defaultValue: 'Active',
                  })}
                </Label>
              </div>
            )}
          </form.Field>

          {/* Is Dismissible */}
          <form.Field name="isDismissible">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(Boolean(checked))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  {t('announcements.form.is_dismissible', {
                    defaultValue: 'Allow users to dismiss',
                  })}
                </Label>
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
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
            {t('announcements.form.create_another', {
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
          {t('announcements.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
