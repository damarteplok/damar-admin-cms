import { createFileRoute } from '@tanstack/react-router'
import { CrudCreatePage } from '@/components/crud'
import { announcementsConfig } from '@/features/announcements'
import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@/types'

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
