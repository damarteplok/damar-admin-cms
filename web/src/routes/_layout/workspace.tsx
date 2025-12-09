import { createFileRoute } from '@tanstack/react-router'

import { WorkspaceComponent } from '@/components/public/WorkspaceComponent'

export const Route = createFileRoute('/_layout/workspace')({
  component: RouteComponent,
})

function RouteComponent() {
  return <WorkspaceComponent />
}
