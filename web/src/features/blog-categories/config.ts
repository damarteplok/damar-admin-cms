import type {
  Category,
  CreateCategoryInput,
  CrudConfig,
  CrudTranslations,
  UpdateCategoryInput,
} from '@/types'

import {
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  GET_CATEGORIES_QUERY,
  GET_CATEGORY_QUERY,
  UPDATE_CATEGORY_MUTATION,
} from '@/lib/graphql/blog.graphql'

import { createCategoryColumns } from '@/components/features/admin/blog/category-columns'
import { CategoryForm } from '@/components/features/admin/blog/category-form'

/**
 * CRUD Configuration for Blog Categories
 */
export const blogCategoriesConfig: CrudConfig<
  Category,
  CreateCategoryInput,
  UpdateCategoryInput
> = {
  resourceName: 'category', // Using singular 'category' as per existing translations structure
  dataKey: 'categories',
  basePath: '/admin/blog-categories',

  queries: {
    list: GET_CATEGORIES_QUERY,
    get: GET_CATEGORY_QUERY,
    create: CREATE_CATEGORY_MUTATION,
    update: UPDATE_CATEGORY_MUTATION,
    delete: DELETE_CATEGORY_MUTATION,
    // Explicit keys to avoid auto-generation issues with 'category' resource name
    getKey: 'category',
    createKey: 'createCategory',
    updateKey: 'updateCategory',
    deleteKey: 'deleteCategory',
  },

  createColumns: createCategoryColumns,
  FormComponent: CategoryForm,

  translations: {
    // Relying on existing 'category' translations in id.json/en.json
    // But providing fallbacks here just in case
    title: 'Blog Categories',
    searchPlaceholder: 'Search categories...',
    createButton: 'Create Category',
  } as Partial<CrudTranslations>,

  defaultSort: {
    field: 'created_at',
    order: 'desc',
  },

  searchColumn: 'name',
  skeletonColumns: 4,
}

/**
 * Transform Category model to form initial data
 */
export function transformCategoryToFormData(
  category: Category,
): Partial<CreateCategoryInput> {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
  }
}
