import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

import {
  GET_ANNOUNCEMENT_QUERY,
  UPDATE_ANNOUNCEMENT_MUTATION,
} from '@/lib/graphql/announcement.graphql'
import type {
  AnnouncementResponse,
  UpdateAnnouncementInput,
  CreateAnnouncementInput,
} from '@/types'
import { AnnouncementForm } from '@/components/features/admin/announcements'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

export const Route = createFileRoute('/admin/announcements/$id/edit')({
  component: EditAnnouncementPage,
})

function EditAnnouncementPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [result] = useQuery<AnnouncementResponse>({
    query: GET_ANNOUNCEMENT_QUERY,
    variables: { id },
  })

  const [, updateAnnouncementMutation] = useMutation(
    UPDATE_ANNOUNCEMENT_MUTATION,
  )

  const handleUpdate = async (
    data: UpdateAnnouncementInput | CreateAnnouncementInput,
  ) => {
    const result = await updateAnnouncementMutation({
      id,
      input: {
        id,
        ...data,
      } as UpdateAnnouncementInput,
    })

    if (result.data?.updateAnnouncement.success) {
      toast.success(
        t('announcements.form.updated_success', {
          defaultValue: 'Announcement updated successfully!',
        }),
      )
      navigate({ to: `/admin/announcements/${id}` })
      return true
    } else {
      toast.error(
        result.data?.updateAnnouncement.message ||
          t('announcements.form.updated_failed', {
            defaultValue: 'Failed to update announcement',
          }),
      )
      return false
    }
  }

  const handleCancel = () => navigate({ to: `/admin/announcements/${id}` })

  if (result.fetching) {
    return <DataTableSkeleton rows={1} columns={1} />
  }

  if (result.error || !result.data?.announcement.success) {
    return (
      <ErrorState
        title={t('announcements.failed_to_load', {
          defaultValue: 'Failed to load announcement',
        })}
        description={result.error?.message || result.data?.announcement.message}
        action={
          <Button onClick={() => navigate({ to: '/admin/announcements' })}>
            Back to List
          </Button>
        }
      />
    )
  }

  const announcement = result.data.announcement.data

  // Convert null values to undefined for form compatibility
  const initialData = {
    ...announcement,
    startsAt: announcement.startsAt ?? undefined,
    endsAt: announcement.endsAt ?? undefined,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('announcements.edit_title', {
                defaultValue: 'Edit Announcement',
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('announcements.edit_description', {
                defaultValue: 'Update the announcement details.',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardContent className="pt-6">
          <AnnouncementForm
            initialData={initialData}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t('announcements.form.update', {
              defaultValue: 'Update',
            })}
            isEditMode={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
