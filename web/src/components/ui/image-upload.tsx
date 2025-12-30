import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string | File
  onChange: (file: File | null) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
}: ImageUploadProps) {
  const { t } = useTranslation()
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null,
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    onChange(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleBrowse = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
        aria-label={t('blog.form.image_upload_aria', 'Upload image file')}
      />

      {preview ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={preview}
              alt="Upload preview"
              className="h-full w-full object-cover"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center aspect-video w-full rounded-lg border-2 border-dashed transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          )}
          onClick={handleBrowse}
        >
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t('blog.form.image_upload', 'Drag & Drop your files or')}
              </p>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                disabled={disabled}
              >
                <Upload className="mr-2 h-4 w-4" />
                {t('blog.form.browse', 'Browse')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('blog.form.image_format', 'PNG, JPG, GIF up to 10MB')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
