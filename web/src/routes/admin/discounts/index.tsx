import { createFileRoute } from '@tanstack/react-router'
import { CrudListPage } from '@/components/crud'
import { discountsConfig } from '@/features/discounts'
import type {
  Discount,
  CreateDiscountInput,
  UpdateDiscountInput,
} from '@/types'

export const Route = createFileRoute('/admin/discounts/')({
  component: DiscountsPage,
})

function DiscountsPage() {
  return (
    <CrudListPage<Discount, CreateDiscountInput, UpdateDiscountInput>
      config={discountsConfig}
    />
  )
}
