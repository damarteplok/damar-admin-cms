import { List2 } from '@/components/list2'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/workspace')({
  component: RouteComponent,
})

function RouteComponent() {
  return <List2 />
}
