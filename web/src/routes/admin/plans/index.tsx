import { createFileRoute } from '@tanstack/react-router'
import type { CreatePlanInput, Plan, UpdatePlanInput } from '@/types'
import { CrudListPage } from '@/components/crud'
import { plansConfig } from '@/features/plans'

export const Route = createFileRoute('/admin/plans/')({
  component: PlansPage,
})

function PlansPage() {
  return (
    <CrudListPage<Plan, CreatePlanInput, UpdatePlanInput>
      config={plansConfig}
    />
  )
}
