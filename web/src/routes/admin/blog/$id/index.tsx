import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Loader2,
  Lock,
  Tag,
  User,
} from 'lucide-react'

import type { DeleteBlogPostResponse, GetBlogPostResponse } from '@/types'
import {
  DELETE_BLOG_POST_MUTATION,
  GET_BLOG_POST_QUERY,
} from '@/lib/graphql/blog.graphql'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ErrorState } from '@/components/ui/error-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatDateTime } from '@/lib/utils/date'

export const Route = createFileRoute('/admin/blog/$id/')({
  component: ViewBlogPostPage,
})

function ViewBlogPostPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [result] = useQuery<GetBlogPostResponse>({
    query: GET_BLOG_POST_QUERY,
    variables: { id },
    requestPolicy: 'cache-and-network',
  })

  const [, deleteBlogPostMutation] = useMutation<DeleteBlogPostResponse>(
    DELETE_BLOG_POST_MUTATION,
  )

  const { data, fetching, error } = result

  const handleBack = () => {
    navigate({ to: '/admin/blog' })
  }

  const handleEdit = () => {
    navigate({ to: `/admin/blog/${id}/edit` })
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    const result = await deleteBlogPostMutation({ id })

    if (result.data?.deleteBlogPost.success) {
      toast.success(
        t('blog.delete_success', {
          defaultValue: 'Blog post deleted successfully',
        }),
      )
      navigate({ to: '/admin/blog' })
    } else {
      toast.error(
        result.data?.deleteBlogPost.message ||
          t('blog.delete_failed', {
            defaultValue: 'Failed to delete blog post',
          }),
      )
    }
  }

  // Loading state
  if (fetching && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !data?.blogPost.success) {
    return (
      <ErrorState
        title={t('blog.failed_to_load', {
          defaultValue: 'Failed to load blog post',
        })}
        description={
          error?.message ||
          data?.blogPost.message ||
          t('blog.unable_to_fetch', {
            defaultValue: 'Unable to fetch blog post data.',
          })
        }
      />
    )
  }

  const blogPost = data.blogPost.data

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('blog.view_title', { defaultValue: 'Blog Post Details' })}
          </h1>
        </div>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              {blogPost.isPublished ? (
                <Badge variant="default" className="gap-1.5">
                  <Globe className="h-3 w-3" />
                  {t('blog.status.published', 'Published')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1.5">
                  <Lock className="h-3 w-3" />
                  {t('blog.status.draft', 'Draft')}
                </Badge>
              )}
              {blogPost.category && (
                <Badge variant="outline" className="gap-1.5">
                  <Tag className="h-3 w-3" />
                  {blogPost.category.name}
                </Badge>
              )}
            </div>
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              {blogPost.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleEdit}>
              {t('common.edit', { defaultValue: 'Edit' })}
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              {t('common.delete', { defaultValue: 'Delete' })}
            </Button>
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {blogPost.author && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {t('blog.by_author', { defaultValue: 'By' })}{' '}
                <span className="font-medium text-foreground">
                  {blogPost.author.name}
                </span>
              </span>
            </div>
          )}
          {blogPost.publishedAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDateTime(blogPost.publishedAt)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {t('blog.updated', { defaultValue: 'Updated' })}{' '}
              {formatDateTime(blogPost.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Description */}
      {blogPost.description && (
        <div className="rounded-lg bg-muted/50 p-6">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {blogPost.description}
          </p>
        </div>
      )}

      {/* Main Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-img:rounded-xl prose-img:shadow-md prose-pre:bg-muted prose-pre:border prose-code:text-sm prose-li:marker:text-muted-foreground">
        <div dangerouslySetInnerHTML={{ __html: blogPost.body }} />
      </article>

      <Separator />

      {/* Metadata Footer */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          {t('blog.post_information', { defaultValue: 'Post Information' })}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('blog.slug_label', 'Slug')}
            </p>
            <p className="text-sm font-mono bg-muted/50 px-3 py-1.5 rounded border">
              {blogPost.slug}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('blog.created_at_label', 'Created At')}
            </p>
            <p className="text-sm font-medium">
              {formatDateTime(blogPost.createdAt)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('blog.author_id_label', 'Author ID')}
            </p>
            <p className="text-sm font-mono font-medium">{blogPost.authorId}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={t('blog.delete_title', {
          defaultValue: 'Delete Blog Post?',
        })}
        description={
          <>
            {t('blog.delete_description', {
              defaultValue:
                'This action cannot be undone. This will permanently delete the blog post',
            })}{' '}
            <span className="font-semibold">{blogPost.title}</span>{' '}
            {t('blog.delete_description_and', {
              defaultValue: 'and remove all associated data.',
            })}
          </>
        }
        confirmText={t('blog.delete_button', {
          defaultValue: 'Delete',
        })}
        variant="destructive"
      />
    </div>
  )
}
