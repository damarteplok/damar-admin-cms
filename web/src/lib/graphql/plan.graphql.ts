import { gql } from 'urql'

export const GET_INTERVALS_QUERY = gql`
  query GetIntervals {
    intervals {
      id
      name
      slug
    }
  }
`

export const GET_PLANS_QUERY = gql`
  query GetPlans(
    $page: Int
    $perPage: Int
    $activeOnly: Boolean
    $visibleOnly: Boolean
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    plans(
      page: $page
      perPage: $perPage
      activeOnly: $activeOnly
      visibleOnly: $visibleOnly
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      success
      message
      data {
        plans {
          id
          name
          slug
          intervalId
          productId
          isActive
          hasTrial
          trialIntervalId
          intervalCount
          trialIntervalCount
          description
          type
          maxUsersPerTenant
          meterId
          isVisible
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

export const GET_PLAN_QUERY = gql`
  query GetPlan($id: ID!) {
    plan(id: $id) {
      success
      message
      data {
        id
        name
        slug
        intervalId
        productId
        isActive
        hasTrial
        trialIntervalId
        intervalCount
        trialIntervalCount
        description
        type
        maxUsersPerTenant
        meterId
        isVisible
        createdAt
        updatedAt
      }
    }
  }
`

export const CREATE_PLAN_MUTATION = gql`
  mutation CreatePlan($input: CreatePlanInput!) {
    createPlan(input: $input) {
      success
      message
      data {
        id
        name
        slug
        intervalId
        productId
        isActive
        hasTrial
        trialIntervalId
        intervalCount
        trialIntervalCount
        description
        type
        maxUsersPerTenant
        meterId
        isVisible
        createdAt
      }
    }
  }
`

export const UPDATE_PLAN_MUTATION = gql`
  mutation UpdatePlan($input: UpdatePlanInput!) {
    updatePlan(input: $input) {
      success
      message
      data {
        id
        name
        slug
        intervalId
        productId
        isActive
        hasTrial
        trialIntervalId
        intervalCount
        trialIntervalCount
        description
        type
        maxUsersPerTenant
        meterId
        isVisible
        updatedAt
      }
    }
  }
`

export const DELETE_PLAN_MUTATION = gql`
  mutation DeletePlan($id: ID!) {
    deletePlan(id: $id) {
      success
      message
    }
  }
`
