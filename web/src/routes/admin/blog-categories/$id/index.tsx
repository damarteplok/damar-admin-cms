import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Loader2, Pencil } from 'lucide-react'

import type { CategoryResponse } from '@/types'
import { GET_CATEGORY_QUERY } from '@/lib/graphql/blog.graphql'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ErrorState } from '@/components/ui/error-state'
import { formatDateTime } from '@/lib/utils/date'

export const Route = createFileRoute('/admin/blog-categories/$id/')({
  component: ViewCategoryPage,
})

function ViewCategoryPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [result] = useQuery<CategoryResponse>({
    query: GET_CATEGORY_QUERY,
    variables: { id },
    requestPolicy: 'cache-and-network',
  })

  const { data, fetching, error } = result

  const handleBack = () => {
    navigate({ to: '/admin/blog-categories' })
  }

  const handleEdit = () => {
    navigate({ to: `/admin/blog-categories/${id}/edit` })
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
  if (error || !data?.category.success) {
    return (
      <ErrorState
        title={t('category.failed_to_load', {
          defaultValue: 'Failed to load category',
        })}
        description={
          error?.message ||
          data?.category.message ||
          t('category.unable_to_fetch', {
            defaultValue: 'Unable to fetch category data.',
          })
        }
      />
    )
  }

  const category = data.category.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight line-clamp-1">
              {category.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('category.view_description', {
                defaultValue: 'View category details',
              })}
            </p>
          </div>
        </div>
        <Button onClick={handleEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          {t('common.edit', { defaultValue: 'Edit' })}
        </Button>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Slug:{' '}
            <code className="bg-muted px-2 py-1 rounded">{category.slug}</code>
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Description */}
            {category.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  {t('category.description_label', 'Description')}:
                </span>
                <p className="mt-2 text-sm">{category.description}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t('category.created_at_label', 'Created At')}:
                </span>
                <p className="mt-1">
                  {category.createdAt
                    ? formatDateTime(category.createdAt)
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('category.updated_at_label', 'Updated At')}:
                </span>
                <p className="mt-1">
                  {category.updatedAt
                    ? formatDateTime(category.updatedAt)
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
