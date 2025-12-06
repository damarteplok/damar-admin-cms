import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/workspace')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/workspace"!</div>
}
