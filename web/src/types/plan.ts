export interface Plan {
  id: string
  name: string
  slug: string
  intervalId: string
  productId: string
  isActive: boolean
  hasTrial: boolean
  trialIntervalId?: string | null
  intervalCount: number
  trialIntervalCount?: number | null
  description?: string | null
  type: string
  maxUsersPerTenant?: number | null
  meterId?: string | null
  isVisible: boolean
  createdAt: number
  updatedAt: number
}

export interface PlansResponse {
  plans: {
    success: boolean
    message: string
    data: {
      plans: Plan[]
      total: number
      page: number
      perPage: number
    }
  }
}

export interface PlanResponse {
  plan: {
    success: boolean
    message: string
    data: Plan
  }
}

export interface CreatePlanInput {
  name: string
  slug?: string
  intervalId: string
  productId: string
  intervalCount: number
  type: string
  isActive?: boolean
  hasTrial?: boolean
  trialIntervalId?: string
  trialIntervalCount?: number
  description?: string
  maxUsersPerTenant?: number
  meterId?: string
  isVisible?: boolean
}

export interface UpdatePlanInput {
  name: string
  slug?: string
  intervalId: string
  intervalCount: number
  type: string
  isActive?: boolean
  hasTrial?: boolean
  trialIntervalId?: string
  trialIntervalCount?: number
  description?: string
  maxUsersPerTenant?: number
  meterId?: string
  isVisible?: boolean
}

export interface CreatePlanResponse {
  createPlan: {
    success: boolean
    message: string
    data: Plan
  }
}

export interface UpdatePlanResponse {
  updatePlan: {
    success: boolean
    message: string
    data: Plan
  }
}

export interface DeletePlanResponse {
  deletePlan: {
    success: boolean
    message: string
  }
}
