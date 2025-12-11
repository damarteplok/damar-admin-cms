import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

interface DataTableSkeletonProps {
  showCreateButton?: boolean
  showSearch?: boolean
  rows?: number
  columns?: number
}

/**
 * Reusable skeleton loader for data tables
 * Matches the structure of DataTable component
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <DataTableSkeleton rows={10} columns={5} />
 * }
 * ```
 */
export function DataTableSkeleton({
  showCreateButton = true,
  showSearch = true,
  rows = 10,
  columns = 5,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Header: Title + Create Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" /> {/* Title */}
        </div>
        {showCreateButton && <Skeleton className="h-10 w-40" />}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      )}

      {/* Table */}
      <Card className="rounded-md border">
        <div className="w-full">
          {/* Table Header */}
          <div className="border-b">
            <div className="flex items-center h-12 px-4 gap-4">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={`header-${i}`} className="h-4 flex-1" />
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="flex items-center h-16 px-4 gap-4"
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="h-4 flex-1"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
