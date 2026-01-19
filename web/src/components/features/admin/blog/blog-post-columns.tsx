import { Eye, Globe, Lock, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { BlogPost } from '@/types'
import type { DataTableAction } from '@/components/ui/data-table-actions'
import type { TFunction } from 'i18next'
import { DataTableActions } from '@/components/ui/data-table-actions'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils/date'

interface ColumnProps {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
  onPublish?: (id: string) => void
  onUnpublish?: (id: string) => void
  t: TFunction
}

export const createBlogPostColumns = ({
  onDelete,
  onEdit,
  onView,
  onPublish,
  onUnpublish,
  t,
}: ColumnProps): Array<ColumnDef<BlogPost>> => [
  {
    accessorKey: 'title',
    header: t('blog.columns.title', { defaultValue: 'Title' }),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col max-w-md">
          <span className="font-medium truncate">{row.getValue('title')}</span>
          <span className="text-xs text-muted-foreground truncate">
            {row.original.slug}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: t('blog.columns.category', { defaultValue: 'Category' }),
    cell: ({ row }) => {
      const category = row.original.category
      return category ? (
        <Badge variant="outline" className="font-normal">
          {category.name}
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">
          {t('blog.noCategory', 'No category')}
        </span>
      )
    },
  },
  {
    accessorKey: 'author',
    header: t('blog.columns.author', { defaultValue: 'Author' }),
    cell: ({ row }) => {
      const author = row.original.author
      return author ? (
        <span className="text-sm">{author.name}</span>
      ) : (
        <span className="text-xs text-muted-foreground">
          {t('blog.noAuthor', 'No author')}
        </span>
      )
    },
  },
  {
    accessorKey: 'isPublished',
    header: t('blog.columns.status', { defaultValue: 'Status' }),
    cell: ({ row }) => {
      const isPublished = row.getValue('isPublished')
      return isPublished ? (
        <Badge variant="default" className="gap-1">
          <Globe className="h-3 w-3" />
          {t('blog.status.published', 'Published')}
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          {t('blog.status.draft', 'Draft')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'publishedAt',
    header: t('blog.columns.published_at', { defaultValue: 'Published' }),
    cell: ({ row }) => {
      const publishedAt = row.getValue('publishedAt') as number
      return publishedAt ? (
        <span className="text-sm">{formatDateTime(publishedAt)}</span>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: t('blog.columns.created_at', { defaultValue: 'Created' }),
    cell: ({ row }) => {
      const timestamp = Number(row.getValue('createdAt'))
      return <span className="text-sm">{formatDateTime(timestamp)}</span>
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">
        {t('blog.columns.actions', { defaultValue: 'Actions' })}
      </div>
    ),
    cell: ({ row }) => {
      const blogPost = row.original

      const actions: Array<DataTableAction<BlogPost>> = [
        {
          label: t('blog.actions.view_details', {
            defaultValue: 'View Details',
          }),
          icon: Eye,
          onClick: (post) => onView(post.id),
        },
        { separator: true },
        {
          label: t('blog.actions.edit', { defaultValue: 'Edit' }),
          icon: Pencil,
          onClick: (post) => onEdit(post.id),
        },
      ]

      // Add publish/unpublish actions
      if (blogPost.isPublished && onUnpublish) {
        actions.push({
          label: t('blog.actions.unpublish', { defaultValue: 'Unpublish' }),
          icon: Lock,
          onClick: (post) => onUnpublish(post.id),
        })
      } else if (!blogPost.isPublished && onPublish) {
        actions.push({
          label: t('blog.actions.publish', { defaultValue: 'Publish' }),
          icon: Globe,
          onClick: (post) => onPublish(post.id),
        })
      }

      actions.push(
        { separator: true },
        {
          label: t('blog.actions.delete', { defaultValue: 'Delete' }),
          icon: Trash2,
          onClick: (post) => onDelete(post.id),
          variant: 'destructive',
        },
      )

      return (
        <div className="flex justify-end">
          <DataTableActions<BlogPost> actions={actions} item={blogPost} />
        </div>
      )
    },
  },
]
