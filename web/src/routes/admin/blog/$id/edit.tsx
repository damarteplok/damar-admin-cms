import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'urql'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'

import {
  UPDATE_BLOG_POST_MUTATION,
  GET_BLOG_POST_QUERY,
} from '@/lib/graphql/blog.graphql'
import {
  UPLOAD_FILE_MUTATION,
  DELETE_MEDIA_MUTATION,
} from '@/lib/graphql/media.graphql'
import { GET_MY_PROFILE_QUERY } from '@/lib/graphql/user.graphql'
import type {
  GetBlogPostResponse,
  UpdateBlogPostResponse,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  ProfileMeResponse,
  UploadFileResponse,
  DeleteMediaResponse,
} from '@/types'
import { BlogPostForm } from '@/components/features/admin/blog'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'

export const Route = createFileRoute('/admin/blog/$id/edit')({
  component: EditBlogPostPage,
})

function EditBlogPostPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Get current user
  const [userResult] = useQuery<ProfileMeResponse>({
    query: GET_MY_PROFILE_QUERY,
    requestPolicy: 'network-only',
  })

  // Get blog post
  const [result, refetch] = useQuery<GetBlogPostResponse>({
    query: GET_BLOG_POST_QUERY,
    variables: { id },
    requestPolicy: 'cache-and-network',
  })

  const [, updateBlogPostMutation] = useMutation<UpdateBlogPostResponse>(
    UPDATE_BLOG_POST_MUTATION,
  )

  const [, uploadFileMutation] =
    useMutation<UploadFileResponse>(UPLOAD_FILE_MUTATION)

  const [, deleteMediaMutation] = useMutation<DeleteMediaResponse>(
    DELETE_MEDIA_MUTATION,
  )

  const { data, fetching, error } = result
  const { data: userData, fetching: userFetching } = userResult

  const handleUpdate = async (
    formData: CreateBlogPostInput | UpdateBlogPostInput,
  ) => {
    // Separate image file and userId from form data
    const { imageFile, userId, ...blogPostData } = formData as any

    const result = await updateBlogPostMutation({
      input: {
        id,
        ...blogPostData,
      } as UpdateBlogPostInput,
    })

    if (result.data?.updateBlogPost.success) {
      // Handle image upload if new image is provided
      if (imageFile) {
        // Delete old featured image if exists
        const blogPost = data?.blogPost?.data
        if (blogPost?.featuredImage?.id) {
          try {
            const deleteResult = await deleteMediaMutation({
              id: blogPost.featuredImage.id,
            })

            if (!deleteResult.data?.deleteMedia.success) {
              console.error(
                'Failed to delete old image:',
                deleteResult.data?.deleteMedia.message,
              )
            }
          } catch (error) {
            console.error('Error deleting old image:', error)
          }
        }

        // Upload new image
        try {
          const uploadResult = await uploadFileMutation({
            input: {
              content: imageFile,
              fileName: imageFile.name,
              mimeType: imageFile.type,
              modelType: 'blog_post',
              modelId: id,
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
                defaultValue: 'Blog post updated but failed to upload image',
              }),
            )
          } else {
            // Force refetch with network-only to bypass cache
            refetch({ requestPolicy: 'network-only' })
          }
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error(
            t('blog.form.image_upload_failed', {
              defaultValue: 'Blog post updated but failed to upload image',
            }),
          )
        }
      }

      toast.success(
        t('blog.form.updated_success', {
          defaultValue: 'Blog post updated successfully!',
        }),
      )
      navigate({ to: `/admin/blog/${id}` })
      return true
    } else {
      toast.error(
        result.data?.updateBlogPost.message ||
          t('blog.form.updated_failed', {
            defaultValue: 'Failed to update blog post',
          }),
      )
      return false
    }
  }

  const handleCancel = () => {
    navigate({ to: `/admin/blog/${id}` })
  }

  // Loading state
  if ((fetching || userFetching) && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !data?.blogPost.success || !userData?.me.success) {
    return (
      <ErrorState
        title={t('blog.failed_to_load', {
          defaultValue: 'Failed to load blog post',
        })}
        description={
          error?.message ||
          data?.blogPost.message ||
          t('blog.unable_to_fetch', {
            defaultValue: 'Unable to fetch blog post data.',
          })
        }
      />
    )
  }

  const blogPost = data.blogPost.data

  const initialData = {
    title: blogPost.title,
    slug: blogPost.slug,
    body: blogPost.body,
    description: blogPost.description,
    blogPostCategoryId: blogPost.blogPostCategoryId,
    isPublished: blogPost.isPublished,
    publishedAt: blogPost.publishedAt,
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
              {t('blog.edit_title', { defaultValue: 'Edit Blog Post' })}
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {blogPost.title}
            </p>
          </div>
        </div>
      </div>

      {/* Blog Post Form */}
      <Card>
        <CardContent className="pt-6">
          <BlogPostForm
            initialData={initialData}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            submitLabel={t('blog.form.update', { defaultValue: 'Update' })}
            userId={userData.me.data.id}
            blogPostId={id}
            existingFeaturedImage={blogPost.featuredImage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
