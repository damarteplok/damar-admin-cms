import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface FullScreenLoadingProps {
  message?: string
  className?: string
}

export function FullScreenLoading({
  message = 'Loading...',
  className,
}: FullScreenLoadingProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-foreground">{message}</p>
      </div>
    </div>
  )
}
