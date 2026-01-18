import { createFileRoute } from '@tanstack/react-router'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types'
import { CrudCreatePage } from '@/components/crud'
import { blogCategoriesConfig } from '@/features/blog-categories'

export const Route = createFileRoute('/admin/blog-categories/create')({
  component: CreateCategoryPage,
})

function CreateCategoryPage() {
  return (
    <CrudCreatePage<Category, CreateCategoryInput, UpdateCategoryInput>
      config={blogCategoriesConfig}
    />
  )
}
