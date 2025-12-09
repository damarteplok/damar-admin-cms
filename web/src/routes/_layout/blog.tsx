import { createFileRoute } from '@tanstack/react-router'

import { BlogComponent } from '@/components/public/BlogComponent'

export const Route = createFileRoute('/_layout/blog')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BlogComponent />
}
