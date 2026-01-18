import { useState, useCallback } from 'react'
import { useMutation } from 'urql'
import type { DocumentNode } from 'graphql'
import { toast } from 'sonner'

export interface UseCrudFormOptions {
  /** GraphQL mutation document */
  mutation: DocumentNode
  /** Key in the mutation response (e.g., 'createDiscount') */
  mutationKey: string
  /** Callback after successful mutation */
  onSuccess?: () => void
  /** Success toast message */
  successMessage?: string
  /** Error toast message (fallback if API doesn't provide one) */
  errorMessage?: string
  /** Success message for "create another" action */
  successMessageAnother?: string
}

export interface UseCrudFormReturn<TInput> {
  /** Submit form data */
  handleSubmit: (data: TInput, createAnother?: boolean) => Promise<boolean>
  /** Loading state */
  isSubmitting: boolean
}

/**
 * Generic hook for CRUD form mutations (create/update)
 * Handles mutation execution, toast notifications, and loading state
 *
 * @example
 * ```tsx
 * const { handleSubmit, isSubmitting } = useCrudForm<CreateDiscountInput>({
 *   mutation: CREATE_DISCOUNT_MUTATION,
 *   mutationKey: 'createDiscount',
 *   onSuccess: () => navigate({ to: '/admin/discounts' }),
 *   successMessage: 'Discount created successfully!',
 * })
 * ```
 */
export function useCrudForm<TInput>(
  options: UseCrudFormOptions,
): UseCrudFormReturn<TInput> {
  const {
    mutation,
    mutationKey,
    onSuccess,
    successMessage = 'Saved successfully!',
    errorMessage = 'Failed to save',
    successMessageAnother = 'Saved! Create another one.',
  } = options

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, executeMutation] = useMutation(mutation)

  const handleSubmit = useCallback(
    async (data: TInput, createAnother = false): Promise<boolean> => {
      setIsSubmitting(true)

      try {
        const result = await executeMutation({ input: data })
        const response = result.data?.[mutationKey]

        if (response?.success) {
          toast.success(createAnother ? successMessageAnother : successMessage)

          if (!createAnother) {
            onSuccess?.()
          }

          setIsSubmitting(false)
          return true
        } else {
          toast.error(response?.message || errorMessage)
          setIsSubmitting(false)
          return false
        }
      } catch (error) {
        console.error('Form submission error:', error)
        toast.error(errorMessage)
        setIsSubmitting(false)
        return false
      }
    },
    [
      executeMutation,
      mutationKey,
      onSuccess,
      successMessage,
      successMessageAnother,
      errorMessage,
    ],
  )

  return {
    handleSubmit,
    isSubmitting,
  }
}
