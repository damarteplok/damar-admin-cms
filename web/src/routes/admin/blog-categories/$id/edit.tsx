import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'

import {
  UPDATE_CATEGORY_MUTATION,
  GET_CATEGORY_QUERY,
} from '@/lib/graphql/blog.graphql'
import type {
  CategoryResponse,
  UpdateCategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types'
import { CategoryForm } from '@/components/features/admin/blog'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'

export const Route = createFileRoute('/admin/blog-categories/$id/edit')({
  component: EditCategoryPage,
})

function EditCategoryPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Get category
  const [result] = useQuery<CategoryResponse>({
    query: GET_CATEGORY_QUERY,
    variables: { id },
    requestPolicy: 'cache-and-network',
  })

  const [, updateCategoryMutation] = useMutation<UpdateCategoryResponse>(
    UPDATE_CATEGORY_MUTATION,
  )

  const { data, fetching, error } = result

  const handleUpdate = async (
    formData: CreateCategoryInput | UpdateCategoryInput,
  ) => {
    const result = await updateCategoryMutation({
      input: {
        id,
        name: formData.name,
        slug: formData.slug || '',
        description: formData.description,
      },
    })

    if (result.error) {
      toast.error(
        result.error.message ||
          t('category.form.updated_failed', {
            defaultValue: 'Failed to update category',
          }),
      )
      return false
    }

    if (result.data?.updateCategory.success) {
      toast.success(
        t('category.form.updated_success', {
          defaultValue: 'Category updated successfully!',
        }),
      )
      navigate({ to: '/admin/blog-categories' })
      return true
    } else {
      toast.error(
        result.data?.updateCategory.message ||
          t('category.form.updated_failed', {
            defaultValue: 'Failed to update category',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/blog-categories' })
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

  const initialData = {
    name: category.name,
    slug: category.slug,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('category.edit_title', { defaultValue: 'Edit Category' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('category.edit_description', {
                defaultValue: 'Update category details',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Category Form */}
      <Card>
        <CardContent className="pt-6">
          <CategoryForm
            initialData={initialData}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t('category.form.save', { defaultValue: 'Save' })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
