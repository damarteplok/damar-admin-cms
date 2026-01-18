import { createFileRoute } from '@tanstack/react-router'
import { CrudEditPage } from '@/components/crud'
import {
  blogCategoriesConfig,
  transformCategoryToFormData,
} from '@/features/blog-categories'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types'

export const Route = createFileRoute('/admin/blog-categories/$id/edit')({
  component: EditCategoryPage,
})

function EditCategoryPage() {
  return (
    <CrudEditPage<Category, CreateCategoryInput, UpdateCategoryInput>
      config={blogCategoriesConfig}
      routePath="/admin/blog-categories/$id/edit"
      transformToFormData={transformCategoryToFormData}
    />
  )
}
