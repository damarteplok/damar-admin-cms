import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CREATE_BLOG_POST_MUTATION } from '@/lib/graphql/blog.graphql'
import { UPLOAD_FILE_MUTATION } from '@/lib/graphql/media.graphql'
import { GET_MY_PROFILE_QUERY } from '@/lib/graphql/user.graphql'
import type {
  BlogPostResponse,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  ProfileMeResponse,
  UploadFileResponse,
} from '@/types'
import { BlogPostForm } from '@/components/features/admin/blog'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'
import { ErrorState } from '@/components/ui/error-state'

export const Route = createFileRoute('/admin/blog/create')({
  component: CreateBlogPostPage,
})

function CreateBlogPostPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Get current user
  const [userResult] = useQuery<ProfileMeResponse>({
    query: GET_MY_PROFILE_QUERY,
    requestPolicy: 'network-only',
  })

  const [, createBlogPostMutation] = useMutation<BlogPostResponse>(
    CREATE_BLOG_POST_MUTATION,
  )

  const [, uploadFileMutation] =
    useMutation<UploadFileResponse>(UPLOAD_FILE_MUTATION)

  const {
    data: userData,
    fetching: userFetching,
    error: userError,
  } = userResult

  const handleCreate = async (
    data: CreateBlogPostInput | UpdateBlogPostInput,
    createAnother: boolean = false,
  ) => {
    // Create blog post without image field first
    const { imageFile, ...blogPostData } = data

    console.log('Create route - received data:', data)
    console.log(
      'Create route - blogPostData (without imageFile):',
      blogPostData,
    )

    const result = await createBlogPostMutation({
      input: blogPostData as CreateBlogPostInput,
    })

    if (result.data?.createBlogPost.success) {
      const blogPostId = result.data.createBlogPost.data?.id

      // Upload image after blog post creation if present
      if (imageFile && blogPostId) {
        try {
          const uploadResult = await uploadFileMutation({
            input: {
              content: imageFile,
              fileName: imageFile.name,
              mimeType: imageFile.type,
              modelType: 'blog_post',
              modelId: blogPostId,
              collectionName: 'featured_image',
              disk: 'public',
              isPublic: true,
            },
          })

          if (!uploadResult.data?.uploadFile.success) {
            console.error(
              'Image upload failed:',
              uploadResult.data?.uploadFile.message,
            )
            toast.error(
              t('blog.form.image_upload_failed', {
                defaultValue: 'Blog post created but failed to upload image',
              }),
            )
          }
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error(
            t('blog.form.image_upload_failed', {
              defaultValue: 'Blog post created but failed to upload image',
            }),
          )
        }
      }

      toast.success(
        createAnother
          ? t('blog.form.created_another', {
              defaultValue: 'Blog post created! Create another one.',
            })
          : t('blog.form.created_success', {
              defaultValue: 'Blog post created successfully!',
            }),
      )

      if (!createAnother) {
        navigate({ to: '/admin/blog' })
      }
      return true
    } else {
      toast.error(
        result.data?.createBlogPost.message ||
          t('blog.form.created_failed', {
            defaultValue: 'Failed to create blog post',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: '/admin/blog' })
  }

  // Loading state
  if (userFetching) {
    return (
      <DataTableSkeleton
        showCreateButton={false}
        showSearch={false}
        rows={5}
        columns={1}
      />
    )
  }

  // Error state
  if (userError || !userData?.me.success) {
    return (
      <ErrorState
        title={t('blog.failed_to_load_user', {
          defaultValue: 'Failed to load user data',
        })}
        description={
          userError?.message ||
          userData?.me.message ||
          t('blog.unable_to_fetch_user', {
            defaultValue: 'Unable to fetch user data. Please try again.',
          })
        }
      />
    )
  }

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
              {t('blog.create_title', { defaultValue: 'Create Blog Post' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('blog.create_description', {
                defaultValue: 'Create a new blog post',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Blog Post Form */}
      <Card>
        <CardContent className="pt-6">
          <BlogPostForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            submitLabel={t('blog.form.create', { defaultValue: 'Create' })}
            showCreateAnother={true}
            userId={userData.me.data.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
