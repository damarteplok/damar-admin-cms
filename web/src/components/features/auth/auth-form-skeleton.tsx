import { Skeleton } from '@/components/ui/skeleton'

export function AuthFormSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="hidden md:block">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
