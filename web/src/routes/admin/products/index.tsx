import { createFileRoute } from '@tanstack/react-router'
import { CrudListPage } from '@/components/crud'
import { productsConfig } from '@/features/products'
import type { Product, CreateProductInput, UpdateProductInput } from '@/types'

export const Route = createFileRoute('/admin/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  return (
    <CrudListPage<Product, CreateProductInput, UpdateProductInput>
      config={productsConfig}
    />
  )
}
