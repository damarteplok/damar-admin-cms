import { createFileRoute } from '@tanstack/react-router'
import { CrudListPage } from '@/components/crud'
import { blogCategoriesConfig } from '@/features/blog-categories'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types'

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
