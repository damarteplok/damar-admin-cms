export interface Announcement {
  id: string
  title: string
  content: string
  startsAt?: number | null
  endsAt?: number | null
  isActive: boolean
  isDismissible: boolean
  showForCustomers: boolean
  showOnFrontend: boolean
  showOnUserDashboard: boolean
  createdAt: number
  updatedAt: number
}

export interface AnnouncementsResponse {
  announcements: {
    success: boolean
    message: string
    data: {
      announcements: Array<Announcement>
      total: number
      page: number
      perPage: number
    }
  }
}

export interface AnnouncementResponse {
  announcement: {
    success: boolean
    message: string
    data: Announcement
  }
}

export interface ActiveAnnouncementsResponse {
  activeAnnouncements: {
    success: boolean
    message: string
    data: Array<Announcement>
  }
}

export interface DeleteAnnouncementResponse {
  deleteAnnouncement: {
    success: boolean
    message: string
  }
}

export interface CreateAnnouncementInput {
  title: string
  content: string
  startsAt?: number
  endsAt?: number
  isActive?: boolean
  isDismissible?: boolean
  showForCustomers?: boolean
  showOnFrontend?: boolean
  showOnUserDashboard?: boolean
}

export interface UpdateAnnouncementInput {
  id: string
  title: string
  content: string
  startsAt?: number
  endsAt?: number
  isActive?: boolean
  isDismissible?: boolean
  showForCustomers?: boolean
  showOnFrontend?: boolean
  showOnUserDashboard?: boolean
}

export interface CreateAnnouncementResponse {
  createAnnouncement: {
    success: boolean
    message: string
    data: Announcement
  }
}

export interface UpdateAnnouncementResponse {
  updateAnnouncement: {
    success: boolean
    message: string
    data: Announcement
  }
}

export interface DeleteAnnouncementResponse {
  deleteAnnouncement: {
    success: boolean
    message: string
  }
}
