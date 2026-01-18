import { createFileRoute } from '@tanstack/react-router'
import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@/types'
import { CrudCreatePage } from '@/components/crud'
import { announcementsConfig } from '@/features/announcements'

export const Route = createFileRoute('/admin/announcements/create')({
  component: CreateAnnouncementPage,
})

function CreateAnnouncementPage() {
  return (
    <CrudCreatePage<
      Announcement,
      CreateAnnouncementInput,
      UpdateAnnouncementInput
    >
      config={announcementsConfig}
    />
  )
}
