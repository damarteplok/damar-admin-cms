export interface Discount {
  id: string
  name: string
  description?: string
  type: string
  amount: number
  validUntil?: number
  isActive: boolean
  actionType?: string
  maxRedemptions?: number
  maxRedemptionsPerUser?: number
  redemptions: number
  isRecurring: boolean
  durationInMonths?: number
  maximumRecurringIntervals?: number
  redeemType?: number
  bonusDays?: number
  isEnabledForAllPlans: boolean
  isEnabledForAllOneTimeProducts: boolean
  createdAt: number
  updatedAt: number
}

export interface DiscountsResponse {
  discounts: {
    success: boolean
    message: string
    data: {
      discounts: Discount[]
      total: number
      page: number
      perPage: number
    }
  }
}

export interface DiscountResponse {
  discount: {
    success: boolean
    message: string
    data: Discount
  }
}

export interface CreateDiscountInput {
  name: string
  description?: string
  type: string
  amount: number
  validUntil?: number
  isActive: boolean
  actionType?: string
  maxRedemptions?: number
  maxRedemptionsPerUser?: number
  isRecurring: boolean
  durationInMonths?: number
  maximumRecurringIntervals?: number
  redeemType?: number
  bonusDays?: number
  isEnabledForAllPlans?: boolean
  isEnabledForAllOneTimeProducts?: boolean
}

export interface UpdateDiscountInput {
  id: string
  name: string
  description?: string
  type: string
  amount: number
  validUntil?: number
  isActive: boolean
  actionType?: string
  maxRedemptions?: number
  maxRedemptionsPerUser?: number
  isRecurring: boolean
  durationInMonths?: number
  maximumRecurringIntervals?: number
  redeemType?: number
  bonusDays?: number
  isEnabledForAllPlans?: boolean
  isEnabledForAllOneTimeProducts?: boolean
}

export interface DeleteDiscountResponse {
  deleteDiscount: {
    success: boolean
    message: string
  }
}

export interface GetDiscountsParams {
  page?: number
  perPage?: number
  activeOnly?: boolean
  search?: string
  sortBy?: string
  sortOrder?: string
}
