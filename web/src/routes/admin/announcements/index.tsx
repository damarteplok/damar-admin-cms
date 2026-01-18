import { createFileRoute } from '@tanstack/react-router'
import { CrudListPage } from '@/components/crud'
import { announcementsConfig } from '@/features/announcements'
import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@/types'

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
