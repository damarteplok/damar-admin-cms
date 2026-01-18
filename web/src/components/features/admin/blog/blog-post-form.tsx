import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

import type { CreateBlogPostInput, Media, UpdateBlogPostInput } from '@/types'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ImageUpload } from '@/components/ui/image-upload'
import { SearchSelect } from '@/components/common/search-select'
import { GET_USERS_QUERY } from '@/lib/graphql/auth.graphql'
import { GET_CATEGORIES_QUERY } from '@/lib/graphql/blog.graphql'

interface BlogPostFormProps {
  initialData?: Partial<CreateBlogPostInput>
  onSubmit: (
    data: CreateBlogPostInput | UpdateBlogPostInput,
    createAnother?: boolean,
  ) => Promise<boolean>
  onCancel: () => void
  submitLabel?: string
  showCreateAnother?: boolean
  userId?: string
  blogPostId?: string // For image uploads
  existingFeaturedImage?: Media // Add existing featured image
}

export function BlogPostForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  showCreateAnother = false,
  userId,
  blogPostId,
  existingFeaturedImage,
}: BlogPostFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      body: initialData?.body || '',
      description: initialData?.description || '',
      blogPostCategoryId: initialData?.blogPostCategoryId || '',
      authorId: initialData?.authorId || userId || '',
      isPublished: initialData?.isPublished || false,
      publishedAt: initialData?.publishedAt
        ? new Date(initialData.publishedAt * 1000).toISOString().slice(0, 16)
        : '',
      imageFile: null as File | null,
      existingImageUrl:
        existingFeaturedImage?.url || existingFeaturedImage?.publicUrl || null,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        const submitData: any = {
          title: value.title,
          body: value.body,
          userId: userId || '',
          isPublished: value.isPublished,
        }

        // Only add optional fields if they have values
        if (value.slug && value.slug.trim() !== '') {
          submitData.slug = value.slug
        }
        if (value.description && value.description.trim() !== '') {
          submitData.description = value.description
        }
        if (value.blogPostCategoryId) {
          submitData.blogPostCategoryId = value.blogPostCategoryId
        }
        if (value.authorId) {
          submitData.authorId = value.authorId
        }

        // Convert publishedAt to Unix timestamp if provided AND isPublished is true
        if (
          value.publishedAt &&
          value.publishedAt.trim() !== '' &&
          value.isPublished
        ) {
          submitData.publishedAt = Math.floor(
            new Date(value.publishedAt).getTime() / 1000,
          )
        }

        // Add image file if present
        if (value.imageFile) {
          submitData.imageFile = value.imageFile
        }

        console.log('Form values before submit:', value)
        console.log('Submit data being sent:', submitData)

        const success = await onSubmit(submitData, false)
        if (!success) {
          setIsSubmitting(false)
        }
      } catch (error) {
        setIsSubmitting(false)
        console.error('Form submission error:', error)
      }
    },
  })

  const handleCreateAnother = async () => {
    setIsSubmitting(true)
    try {
      const values = form.state.values
      const submitData: any = {
        title: values.title,
        body: values.body,
        userId: userId || '',
        isPublished: values.isPublished,
      }

      // Only add optional fields if they have values
      if (values.slug && values.slug.trim() !== '') {
        submitData.slug = values.slug
      }
      if (values.description && values.description.trim() !== '') {
        submitData.description = values.description
      }
      if (values.blogPostCategoryId) {
        submitData.blogPostCategoryId = values.blogPostCategoryId
      }
      if (values.authorId) {
        submitData.authorId = values.authorId
      }

      // Convert publishedAt to Unix timestamp if provided AND isPublished is true
      if (
        values.publishedAt &&
        values.publishedAt.trim() !== '' &&
        values.isPublished
      ) {
        submitData.publishedAt = Math.floor(
          new Date(values.publishedAt).getTime() / 1000,
        )
      }

      // Add image file if present
      if (values.imageFile) {
        submitData.imageFile = values.imageFile
      }

      const success = await onSubmit(submitData, true)
      if (success) {
        // Reset form for next entry
        form.reset()
      }
      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      console.error('Form submission error:', error)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title Field */}
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                !value || value.trim().length === 0
                  ? t('validation.titleRequired')
                  : undefined,
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('blog.form.title', 'Title')}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t(
                    'blog.form.titlePlaceholder',
                    'Enter blog post title',
                  )}
                  disabled={isSubmitting}
                  autoFocus
                />
                <FieldDescription>
                  {t(
                    'blog.form.titleDescription',
                    'The title of your blog post.',
                  )}
                </FieldDescription>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </Field>
            )}
          </form.Field>

          {/* Description Field */}
          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('blog.form.description', 'Description')}
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t(
                    'blog.form.descriptionPlaceholder',
                    'Brief description for SEO',
                  )}
                  disabled={isSubmitting}
                  rows={2}
                />
                <FieldDescription>
                  {t(
                    'blog.form.descriptionDescription',
                    'Brief description for meta tags and SEO.',
                  )}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Body Field */}
          <form.Field
            name="body"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return t('validation.bodyRequired')
                }
                // Check if content has actual text (strip HTML tags)
                const textContent = value.replace(/<[^>]*>/g, '').trim()
                if (textContent.length === 0) {
                  return t('validation.bodyRequired')
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('blog.form.body', 'Content')}
                </FieldLabel>
                <RichTextEditor
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  className="min-h-[400px]"
                  modelId={blogPostId || '1'}
                  modelType="blog_post"
                />
                <FieldDescription>
                  {t(
                    'blog.form.bodyDescription',
                    'Write your blog post content here.',
                  )}
                </FieldDescription>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </Field>
            )}
          </form.Field>
        </div>

        {/* Right Column - Sidebar (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Slug Field */}
          <form.Field name="slug">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('blog.form.slug', 'Slug')}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t(
                    'blog.form.slugPlaceholder',
                    'auto-generated-from-title',
                  )}
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  {t(
                    'blog.form.slugDescription',
                    'Optional, auto-generated if left empty.',
                  )}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Category Field */}
          <form.Field name="blogPostCategoryId">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('blog.form.category', 'Category')}
                </FieldLabel>
                <SearchSelect
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  query={GET_CATEGORIES_QUERY}
                  queryKey="categories"
                  placeholder={t(
                    'blog.form.selectCategory',
                    'Select a category...',
                  )}
                  searchPlaceholder={t(
                    'blog.form.searchCategory',
                    'Search categories...',
                  )}
                  emptyText={t('blog.form.noCategories', 'No categories found')}
                  disabled={isSubmitting}
                  formatOption={(category: any) => ({
                    value: category.id,
                    label: category.name,
                  })}
                />
                <FieldDescription>
                  {t(
                    'blog.form.categoryDescription',
                    'Optional category for organizing posts.',
                  )}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Author Field */}
          <form.Field name="authorId">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('blog.form.author', 'Author')}
                </FieldLabel>
                <SearchSelect
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  query={GET_USERS_QUERY}
                  queryKey="users"
                  placeholder={t(
                    'blog.form.selectAuthor',
                    'Select an author...',
                  )}
                  searchPlaceholder={t(
                    'blog.form.searchAuthor',
                    'Search users...',
                  )}
                  emptyText={t('blog.form.noUsers', 'No users found')}
                  disabled={isSubmitting}
                  formatOption={(user: any) => ({
                    value: user.id,
                    label: `${user.name} (${user.email})`,
                  })}
                />
                <FieldDescription>
                  {t(
                    'blog.form.authorDescription',
                    'Select the author of this post.',
                  )}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Image Upload Field */}
          <form.Field name="imageFile">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('blog.form.image', 'Featured Image')}
                </FieldLabel>
                <ImageUpload
                  value={
                    field.state.value ||
                    form.state.values.existingImageUrl ||
                    undefined
                  }
                  onChange={(file) => field.handleChange(file)}
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  {t(
                    'blog.form.imageDescription',
                    'Optional featured image for your blog post.',
                  )}
                </FieldDescription>
              </Field>
            )}
          </form.Field>

          {/* Is Published Field */}
          <form.Field name="isPublished">
            {(field) => (
              <Field>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor={field.name}>
                      {t('blog.form.isPublished', 'Published')}
                    </FieldLabel>
                    <FieldDescription>
                      {t(
                        'blog.form.isPublishedDescription',
                        'Make this post visible to the public.',
                      )}
                    </FieldDescription>
                  </div>
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                    disabled={isSubmitting}
                  />
                </div>
              </Field>
            )}
          </form.Field>

          {/* Published At Field */}
          <form.Field name="publishedAt">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {t('blog.form.publishedAt', 'Published At')}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isSubmitting}
                  placeholder=""
                />
                <FieldDescription>
                  {t(
                    'blog.form.publishedAtDescription',
                    'Optional: Set a specific publish date/time. Leave empty for no specific date.',
                  )}
                </FieldDescription>
              </Field>
            )}
          </form.Field>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-6 border-t mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>

        {showCreateAnother && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleCreateAnother}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('blog.form.create_another', {
              defaultValue: 'Create & Create Another',
            })}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('blog.form.cancel', { defaultValue: 'Cancel' })}
        </Button>
      </div>
    </form>
  )
}
