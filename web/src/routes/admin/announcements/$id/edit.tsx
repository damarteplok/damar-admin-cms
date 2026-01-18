import { createFileRoute } from '@tanstack/react-router'
import { CrudEditPage } from '@/components/crud'
import {
  announcementsConfig,
  transformAnnouncementToFormData,
} from '@/features/announcements'
import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@/types'

export const Route = createFileRoute('/admin/announcements/$id/edit')({
  component: EditAnnouncementPage,
})

function EditAnnouncementPage() {
  return (
    <CrudEditPage<
      Announcement,
      CreateAnnouncementInput,
      UpdateAnnouncementInput
    >
      config={announcementsConfig}
      routePath="/admin/announcements/$id/edit"
      transformToFormData={transformAnnouncementToFormData}
    />
  )
}
