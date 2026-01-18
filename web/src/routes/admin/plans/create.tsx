import { createFileRoute } from '@tanstack/react-router'
import type { CreatePlanInput, Plan, UpdatePlanInput } from '@/types'
import { CrudCreatePage } from '@/components/crud'
import { plansConfig } from '@/features/plans'

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
