import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

import type { Category } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/lib/utils/date'

interface CategoryColumnsProps {
  onDelete: (id: string) => void
  t: TFunction
}

export function createCategoryColumns({
  onDelete,
  t,
}: CategoryColumnsProps): Array<ColumnDef<Category>> {
  return [
    {
      accessorKey: 'name',
      header: t('category.columns.name', { defaultValue: 'Name' }),
      cell: ({ row }) => {
        return (
          <Link
            to="/admin/blog-categories/$id"
            params={{ id: row.original.id }}
            className="font-medium hover:underline"
          >
            {row.getValue('name')}
          </Link>
        )
      },
    },
    {
      accessorKey: 'slug',
      header: t('category.columns.slug', { defaultValue: 'Slug' }),
      cell: ({ row }) => {
        return (
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {row.getValue('slug')}
          </code>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: t('category.columns.created_at', { defaultValue: 'Created At' }),
      cell: ({ row }) => {
        const createdAt = row.original.createdAt
        return createdAt ? (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(createdAt)}
          </span>
        ) : (
          '-'
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: t('category.columns.updated_at', { defaultValue: 'Updated At' }),
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt
        return updatedAt ? (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(updatedAt)}
          </span>
        ) : (
          '-'
        )
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="text-right">
          {t('category.columns.actions', { defaultValue: 'Actions' })}
        </div>
      ),
      cell: ({ row }) => {
        const category = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {t('category.columns.actions', { defaultValue: 'Actions' })}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/admin/blog-categories/$id/edit"
                  params={{ id: category.id }}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('category.actions.edit', { defaultValue: 'Edit' })}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category.id)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                {t('category.actions.delete', { defaultValue: 'Delete' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
