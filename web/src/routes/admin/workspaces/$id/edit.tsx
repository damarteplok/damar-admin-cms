import { createFileRoute } from '@tanstack/react-router'
import type { Tenant } from '@/types'
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from '@/lib/graphql/tenant.graphql'
import { CrudEditPage } from '@/components/crud'
import {
  transformWorkspaceToFormData,
  workspacesConfig,
} from '@/features/workspaces'

export const Route = createFileRoute('/admin/workspaces/$id/edit')({
  component: EditWorkspacePage,
})

function EditWorkspacePage() {
  return (
    <CrudEditPage<Tenant, CreateTenantInput, UpdateTenantInput>
      config={workspacesConfig}
      routePath="/admin/workspaces/$id/edit"
      transformToFormData={transformWorkspaceToFormData}
    />
  )
}
