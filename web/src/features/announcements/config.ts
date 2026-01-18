import type { CrudConfig, CrudTranslations } from '@/types'
import type {
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@/types'

import {
  GET_ANNOUNCEMENTS_QUERY,
  GET_ANNOUNCEMENT_QUERY,
  CREATE_ANNOUNCEMENT_MUTATION,
  UPDATE_ANNOUNCEMENT_MUTATION,
  DELETE_ANNOUNCEMENT_MUTATION,
} from '@/lib/graphql/announcement.graphql'

import { createAnnouncementColumns } from '@/components/features/admin/announcements/announcement-columns'
import { AnnouncementForm } from '@/components/features/admin/announcements/announcement-form'

/**
 * CRUD Configuration for Announcements
 */
export const announcementsConfig: CrudConfig<
  Announcement,
  CreateAnnouncementInput,
  UpdateAnnouncementInput
> = {
  resourceName: 'announcements',
  dataKey: 'announcements',
  basePath: '/admin/announcements',

  queries: {
    list: GET_ANNOUNCEMENTS_QUERY,
    get: GET_ANNOUNCEMENT_QUERY,
    create: CREATE_ANNOUNCEMENT_MUTATION,
    update: UPDATE_ANNOUNCEMENT_MUTATION,
    delete: DELETE_ANNOUNCEMENT_MUTATION,
  },

  createColumns: createAnnouncementColumns,
  FormComponent: AnnouncementForm,

  translations: {
    title: 'Announcements',
    searchPlaceholder: 'Search announcements...',
    createButton: 'Create announcement',
    failedToLoad: 'Failed to load announcements',
    errorOccurred:
      'An error occurred while fetching announcements. Please try again.',
    unableToFetch: 'Unable to fetch announcements data.',

    deleteTitle: 'Delete Announcement?',
    deleteDescription:
      'This action cannot be undone. This will permanently delete the announcement',
    deleteConfirm: 'Delete',

    createTitle: 'Create Announcement',
    createDescription: 'Create a new announcement',
    editTitle: 'Edit Announcement',
    editDescription: 'Update announcement details',

    viewTitle: 'Announcement Details',
    viewDescription: 'View announcement details',
    notFound: 'Announcement Not Found',
    loadFailed: 'Failed to load announcement',

    createdSuccess: 'Announcement created successfully!',
    createdAnother: 'Announcement created! Create another one.',
    createFailed: 'Failed to create announcement',
    updatedSuccess: 'Announcement updated successfully!',
    updateFailed: 'Failed to update announcement',
    deletedSuccess: 'Announcement deleted',
    deleteFailed: 'Failed to delete announcement',
  } as Partial<CrudTranslations>,

  defaultSort: {
    field: 'created_at',
    order: 'desc',
  },

  searchColumn: 'title',
  skeletonColumns: 6,
}

/**
 * Transform Announcement model to form initial data
 */
export function transformAnnouncementToFormData(
  announcement: Announcement,
): Partial<CreateAnnouncementInput> {
  return {
    title: announcement.title,
    content: announcement.content,
    startsAt: announcement.startsAt || undefined,
    endsAt: announcement.endsAt || undefined,
    isActive: announcement.isActive,
    isDismissible: announcement.isDismissible,
    showForCustomers: announcement.showForCustomers,
    showOnFrontend: announcement.showOnFrontend,
    showOnUserDashboard: announcement.showOnUserDashboard,
  }
}
