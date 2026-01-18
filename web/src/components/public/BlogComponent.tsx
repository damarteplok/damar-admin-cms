import { useState, useEffect, useMemo } from 'react'
import { useQuery } from 'urql'
import { Search, X, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  GET_BLOG_POSTS_QUERY,
  GET_CATEGORIES_QUERY,
} from '@/lib/graphql/blog.graphql'
import type { BlogPostsResponse, CategoriesResponse } from '@/types/blog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface BlogComponentProps {
  heading?: string
  subheading?: string
}

export const BlogComponent = ({ subheading }: BlogComponentProps) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const perPage = 10

  // Fetch published blog posts
  const [postsResult] = useQuery<BlogPostsResponse>({
    query: GET_BLOG_POSTS_QUERY,
    variables: {
      page,
      perPage,
      publishedOnly: true,
      categoryId: selectedCategory,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    },
    requestPolicy: 'cache-and-network',
  })

  // Fetch categories
  const [categoriesResult] = useQuery<CategoriesResponse>({
    query: GET_CATEGORIES_QUERY,
    variables: { page: 1, perPage: 50 },
    requestPolicy: 'cache-and-network',
  })

  const { data: postsData, fetching: postsFetching } = postsResult
  const { data: categoriesData, fetching: categoriesFetching } =
    categoriesResult

  const allPosts = postsData?.blogPosts.data.blogPosts || []
  const total = postsData?.blogPosts.data.total || 0
  const categories = categoriesData?.categories.data.categories || []

  // Filter published posts (backup filter if backend doesn't work)
  const publishedPosts = useMemo(
    () => allPosts.filter((post) => post.isPublished),
    [allPosts],
  )

  // Client-side search filtering (real-time)
  const posts = useMemo(() => {
    if (!searchInput.trim()) return publishedPosts

    const query = searchInput.toLowerCase()
    return publishedPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query) ||
        post.category?.name.toLowerCase().includes(query),
    )
  }, [publishedPosts, searchInput])

  // Reset page when search or category changes
  useEffect(() => {
    setPage(1)
  }, [searchInput, selectedCategory])

  const handleClearSearch = () => {
    setSearchInput('')
  }

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(categoryId)
    }
  }

  // Helper to extract text from HTML
  const getTextFromHtml = (html: string, maxLength: number = 150) => {
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Helper to format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return t('public_blog.no_date', { defaultValue: 'No date' })
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const hasMore = total > page * perPage
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {
              t('public_blog.heading', {
                defaultValue: 'Where <1>builders</1> think out loud',
              }).split('<1>')[0]
            }
            <span className="text-primary">
              {t('public_blog.heading_highlight', { defaultValue: 'builders' })}
            </span>
            {t('public_blog.heading', {
              defaultValue: 'Where <1>builders</1> think out loud',
            }).split('</1>')[1] || ' think out loud'}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            {subheading ||
              t('public_blog.subheading', {
                defaultValue:
                  'Thoughts on building, designing, and shipping. Sometimes technical, always useful.',
              })}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('public_blog.search_placeholder', {
                defaultValue: 'Search blog posts... (real-time)',
              })}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Categories Filter */}
          {!categoriesFetching && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2 self-center">
                {t('public_blog.categories', { defaultValue: 'Categories:' })}
              </span>
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                {t('public_blog.all', { defaultValue: 'All' })}
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {postsFetching && posts.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* No Results */}
        {!postsFetching && posts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">
              {t('public_blog.no_posts_found', {
                defaultValue: 'No blog posts found',
              })}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchInput
                ? `${t('public_blog.no_results_for', { defaultValue: 'No results found for' })} "${searchInput}"`
                : t('public_blog.no_published_posts', {
                    defaultValue: 'No published blog posts available yet.',
                  })}
            </p>
            {(searchInput || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput('')
                  setSelectedCategory(null)
                }}
              >
                {t('public_blog.clear_filters', {
                  defaultValue: 'Clear Filters',
                })}
              </Button>
            )}
          </div>
        )}

        {/* Blog Posts */}
        {posts.length > 0 && (
          <>
            <div className="space-y-12">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group grid gap-8 md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_480px]"
                >
                  <a
                    href={`/blog/${post.slug}`}
                    className="contents cursor-pointer"
                  >
                    {/* Content */}
                    <div className="flex flex-col justify-center space-y-4">
                      {/* Category */}
                      {post.category && (
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                            {post.category.name}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-primary md:text-3xl lg:text-4xl">
                        {post.title}
                      </h2>

                      {/* Description */}
                      <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
                        {post.description || getTextFromHtml(post.body, 200)}
                      </p>

                      {/* Author & Date */}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              post.author?.avatar?.url ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name || 'anonymous'}`
                            }
                            alt={
                              post.author?.publicName ||
                              post.author?.name ||
                              'Anonymous'
                            }
                            className="size-10 rounded-full object-cover ring-2 ring-border"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {post.author?.publicName ||
                                post.author?.name ||
                                'Anonymous'}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {formatDate(post.publishedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="ml-auto">
                          <div className="text-foreground hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors">
                            Read more
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="transition-transform group-hover:translate-x-1"
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail - Placeholder since we don't have featured image yet */}
                    <div className="order-first md:order-last">
                      <div className="block overflow-hidden rounded-2xl bg-primary/10">
                        <div className="aspect-[4/3] w-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-primary/30">
                            {post.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {total > perPage && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || postsFetching}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(total / perPage)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || postsFetching}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
