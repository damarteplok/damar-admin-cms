import { gql } from 'urql'

export const GET_DISCOUNTS_QUERY = gql`
  query GetDiscounts(
    $page: Int
    $perPage: Int
    $activeOnly: Boolean
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    discounts(
      page: $page
      perPage: $perPage
      activeOnly: $activeOnly
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      success
      message
      data {
        discounts {
          id
          name
          description
          type
          amount
          validUntil
          isActive
          actionType
          maxRedemptions
          maxRedemptionsPerUser
          redemptions
          isRecurring
          durationInMonths
          maximumRecurringIntervals
          redeemType
          bonusDays
          isEnabledForAllPlans
          isEnabledForAllOneTimeProducts
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

export const GET_DISCOUNT_QUERY = gql`
  query GetDiscount($id: ID!) {
    discount(id: $id) {
      success
      message
      data {
        id
        name
        description
        type
        amount
        validUntil
        isActive
        actionType
        maxRedemptions
        maxRedemptionsPerUser
        redemptions
        isRecurring
        durationInMonths
        maximumRecurringIntervals
        redeemType
        bonusDays
        isEnabledForAllPlans
        isEnabledForAllOneTimeProducts
        createdAt
        updatedAt
      }
    }
  }
`

export const CREATE_DISCOUNT_MUTATION = gql`
  mutation CreateDiscount($input: CreateDiscountInput!) {
    createDiscount(input: $input) {
      success
      message
      data {
        id
        name
        description
        type
        amount
        validUntil
        isActive
        actionType
        maxRedemptions
        maxRedemptionsPerUser
        redemptions
        isRecurring
        durationInMonths
        maximumRecurringIntervals
        redeemType
        bonusDays
        isEnabledForAllPlans
        isEnabledForAllOneTimeProducts
        createdAt
        updatedAt
      }
    }
  }
`

export const UPDATE_DISCOUNT_MUTATION = gql`
  mutation UpdateDiscount($input: UpdateDiscountInput!) {
    updateDiscount(input: $input) {
      success
      message
      data {
        id
        name
        description
        type
        amount
        validUntil
        isActive
        actionType
        maxRedemptions
        maxRedemptionsPerUser
        redemptions
        isRecurring
        durationInMonths
        maximumRecurringIntervals
        redeemType
        bonusDays
        isEnabledForAllPlans
        isEnabledForAllOneTimeProducts
        createdAt
        updatedAt
      }
    }
  }
`

export const DELETE_DISCOUNT_MUTATION = gql`
  mutation DeleteDiscount($id: ID!) {
    deleteDiscount(id: $id) {
      success
      message
    }
  }
`
