import { gql } from 'urql'

export const GET_ANNOUNCEMENTS_QUERY = gql`
  query GetAnnouncements(
    $page: Int
    $perPage: Int
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    announcements(
      page: $page
      perPage: $perPage
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      success
      message
      data {
        announcements {
          id
          title
          content
          startsAt
          endsAt
          isActive
          isDismissible
          showForCustomers
          showOnFrontend
          showOnUserDashboard
          createdAt
          updatedAt
        }
        total
        page
        perPage
      }
    }
  }
`

export const GET_ANNOUNCEMENT_QUERY = gql`
  query GetAnnouncement($id: ID!) {
    announcement(id: $id) {
      success
      message
      data {
        id
        title
        content
        startsAt
        endsAt
        isActive
        isDismissible
        showForCustomers
        showOnFrontend
        showOnUserDashboard
        createdAt
        updatedAt
      }
    }
  }
`

export const GET_ACTIVE_ANNOUNCEMENTS_QUERY = gql`
  query GetActiveAnnouncements(
    $forCustomers: Boolean
    $forFrontend: Boolean
    $forUserDashboard: Boolean
  ) {
    activeAnnouncements(
      forCustomers: $forCustomers
      forFrontend: $forFrontend
      forUserDashboard: $forUserDashboard
    ) {
      success
      message
      data {
        id
        title
        content
        startsAt
        endsAt
        isActive
        isDismissible
        showForCustomers
        showOnFrontend
        showOnUserDashboard
        createdAt
        updatedAt
      }
    }
  }
`

export const CREATE_ANNOUNCEMENT_MUTATION = gql`
  mutation CreateAnnouncement($input: CreateAnnouncementInput!) {
    createAnnouncement(input: $input) {
      success
      message
      data {
        id
        title
        content
        startsAt
        endsAt
        isActive
        isDismissible
        showForCustomers
        showOnFrontend
        showOnUserDashboard
        createdAt
      }
    }
  }
`

export const UPDATE_ANNOUNCEMENT_MUTATION = gql`
  mutation UpdateAnnouncement($input: UpdateAnnouncementInput!) {
    updateAnnouncement(input: $input) {
      success
      message
      data {
        id
        title
        content
        startsAt
        endsAt
        isActive
        isDismissible
        showForCustomers
        showOnFrontend
        showOnUserDashboard
        updatedAt
      }
    }
  }
`

export const DELETE_ANNOUNCEMENT_MUTATION = gql`
  mutation DeleteAnnouncement($id: ID!) {
    deleteAnnouncement(id: $id) {
      success
      message
    }
  }
`
