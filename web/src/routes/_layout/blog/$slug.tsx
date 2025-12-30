import { createFileRoute } from '@tanstack/react-router'

import { BlogDetailComponent } from '@/components/public/BlogDetailComponent'

export const Route = createFileRoute('/_layout/blog/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  const { slug } = Route.useParams()

  return <BlogDetailComponent slug={slug} />
}
