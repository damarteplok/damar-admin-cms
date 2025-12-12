import { useLocation, useParams } from '@tanstack/react-router'

export interface BreadcrumbItem {
  title: string
  path?: string
}

// Breadcrumb configuration mapping
const breadcrumbMap: Record<string, string> = {
  admin: 'Dashboard',
  users: 'Users',
  products: 'Products',
  plans: 'Plans',
  discounts: 'Discounts',
  tenants: 'Tenants',
  workspaces: 'Workspaces',
  create: 'Create',
  edit: 'Edit',
}

/**
 * Hook to generate breadcrumbs from current pathname
 * Automatically generates breadcrumbs based on URL segments
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation()
  const params = useParams({ strict: false })

  const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean)

  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // Skip if it's a dynamic parameter (UUID, ID, etc.)
    if (
      segment.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      // If it's a UUID, use the previous segment's singular form or "Detail"
      const prevSegment = segments[i - 1]
      breadcrumbs.push({
        title: prevSegment
          ? `${breadcrumbMap[prevSegment] || prevSegment} Detail`
          : 'Detail',
        path: currentPath,
      })
      continue
    }

    // Check if segment is in the map
    const title =
      breadcrumbMap[segment] ||
      segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    breadcrumbs.push({
      title,
      path: currentPath,
    })
  }

  return breadcrumbs
}
