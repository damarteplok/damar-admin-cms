import { createFileRoute } from '@tanstack/react-router'
import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@/types'
import { CrudListPage } from '@/components/crud'
import { announcementsConfig } from '@/features/announcements'

export const Route = createFileRoute('/admin/announcements/')({
  component: AnnouncementsPage,
})

function AnnouncementsPage() {
  return (
    <CrudListPage<
      Announcement,
      CreateAnnouncementInput,
      UpdateAnnouncementInput
    >
      config={announcementsConfig}
    />
  )
}
