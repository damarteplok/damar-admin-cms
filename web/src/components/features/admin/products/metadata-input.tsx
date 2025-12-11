import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, Plus } from 'lucide-react'
import {
  FieldDescription,
  FieldLabel,
  Field as FieldWrapper,
} from '@/components/ui/field'

export interface MetadataItem {
  name: string
  value: string
}

interface MetadataInputProps {
  value: MetadataItem[]
  onChange: (metadata: MetadataItem[]) => void
  disabled?: boolean
}

export function MetadataInput({
  value,
  onChange,
  disabled = false,
}: MetadataInputProps) {
  const { t } = useTranslation()
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')

  const handleAdd = () => {
    if (newName.trim() && newValue.trim()) {
      onChange([...value, { name: newName.trim(), value: newValue.trim() }])
      setNewName('')
      setNewValue('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <FieldWrapper>
      <FieldLabel>
        {t('products.form.metadata', { defaultValue: 'Metadata' })}
      </FieldLabel>
      <FieldDescription>
        {t('products.form.metadata_description', {
          defaultValue: 'Add custom key-value pairs for product metadata.',
        })}
      </FieldDescription>

      <div className="space-y-3 mt-2">
        {/* Existing metadata items */}
        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('products.form.metadata_name', {
                          defaultValue: 'Name',
                        })}
                      </p>
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('products.form.metadata_value', {
                          defaultValue: 'Value',
                        })}
                      </p>
                      <p className="text-sm">{item.value}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add new metadata */}
        <Card className="p-3">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                placeholder={t('products.form.metadata_name_placeholder', {
                  defaultValue: 'e.g., color',
                })}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={disabled}
              />
              <Input
                type="text"
                placeholder={t('products.form.metadata_value_placeholder', {
                  defaultValue: 'e.g., blue',
                })}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={disabled}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAdd}
              disabled={disabled || !newName.trim() || !newValue.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('products.form.add_metadata', {
                defaultValue: 'Add Metadata',
              })}
            </Button>
          </div>
        </Card>
      </div>
    </FieldWrapper>
  )
}
