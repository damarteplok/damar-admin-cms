import { createFileRoute } from '@tanstack/react-router'
import { CrudEditPage } from '@/components/crud'
import {
  discountsConfig,
  transformDiscountToFormData,
} from '@/features/discounts'
import type {
  Discount,
  CreateDiscountInput,
  UpdateDiscountInput,
} from '@/types'

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
