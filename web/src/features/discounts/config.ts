import type { CrudConfig, CrudTranslations } from '@/types'
import type {
  Discount,
  CreateDiscountInput,
  UpdateDiscountInput,
} from '@/types'

import {
  GET_DISCOUNTS_QUERY,
  GET_DISCOUNT_QUERY,
  CREATE_DISCOUNT_MUTATION,
  UPDATE_DISCOUNT_MUTATION,
  DELETE_DISCOUNT_MUTATION,
} from '@/lib/graphql/discount.graphql'

import { createDiscountColumns } from '@/components/features/admin/discounts/discount-columns'
import { DiscountForm } from '@/components/features/admin/discounts/discount-form'

/**
 * CRUD Configuration for Discounts
 * This config drives all generic CRUD pages for the discounts feature
 */
export const discountsConfig: CrudConfig<
  Discount,
  CreateDiscountInput,
  UpdateDiscountInput
> = {
  resourceName: 'discounts',
  dataKey: 'discounts',
  basePath: '/admin/discounts',

  queries: {
    list: GET_DISCOUNTS_QUERY,
    get: GET_DISCOUNT_QUERY,
    create: CREATE_DISCOUNT_MUTATION,
    update: UPDATE_DISCOUNT_MUTATION,
    delete: DELETE_DISCOUNT_MUTATION,
  },

  createColumns: createDiscountColumns,
  FormComponent: DiscountForm,

  translations: {
    title: 'Discounts',
    searchPlaceholder: 'Search discounts...',
    createButton: 'Create discount',
    failedToLoad: 'Failed to load discounts',
    errorOccurred:
      'An error occurred while fetching discounts. Please try again.',
    unableToFetch: 'Unable to fetch discounts data.',

    deleteTitle: 'Delete Discount?',
    deleteDescription:
      'This action cannot be undone. This will permanently delete the discount',
    deleteConfirm: 'Delete',

    createTitle: 'Create Discount',
    createDescription: 'Create a new discount',
    editTitle: 'Edit Discount',
    editDescription: 'Update discount details',

    viewTitle: 'Discount Details',
    viewDescription: 'View discount details',
    notFound: 'Discount Not Found',
    loadFailed: 'Failed to load discount',

    createdSuccess: 'Discount created successfully!',
    createdAnother: 'Discount created! Create another one.',
    createFailed: 'Failed to create discount',
    updatedSuccess: 'Discount updated successfully!',
    updateFailed: 'Failed to update discount',
    deletedSuccess: 'Discount deleted',
    deleteFailed: 'Failed to delete discount',
  } as Partial<CrudTranslations>,

  defaultSort: {
    field: 'created_at',
    order: 'desc',
  },

  searchColumn: 'name',
  skeletonColumns: 7,
}

/**
 * Transform Discount model to form initial data
 */
export function transformDiscountToFormData(
  discount: Discount,
): Partial<CreateDiscountInput> {
  return {
    name: discount.name,
    description: discount.description || undefined,
    type: discount.type,
    amount: discount.amount,
    validUntil: discount.validUntil || undefined,
    isActive: discount.isActive,
    actionType: discount.actionType || undefined,
    maxRedemptions: discount.maxRedemptions || undefined,
    maxRedemptionsPerUser: discount.maxRedemptionsPerUser || undefined,
    isRecurring: discount.isRecurring,
    durationInMonths: discount.durationInMonths || undefined,
    maximumRecurringIntervals: discount.maximumRecurringIntervals || undefined,
    redeemType: discount.redeemType || undefined,
    bonusDays: discount.bonusDays || undefined,
    isEnabledForAllPlans: discount.isEnabledForAllPlans,
    isEnabledForAllOneTimeProducts: discount.isEnabledForAllOneTimeProducts,
  }
}
