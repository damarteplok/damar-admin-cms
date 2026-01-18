import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import { useCrudForm } from '@/hooks/crud'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import type { CrudConfig } from '@/types'

interface CrudCreatePageProps<
  TModel extends { id: string },
  TCreateInput,
  TUpdateInput,
> {
  config: CrudConfig<TModel, TCreateInput, TUpdateInput>
}

/**
 * Generic CRUD Create Page Component
 * Provides a form wrapper with header, navigation, and mutation handling
 *
 * @example
 * ```tsx
 * export function CreateDiscountPage() {
 *   return <CrudCreatePage config={discountsConfig} />
 * }
 * ```
 */
export function CrudCreatePage<
  TModel extends { id: string },
  TCreateInput,
  TUpdateInput,
>({ config }: CrudCreatePageProps<TModel, TCreateInput, TUpdateInput>) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleCancel = () => {
    navigate({ to: config.basePath })
  }

  const handleSuccess = () => {
    navigate({ to: config.basePath })
  }

  // Generate mutation key: use explicit key if provided, otherwise derive from resourceName
  const singularName =
    config.resourceName.charAt(0).toUpperCase() +
    config.resourceName.slice(1, -1)
  const createMutationKey = config.queries.createKey || `create${singularName}`

  const { handleSubmit, isSubmitting } = useCrudForm<TCreateInput>({
    mutation: config.queries.create,
    mutationKey: createMutationKey,
    onSuccess: handleSuccess,
    successMessage:
      config.translations.createdSuccess ||
      t(`${config.resourceName}.form.created_success`, {
        defaultValue: 'Created successfully!',
      }),
    successMessageAnother:
      config.translations.createdAnother ||
      t(`${config.resourceName}.form.created_another`, {
        defaultValue: 'Created! Create another one.',
      }),
    errorMessage:
      config.translations.createFailed ||
      t(`${config.resourceName}.form.created_failed`, {
        defaultValue: 'Failed to create',
      }),
  })

  const FormComponent = config.FormComponent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {config.translations.createTitle ||
                t(`${config.resourceName}.create_title`, {
                  defaultValue: 'Create',
                })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {config.translations.createDescription ||
                t(`${config.resourceName}.create_description`, {
                  defaultValue: 'Create a new item',
                })}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <FormComponent
            onSubmit={
              handleSubmit as (
                data: TCreateInput | TUpdateInput,
                createAnother?: boolean,
              ) => Promise<boolean>
            }
            onCancel={handleCancel}
            submitLabel={t(`${config.resourceName}.form.create`, {
              defaultValue: 'Create',
            })}
            showCreateAnother={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
