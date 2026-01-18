import type { CrudConfig, CrudTranslations } from '@/types'
import type { Plan, CreatePlanInput, UpdatePlanInput } from '@/types'

import {
  GET_PLANS_QUERY,
  GET_PLAN_QUERY,
  CREATE_PLAN_MUTATION,
  UPDATE_PLAN_MUTATION,
  DELETE_PLAN_MUTATION,
} from '@/lib/graphql/plan.graphql'

import { createPlanColumns } from '@/components/features/admin/plans/plan-columns'
import { PlanForm } from '@/components/features/admin/plans/plan-form'

/**
 * CRUD Configuration for Plans
 */
export const plansConfig: CrudConfig<Plan, CreatePlanInput, UpdatePlanInput> = {
  resourceName: 'plans',
  dataKey: 'plans',
  basePath: '/admin/plans',

  queries: {
    list: GET_PLANS_QUERY,
    get: GET_PLAN_QUERY,
    create: CREATE_PLAN_MUTATION,
    update: UPDATE_PLAN_MUTATION,
    delete: DELETE_PLAN_MUTATION,
  },

  createColumns: createPlanColumns,
  FormComponent: PlanForm,

  translations: {
    title: 'Plans',
    searchPlaceholder: 'Search plans...',
    createButton: 'Create plan',
    failedToLoad: 'Failed to load plans',
    errorOccurred: 'An error occurred while fetching plans. Please try again.',
    unableToFetch: 'Unable to fetch plans data.',

    deleteTitle: 'Delete Plan?',
    deleteDescription:
      'This action cannot be undone. This will permanently delete the plan',
    deleteConfirm: 'Delete',

    createTitle: 'Create Plan',
    createDescription: 'Create a new plan',
    editTitle: 'Edit Plan',
    editDescription: 'Update plan details',

    viewTitle: 'Plan Details',
    viewDescription: 'View plan details',
    notFound: 'Plan Not Found',
    loadFailed: 'Failed to load plan',

    createdSuccess: 'Plan created successfully!',
    createdAnother: 'Plan created! Create another one.',
    createFailed: 'Failed to create plan',
    updatedSuccess: 'Plan updated successfully!',
    updateFailed: 'Failed to update plan',
    deletedSuccess: 'Plan deleted',
    deleteFailed: 'Failed to delete plan',
  } as Partial<CrudTranslations>,

  defaultSort: {
    field: 'created_at',
    order: 'desc',
  },

  searchColumn: 'name',
  skeletonColumns: 6,
}

/**
 * Transform Plan model to form initial data
 */
export function transformPlanToFormData(plan: Plan): Partial<CreatePlanInput> {
  return {
    name: plan.name,
    slug: plan.slug,
    intervalId: plan.intervalId,
    productId: plan.productId,
    intervalCount: plan.intervalCount,
    type: plan.type,
    isActive: plan.isActive,
    hasTrial: plan.hasTrial,
    trialIntervalId: plan.trialIntervalId || undefined,
    trialIntervalCount: plan.trialIntervalCount || undefined,
    description: plan.description || undefined,
    maxUsersPerTenant: plan.maxUsersPerTenant || undefined,
    meterId: plan.meterId || undefined,
    isVisible: plan.isVisible,
  }
}
