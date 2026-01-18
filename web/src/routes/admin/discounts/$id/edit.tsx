import { createFileRoute } from '@tanstack/react-router'
import type {
  CreateDiscountInput,
  Discount,
  UpdateDiscountInput,
} from '@/types'
import { CrudEditPage } from '@/components/crud'
import {
  discountsConfig,
  transformDiscountToFormData,
} from '@/features/discounts'

export const Route = createFileRoute('/admin/discounts/$id/edit')({
  component: EditDiscountPage,
})

function EditDiscountPage() {
  return (
    <CrudEditPage<Discount, CreateDiscountInput, UpdateDiscountInput>
      config={discountsConfig}
      routePath="/admin/discounts/$id/edit"
      transformToFormData={transformDiscountToFormData}
    />
  )
}
