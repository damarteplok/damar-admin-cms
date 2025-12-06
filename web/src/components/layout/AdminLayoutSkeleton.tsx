import { Skeleton } from '@/components/ui/skeleton'

export function AdminLayoutSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="w-64 border-r bg-sidebar p-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b px-4 flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-px" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
