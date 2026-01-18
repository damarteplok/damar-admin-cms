import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from 'urql'
import { toast } from 'sonner'
import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'

import type { CrudConfig } from '@/types'

interface CrudEditPageProps<
  TModel extends { id: string },
  TCreateInput,
  TUpdateInput extends { id: string },
> {
  config: CrudConfig<TModel, TCreateInput, TUpdateInput>
  /** Route path for useParams (e.g., '/admin/discounts/$id/edit') */
  routePath: string
  /** Function to transform model data to form initial data */
  transformToFormData: (model: TModel) => Partial<TCreateInput>
}

/**
 * Generic CRUD Edit Page Component
 * Fetches existing data and provides form for updating
 *
 * @example
 * ```tsx
 * export function EditDiscountPage() {
 *   return (
 *     <CrudEditPage
 *       config={discountsConfig}
 *       routePath="/admin/discounts/$id/edit"
 *       transformToFormData={(discount) => ({
 *         name: discount.name,
 *         ...
 *       })}
 *     />
 *   )
 * }
 * ```
 */
export function CrudEditPage<
  TModel extends { id: string },
  TCreateInput,
  TUpdateInput extends { id: string },
>({
  config,
  routePath,
  transformToFormData,
}: CrudEditPageProps<TModel, TCreateInput, TUpdateInput>) {
  const { id } = useParams({ from: routePath as never })
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch existing data
  const [result] = useQuery({
    query: config.queries.get,
    variables: { id },
  })

  // Update mutation - use explicit key if provided
  const singularName =
    config.resourceName.charAt(0).toUpperCase() +
    config.resourceName.slice(1, -1)
  const mutationKey = config.queries.updateKey || `update${singularName}`
  const [, executeMutation] = useMutation(config.queries.update)

  const handleCancel = () => {
    navigate({ to: config.basePath })
  }

  const handleUpdate = async (
    data: TCreateInput | TUpdateInput,
    _createAnother?: boolean,
  ): Promise<boolean> => {
    setIsSubmitting(true)

    const updateInput = {
      ...data,
      id,
    } as TUpdateInput

    try {
      const mutationResult = await executeMutation({ input: updateInput })
      const response = mutationResult.data?.[mutationKey]

      if (response?.success) {
        toast.success(
          config.translations.updatedSuccess ||
            t(`${config.resourceName}.form.updated_success`, {
              defaultValue: 'Updated successfully!',
            }),
        )
        navigate({ to: config.basePath })
        return true
      } else {
        toast.error(
          response?.message ||
            config.translations.updateFailed ||
            t(`${config.resourceName}.form.updated_failed`, {
              defaultValue: 'Failed to update',
            }),
        )
        setIsSubmitting(false)
        return false
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error(
        config.translations.updateFailed ||
          t(`${config.resourceName}.form.updated_failed`, {
            defaultValue: 'Failed to update',
          }),
      )
      setIsSubmitting(false)
      return false
    }
  }

  const { data: queryData, fetching, error } = result
  // Use explicit getKey if provided, otherwise derive from resourceName
  const singularKey = config.queries.getKey || config.resourceName.slice(0, -1)
  const responseData = queryData?.[singularKey]

  // Loading state
  if (fetching) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !responseData?.success || !responseData?.data) {
    return (
      <ErrorState
        title={
          config.translations.notFound ||
          t(`${config.resourceName}.not_found`, { defaultValue: 'Not Found' })
        }
        description={
          error?.message ||
          responseData?.message ||
          config.translations.loadFailed ||
          t(`${config.resourceName}.load_failed`, {
            defaultValue: 'Failed to load',
          })
        }
        actionLabel={t('common.go_back', { defaultValue: 'Go Back' })}
        onAction={() => navigate({ to: config.basePath })}
      />
    )
  }

  const model = responseData.data as TModel
  const initialData = transformToFormData(model)
  const FormComponent = config.FormComponent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {config.translations.editTitle ||
              t(`${config.resourceName}.edit_title`, {
                defaultValue: 'Edit',
              })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {config.translations.editDescription ||
              t(`${config.resourceName}.edit_description`, {
                defaultValue: 'Update details',
              })}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <FormComponent
            initialData={initialData}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t(`${config.resourceName}.form.save`, {
              defaultValue: 'Save',
            })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
