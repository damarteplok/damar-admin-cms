import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  description?: ReactNode
  variant?: 'destructive' | 'warning' | 'info' | 'success'
  icon?: ReactNode
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void | Promise<void>
}

const variantIcons = {
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
}

const variantStyles = {
  destructive: 'destructive',
  warning: 'default',
  info: 'default',
  success: 'default',
} as const

/**
 * Reusable error/info state component for displaying messages
 *
 * @example
 * ```tsx
 * // Error state
 * <ErrorState
 *   title="Failed to load data"
 *   description="Could not fetch workspaces. Please try again."
 * />
 *
 * // With custom action
 * <ErrorState
 *   title="No results found"
 *   description="Try adjusting your search query."
 *   variant="info"
 *   action={<Button onClick={handleReset}>Reset Filters</Button>}
 * />
 * 
 * // With simple action label
 * <ErrorState
 *   title="Something went wrong"
 *   description="Please try again later."
 *   actionLabel="Retry"
 *   onAction={() => refetch()}
 * />
 * ```
 */
export function ErrorState({
  title = 'Error',
  description = 'Something went wrong. Please try again.',
  variant = 'destructive',
  icon,
  action,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  const Icon = icon ? null : variantIcons[variant]
  const alertVariant = variantStyles[variant]

  return (
    <Alert
      variant={alertVariant}
      className={
        variant === 'warning'
          ? 'border-yellow-500 text-yellow-900 dark:text-yellow-300'
          : variant === 'info'
            ? 'border-blue-500'
            : variant === 'success'
              ? 'border-green-500'
              : ''
      }
    >
      {icon ? (
        <div className="h-4 w-4">{icon}</div>
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <div>{description}</div>
        {action && <div className="mt-2">{action}</div>}
        {!action && actionLabel && onAction && (
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAction}
              className={
                variant === 'destructive' 
                  ? 'border-destructive/50 hover:bg-destructive/10 hover:text-destructive' 
                  : ''
              }
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
