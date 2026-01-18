import { createFileRoute } from '@tanstack/react-router'
import { CrudEditPage } from '@/components/crud'
import {
  workspacesConfig,
  transformWorkspaceToFormData,
} from '@/features/workspaces'
import type { Tenant } from '@/types'
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from '@/lib/graphql/tenant.graphql'

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
