import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Trash2, User } from 'lucide-react'
import { MediaFile } from '@/types'

interface AvatarUploadProps {
  avatar?: MediaFile
  userName: string
  onUpload: (file: File) => Promise<boolean>
  onDelete?: () => Promise<boolean>
  disabled?: boolean
}

export function AvatarUpload({
  avatar,
  userName,
  onUpload,
  onDelete,
  disabled = false,
}: AvatarUploadProps) {
  const { t } = useTranslation()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(
        t('profile.avatar.invalid_type', {
          defaultValue: 'Please select an image file',
        }),
      )
      return
    }

    // TODO : dibuat env aja supaya bisa diatur limitnya
    if (file.size > 5 * 1024 * 1024) {
      alert(
        t('profile.avatar.too_large', {
          defaultValue: 'Image must be smaller than 5MB',
        }),
      )
      return
    }

    setIsUploading(true)
    try {
      await onUpload(file)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    const confirmed = confirm(
      t('profile.avatar.confirm_delete', {
        defaultValue: 'Are you sure you want to remove your avatar?',
      }),
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        {avatar?.url ? (
          <AvatarImage src={avatar.url} alt={userName} />
        ) : (
          <AvatarFallback className="text-2xl">
            {getInitials(userName) || <User className="h-12 w-12" />}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isUploading || isDeleting}
          className="hidden"
          aria-label={t('profile.avatar.input_label', {
            defaultValue: 'Upload profile picture',
          })}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading || isDeleting}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('profile.avatar.uploading', { defaultValue: 'Uploading...' })}
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              {avatar
                ? t('profile.avatar.change', { defaultValue: 'Change Avatar' })
                : t('profile.avatar.upload', { defaultValue: 'Upload Avatar' })}
            </>
          )}
        </Button>

        {avatar && onDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={disabled || isUploading || isDeleting}
            className="text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('profile.avatar.deleting', { defaultValue: 'Removing...' })}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('profile.avatar.remove', { defaultValue: 'Remove Avatar' })}
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          {t('profile.avatar.help', {
            defaultValue: 'JPG, PNG or GIF. Max 5MB',
          })}
        </p>
      </div>
    </div>
  )
}
