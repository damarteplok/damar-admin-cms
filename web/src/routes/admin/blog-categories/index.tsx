import { createFileRoute } from '@tanstack/react-router'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types'
import { CrudListPage } from '@/components/crud'
import { blogCategoriesConfig } from '@/features/blog-categories'

export const Route = createFileRoute('/admin/blog-categories/')({
  component: BlogCategoriesPage,
})

function BlogCategoriesPage() {
  return (
    <CrudListPage<Category, CreateCategoryInput, UpdateCategoryInput>
      config={blogCategoriesConfig}
    />
  )
}
