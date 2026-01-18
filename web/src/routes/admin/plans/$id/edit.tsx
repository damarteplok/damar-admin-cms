import { createFileRoute } from '@tanstack/react-router'
import type { CreatePlanInput, Plan, UpdatePlanInput } from '@/types'
import { CrudEditPage } from '@/components/crud'
import { plansConfig, transformPlanToFormData } from '@/features/plans'

export const Route = createFileRoute('/admin/plans/$id/edit')({
  component: EditPlanPage,
})

function EditPlanPage() {
  return (
    <CrudEditPage<Plan, CreatePlanInput, UpdatePlanInput>
      config={plansConfig}
      routePath="/admin/plans/$id/edit"
      transformToFormData={transformPlanToFormData}
    />
  )
}
