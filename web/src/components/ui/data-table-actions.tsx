import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, LucideIcon } from 'lucide-react'

export type DataTableAction<T = any> =
  | {
      label: string
      icon?: LucideIcon
      onClick: (item: T) => void
      variant?: 'default' | 'destructive'
      separator?: never
    }
  | {
      separator: true
      label?: never
      icon?: never
      onClick?: never
      variant?: never
    }

interface DataTableActionsProps<T = any> {
  item: T
  actions: DataTableAction<T>[]
  label?: string
}

/**
 * Reusable data table actions dropdown component
 *
 * @example
 * ```tsx
 * const actions: DataTableAction<Workspace>[] = [
 *   {
 *     label: 'Copy ID',
 *     icon: Copy,
 *     onClick: (workspace) => navigator.clipboard.writeText(workspace.id)
 *   },
 *   { separator: true },
 *   {
 *     label: 'Edit',
 *     icon: Pencil,
 *     onClick: (workspace) => handleEdit(workspace.id)
 *   },
 *   {
 *     label: 'Delete',
 *     icon: Trash2,
 *     onClick: (workspace) => handleDelete(workspace.id),
 *     variant: 'destructive'
 *   }
 * ]
 *
 * <DataTableActions item={workspace} actions={actions} />
 * ```
 */
export function DataTableActions<T = any>({
  item,
  actions,
  label = 'Actions',
}: DataTableActionsProps<T>) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {actions.map((action, index) => {
            if (action.separator) {
              return <DropdownMenuSeparator key={`separator-${index}`} />
            }

            const Icon = action.icon

            return (
              <DropdownMenuItem
                key={index}
                onClick={() => action.onClick(item)}
                className={
                  action.variant === 'destructive'
                    ? 'text-destructive focus:text-destructive'
                    : ''
                }
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
