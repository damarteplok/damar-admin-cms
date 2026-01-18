import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
  Quote,
  ImageIcon,
  Link2,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline as UnderlineIcon,
  Strikethrough,
  Code2,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useMutation } from 'urql'
import { UPLOAD_FILE_MUTATION } from '@/lib/graphql/media.graphql'
import { toast } from 'sonner'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  modelId?: string // ID of the blog post for image uploads
  modelType?: string // Type of model (default: 'blog_post')
  placeholder?: string
  disabled?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  className,
  modelId = '1', // Default to 1 for temporary uploads
  modelType = 'blog_post',
  placeholder,
  disabled = false,
}: RichTextEditorProps) {
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const imageDropdownRef = useRef<HTMLDivElement>(null)
  const linkDropdownRef = useRef<HTMLDivElement>(null)

  const [, uploadFileMutation] = useMutation(UPLOAD_FILE_MUTATION)

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        imageDropdownRef.current &&
        !imageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowImageInput(false)
        setImageUrl('')
      }
      if (
        linkDropdownRef.current &&
        !linkDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLinkInput(false)
        setLinkUrl('')
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowImageInput(false)
        setShowLinkInput(false)
        setImageUrl('')
        setLinkUrl('')
      }
    }

    if (showImageInput || showLinkInput) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [showImageInput, showLinkInput])

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Image.configure({
          inline: true,
          allowBase64: true,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline underline-offset-4',
          },
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Placeholder.configure({
          placeholder: placeholder || 'Start typing...',
        }),
      ],
      content: value,
      editable: !disabled,
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm max-w-none min-h-[200px] p-3 focus:outline-none',
            'dark:prose-invert',
            'prose-img:rounded-lg prose-img:shadow-md',
            disabled && 'opacity-50 cursor-not-allowed',
          ),
        },
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
      },
    },
    [disabled, placeholder], // Remove value from dependencies to prevent re-rendering on every keystroke
  )

  // Sync editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImageInput(false)
    }
  }, [editor, imageUrl])

  const setLink = useCallback(() => {
    if (linkUrl && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }, [editor, linkUrl])

  const uploadImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !editor) return

      setIsUploading(true)

      try {
        // Call GraphQL mutation to upload to media service
        const result = await uploadFileMutation({
          input: {
            content: file,
            fileName: file.name,
            mimeType: file.type,
            modelType: modelType,
            modelId: modelId,
            collectionName: 'content_images',
            name: file.name,
            disk: 'minio',
            isPublic: true, // CRITICAL: Make blog images public
          },
        })

        if (result.data?.uploadFile?.success && result.data.uploadFile.data) {
          const media = result.data.uploadFile.data
          // Use publicUrl for permanent SEO-friendly URL
          const imageUrl = media.publicUrl || media.url

          if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run()
            toast.success('Image uploaded successfully')
          } else {
            throw new Error('No URL returned from upload')
          }
        } else {
          throw new Error(result.data?.uploadFile?.message || 'Upload failed')
        }
      } catch (error) {
        console.error('Image upload error:', error)
        toast.error('Failed to upload image')
      } finally {
        setIsUploading(false)
        // Reset file input
        event.target.value = ''
      }
    },
    [editor, uploadFileMutation, modelId, modelType],
  )

  if (!editor) {
    return null
  }

  return (
    <div className={cn('border rounded-md', className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-accent')}
          title="Bold"
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('italic') && 'bg-accent',
          )}
          title="Italic"
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('underline') && 'bg-accent',
          )}
          title="Underline"
          disabled={disabled}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('strike') && 'bg-accent',
          )}
          title="Strikethrough"
          disabled={disabled}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-accent')}
          title="Inline Code"
          disabled={disabled}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('heading', { level: 2 }) && 'bg-accent',
          )}
          title="Heading 2"
          disabled={disabled}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('heading', { level: 3 }) && 'bg-accent',
          )}
          title="Heading 3"
          disabled={disabled}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bulletList') && 'bg-accent',
          )}
          title="Bullet List"
          disabled={disabled}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('orderedList') && 'bg-accent',
          )}
          title="Numbered List"
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Block Elements */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('blockquote') && 'bg-accent',
          )}
          title="Blockquote"
          disabled={disabled}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('codeBlock') && 'bg-accent',
          )}
          title="Code Block"
          disabled={disabled}
        >
          <Code2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 w-8 p-0"
          title="Horizontal Line"
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive({ textAlign: 'left' }) && 'bg-accent',
          )}
          title="Align Left"
          disabled={disabled}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive({ textAlign: 'center' }) && 'bg-accent',
          )}
          title="Align Center"
          disabled={disabled}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive({ textAlign: 'right' }) && 'bg-accent',
          )}
          title="Align Right"
          disabled={disabled}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Media & Links */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageInput(!showImageInput)}
            className="h-8 w-8 p-0"
            title="Insert Image"
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          {showImageInput && (
            <div
              ref={imageDropdownRef}
              className="absolute top-full left-0 mt-1 p-2 bg-popover border rounded-md shadow-md z-10 w-64"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Insert Image
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowImageInput(false)
                    setImageUrl('')
                  }}
                  className="h-5 w-5 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addImage()
                    }
                  }}
                  className="text-sm"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={addImage}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    Insert
                  </Button>
                  <label className="flex-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={isUploading}
                      onClick={() =>
                        document.getElementById('imageUpload')?.click()
                      }
                    >
                      {isUploading && (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      )}
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={uploadImage}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run()
              } else {
                setShowLinkInput(!showLinkInput)
              }
            }}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('link') && 'bg-accent',
            )}
            title="Insert Link"
            disabled={disabled}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          {showLinkInput && (
            <div
              ref={linkDropdownRef}
              className="absolute top-full left-0 mt-1 p-2 bg-popover border rounded-md shadow-md z-10 w-64"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Insert Link
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowLinkInput(false)
                    setLinkUrl('')
                  }}
                  className="h-5 w-5 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      setLink()
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={setLink}
                  className="w-full"
                >
                  Insert Link
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-border mx-1" />

        {/* History */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          className="h-8 w-8 p-0"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          className="h-8 w-8 p-0"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
