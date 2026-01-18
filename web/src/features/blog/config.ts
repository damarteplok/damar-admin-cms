import type { CrudConfig, CrudTranslations } from '@/types'
import type {
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from '@/types'

import {
  GET_BLOG_POSTS_QUERY,
  GET_BLOG_POST_QUERY,
  CREATE_BLOG_POST_MUTATION,
  UPDATE_BLOG_POST_MUTATION,
  DELETE_BLOG_POST_MUTATION,
} from '@/lib/graphql/blog.graphql'

import { createBlogPostColumns } from '@/components/features/admin/blog/blog-post-columns'
import { BlogPostForm } from '@/components/features/admin/blog/blog-post-form'

/**
 * CRUD Configuration for Blog Posts
 */
export const blogConfig: CrudConfig<
  BlogPost,
  CreateBlogPostInput,
  UpdateBlogPostInput
> = {
  resourceName: 'blog',
  dataKey: 'blogPosts',
  basePath: '/admin/blog',

  queries: {
    list: GET_BLOG_POSTS_QUERY,
    get: GET_BLOG_POST_QUERY,
    create: CREATE_BLOG_POST_MUTATION,
    update: UPDATE_BLOG_POST_MUTATION,
    delete: DELETE_BLOG_POST_MUTATION,
    // Explicit keys
    getKey: 'blogPost',
    createKey: 'createBlogPost',
    updateKey: 'updateBlogPost',
    deleteKey: 'deleteBlogPost',
  },

  createColumns: createBlogPostColumns,
  FormComponent: BlogPostForm, // Used for reference, but Create/Edit pages are custom

  translations: {
    title: 'Blog Posts',
    searchPlaceholder: 'Search blog posts...',
    createButton: 'Create post',
  } as Partial<CrudTranslations>,

  defaultSort: {
    field: 'created_at',
    order: 'desc',
  },

  searchColumn: 'title',
  skeletonColumns: 7,
}
