import { createFileRoute } from '@tanstack/react-router'
import { CrudListPage } from '@/components/crud'
import { plansConfig } from '@/features/plans'
import type { Plan, CreatePlanInput, UpdatePlanInput } from '@/types'

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
