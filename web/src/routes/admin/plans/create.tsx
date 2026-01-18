import { createFileRoute } from '@tanstack/react-router'
import { CrudCreatePage } from '@/components/crud'
import { plansConfig } from '@/features/plans'
import type { Plan, CreatePlanInput, UpdatePlanInput } from '@/types'

export const Route = createFileRoute('/admin/plans/create')({
  component: CreatePlanPage,
})

function CreatePlanPage() {
  return (
    <CrudCreatePage<Plan, CreatePlanInput, UpdatePlanInput>
      config={plansConfig}
    />
  )
}
