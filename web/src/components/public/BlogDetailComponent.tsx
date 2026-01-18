import { useQuery } from 'urql'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react'
import DOMPurify from 'isomorphic-dompurify'

import type { GetBlogPostResponse } from '@/types/blog'
import { GET_BLOG_POST_BY_SLUG_QUERY } from '@/lib/graphql/blog.graphql'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface BlogDetailComponentProps {
  slug: string
}

export function BlogDetailComponent({ slug }: BlogDetailComponentProps) {
  const navigate = useNavigate()

  const [result] = useQuery<{
    blogPostBySlug: GetBlogPostResponse['blogPost']
  }>({
    query: GET_BLOG_POST_BY_SLUG_QUERY,
    variables: { slug },
    requestPolicy: 'cache-and-network',
  })

  const { data, fetching, error } = result

  // Helper to format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'No date'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Loading state
  if (fetching) {
    return (
      <section className="w-full bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  // Error or not found
  if (error || !data?.blogPostBySlug.success || !data.blogPostBySlug.data) {
    return (
      <section className="w-full bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <h2 className="text-3xl font-bold mb-4">Blog post not found</h2>
            <p className="text-muted-foreground mb-8">
              {error?.message ||
                data?.blogPostBySlug.message ||
                'The blog post you are looking for does not exist or has been removed.'}
            </p>
            <Button onClick={() => navigate({ to: '/blog' })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const blogPost = data.blogPostBySlug.data
  const sanitizedContent = DOMPurify.sanitize(blogPost.body, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'blockquote',
      'code',
      'pre',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
  })

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/blog' })}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <div className="space-y-6 mb-12">
          {/* Category Badge */}
          {blogPost.category && (
            <div>
              <Badge variant="default" className="text-sm px-3 py-1">
                {blogPost.category.name}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            {blogPost.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <img
                src={
                  blogPost.author?.avatar?.url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${blogPost.author?.name || 'anonymous'}`
                }
                alt={
                  blogPost.author?.publicName ||
                  blogPost.author?.name ||
                  'Anonymous'
                }
                className="size-12 rounded-full object-cover ring-2 ring-border"
              />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {blogPost.author?.publicName ||
                    blogPost.author?.name ||
                    'Anonymous'}
                </span>
                <span className="text-xs">Author</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(blogPost.publishedAt)}</span>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Article Content */}
        <article
          className="prose prose-lg dark:prose-invert max-w-none 
          prose-headings:scroll-mt-20 prose-headings:font-bold prose-headings:tracking-tight
          prose-p:leading-relaxed prose-p:text-base
          prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
          prose-strong:font-semibold prose-strong:text-foreground
          prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
          prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg
          prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic
          prose-ul:list-disc prose-ol:list-decimal
          prose-li:marker:text-muted-foreground prose-li:my-2"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        <Separator className="my-12" />

        {/* Back to Blog Button */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate({ to: '/blog' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Posts
          </Button>
        </div>
      </div>
    </section>
  )
}
