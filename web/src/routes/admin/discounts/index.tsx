import { createFileRoute } from '@tanstack/react-router'
import type {
  CreateDiscountInput,
  Discount,
  UpdateDiscountInput,
} from '@/types'
import { CrudListPage } from '@/components/crud'
import { discountsConfig } from '@/features/discounts'

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
