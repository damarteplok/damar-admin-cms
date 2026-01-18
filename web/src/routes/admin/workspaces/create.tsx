import { createFileRoute } from '@tanstack/react-router'
import type { Tenant } from '@/types'
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from '@/lib/graphql/tenant.graphql'
import { CrudCreatePage } from '@/components/crud'
import { workspacesConfig } from '@/features/workspaces'

export const Route = createFileRoute('/admin/workspaces/create')({
  component: CreateWorkspacePage,
})

function CreateWorkspacePage() {
  return (
    <CrudCreatePage<Tenant, CreateTenantInput, UpdateTenantInput>
      config={workspacesConfig}
    />
  )
}
