import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

import { CREATE_CATEGORY_MUTATION } from '@/lib/graphql/blog.graphql'
import type {
  CreateCategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types'
import { CategoryForm } from '@/components/features/admin/blog'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/blog-categories/create')({
  component: CreateCategoryPage,
})

function CreateCategoryPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, createCategoryMutation] = useMutation<CreateCategoryResponse>(
    CREATE_CATEGORY_MUTATION,
  )

  const handleCreate = async (
    formData: CreateCategoryInput | UpdateCategoryInput,
    createAnother: boolean = false,
  ) => {
    const result = await createCategoryMutation({
      input: formData as CreateCategoryInput,
    })

    if (result.error) {
      toast.error(
        result.error.message ||
          t('category.form.created_failed', {
            defaultValue: 'Failed to create category',
          }),
      )
      return false
    }

    if (result.data?.createCategory.success) {
      toast.success(
        createAnother
          ? t('category.form.created_another', {
              defaultValue: 'Category created! Create another one.',
            })
          : t('category.form.created_success', {
              defaultValue: 'Category created successfully!',
            }),
      )

      if (!createAnother) {
        navigate({ to: '/admin/blog-categories' })
      }
      return true
    } else {
      toast.error(
        result.data?.createCategory.message ||
          t('category.form.created_failed', {
            defaultValue: 'Failed to create category',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/blog-categories' })
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
              {t('category.create_title', { defaultValue: 'Create Category' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('category.create_description', {
                defaultValue: 'Create a new blog category',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Category Form */}
      <Card>
        <CardContent className="pt-6">
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            submitLabel={t('category.form.create', { defaultValue: 'Create' })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
