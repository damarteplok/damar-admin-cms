import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, Plus, GripVertical } from 'lucide-react'
import {
  FieldDescription,
  FieldLabel,
  Field as FieldWrapper,
} from '@/components/ui/field'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface FeatureItem {
  id: string
  text: string
}

interface FeaturesInputProps {
  value: string[]
  onChange: (features: string[]) => void
  disabled?: boolean
}

interface SortableFeatureItemProps {
  id: string
  text: string
  index: number
  onRemove: (index: number) => void
  disabled: boolean
}

function SortableFeatureItem({
  id,
  text,
  index,
  onRemove,
  disabled,
}: SortableFeatureItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style} className="p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
          disabled={disabled}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm">{text}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          disabled={disabled}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

export function FeaturesInput({
  value,
  onChange,
  disabled = false,
}: FeaturesInputProps) {
  const { t } = useTranslation()
  const [newFeature, setNewFeature] = useState('')

  // Ensure value is always an array
  const featureValues = Array.isArray(value) ? value : []

  // Convert array to items with IDs for DnD
  const items: FeatureItem[] = featureValues.map((text, index) => ({
    id: `feature-${index}`,
    text,
  }))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      const reorderedItems = arrayMove(items, oldIndex, newIndex)
      onChange(reorderedItems.map((item: FeatureItem) => item.text))
    }
  }

  const handleAdd = () => {
    if (newFeature.trim()) {
      onChange([...featureValues, newFeature.trim()])
      setNewFeature('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(featureValues.filter((_, i) => i !== index))
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
        {t('products.form.features', { defaultValue: 'Features' })}
      </FieldLabel>
      <FieldDescription>
        {t('products.form.features_description', {
          defaultValue:
            'Add product features. Drag and drop to reorder the list.',
        })}
      </FieldDescription>

      <div className="space-y-3 mt-2">
        {/* Existing features with drag & drop */}
        {items.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item, index) => (
                  <SortableFeatureItem
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    index={index}
                    onRemove={handleRemove}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add new feature */}
        <Card className="p-3">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={t('products.form.feature_placeholder', {
                defaultValue: 'e.g., Unlimited users',
              })}
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAdd}
              disabled={disabled || !newFeature.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('products.form.add_feature', {
                defaultValue: 'Add Feature',
              })}
            </Button>
          </div>
        </Card>
      </div>
    </FieldWrapper>
  )
}
