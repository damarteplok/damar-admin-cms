import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CREATE_ANNOUNCEMENT_MUTATION } from '@/lib/graphql/announcement.graphql'
import type {
  CreateAnnouncementResponse,
  CreateAnnouncementInput,
} from '@/types'
import { AnnouncementForm } from '@/components/features/admin/announcements'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/admin/announcements/create')({
  component: CreateAnnouncementPage,
})

function CreateAnnouncementPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, createAnnouncementMutation] =
    useMutation<CreateAnnouncementResponse>(CREATE_ANNOUNCEMENT_MUTATION)

  const handleCreate = async (
    data: CreateAnnouncementInput,
    createAnother: boolean = false,
  ) => {
    const result = await createAnnouncementMutation({ input: data })

    if (result.data?.createAnnouncement.success) {
      toast.success(
        createAnother
          ? t('announcements.form.created_another', {
              defaultValue: 'Announcement created! Create another one.',
            })
          : t('announcements.form.created_success', {
              defaultValue: 'Announcement created successfully!',
            }),
      )

      if (!createAnother) {
        navigate({ to: '/admin/announcements' })
      }
      return true
    } else {
      toast.error(
        result.data?.createAnnouncement.message ||
          t('announcements.form.created_failed', {
            defaultValue: 'Failed to create announcement',
          }),
      )
      return false
    }
  }

  const handleCancel = () => navigate({ to: '/admin/announcements' })

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
              {t('announcements.create_title', {
                defaultValue: 'Create Announcement',
              })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('announcements.create_description', {
                defaultValue:
                  'Create a new announcement to display to your users.',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardContent className="pt-6">
          <AnnouncementForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            submitLabel={t('announcements.form.create', {
              defaultValue: 'Create',
            })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
