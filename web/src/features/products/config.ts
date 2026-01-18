import type { CrudConfig, CrudTranslations } from '@/types'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types'

import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_QUERY,
  CREATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
} from '@/lib/graphql/product.graphql'

import { createProductColumns } from '@/components/features/admin/products/product-columns'
import { ProductForm } from '@/components/features/admin/products/product-form'

/**
 * CRUD Configuration for Products
 */
export const productsConfig: CrudConfig<
  Product,
  CreateProductInput,
  UpdateProductInput
> = {
  resourceName: 'products',
  dataKey: 'products',
  basePath: '/admin/products',

  queries: {
    list: GET_PRODUCTS_QUERY,
    get: GET_PRODUCT_QUERY,
    create: CREATE_PRODUCT_MUTATION,
    update: UPDATE_PRODUCT_MUTATION,
    delete: DELETE_PRODUCT_MUTATION,
  },

  createColumns: createProductColumns,
  FormComponent: ProductForm,

  translations: {
    title: 'Products',
    searchPlaceholder: 'Search products...',
    createButton: 'Create product',
    failedToLoad: 'Failed to load products',
    errorOccurred:
      'An error occurred while fetching products. Please try again.',
    unableToFetch: 'Unable to fetch products data.',

    deleteTitle: 'Delete Product?',
    deleteDescription:
      'This action cannot be undone. This will permanently delete the product',
    deleteConfirm: 'Delete',

    createTitle: 'Create Product',
    createDescription: 'Create a new product',
    editTitle: 'Edit Product',
    editDescription: 'Update product details',

    viewTitle: 'Product Details',
    viewDescription: 'View product details',
    notFound: 'Product Not Found',
    loadFailed: 'Failed to load product',

    createdSuccess: 'Product created successfully!',
    createdAnother: 'Product created! Create another one.',
    createFailed: 'Failed to create product',
    updatedSuccess: 'Product updated successfully!',
    updateFailed: 'Failed to update product',
    deletedSuccess: 'Product deleted',
    deleteFailed: 'Failed to delete product',
  } as Partial<CrudTranslations>,

  defaultSort: {
    field: 'created_at',
    order: 'desc',
  },

  searchColumn: 'name',
  skeletonColumns: 5,
}

/**
 * Transform Product model to form initial data
 */
export function transformProductToFormData(
  product: Product,
): Partial<CreateProductInput> {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description || undefined,
    metadata: product.metadata || undefined,
    features: product.features || undefined,
    isPopular: product.isPopular,
    isDefault: product.isDefault,
  }
}
