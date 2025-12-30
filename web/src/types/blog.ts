import { UserProfile } from './user'
import { Media } from './media'

export interface BlogPost {
  id: string
  title: string
  slug: string
  body: string
  isPublished: boolean
  publishedAt?: number
  userId: string
  authorId?: string
  blogPostCategoryId?: string
  description?: string
  createdAt: number
  updatedAt: number
  author?: UserProfile
  category?: Category
  featuredImage?: Media
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: number
  updatedAt: number
}

export interface BlogPostsResponse {
  blogPosts: {
    success: boolean
    message: string
    data: {
      blogPosts: BlogPost[]
      total: number
      page: number
      perPage: number
    }
  }
}

export interface BlogPostResponse {
  createBlogPost: {
    success: boolean
    message: string
    data: BlogPost
  }
}

export interface UpdateBlogPostResponse {
  updateBlogPost: {
    success: boolean
    message: string
    data: BlogPost
  }
}

export interface GetBlogPostResponse {
  blogPost: {
    success: boolean
    message: string
    data: BlogPost
  }
}

export interface PublishBlogPostResponse {
  publishBlogPost: {
    success: boolean
    message: string
    data: BlogPost
  }
}

export interface UnpublishBlogPostResponse {
  unpublishBlogPost: {
    success: boolean
    message: string
    data: BlogPost
  }
}

export interface CategoriesResponse {
  categories: {
    success: boolean
    message: string
    data: {
      categories: Category[]
      total: number
      page: number
      perPage: number
    }
  }
}

export interface CategoryResponse {
  category: {
    success: boolean
    message: string
    data: Category
  }
}

export interface CreateCategoryResponse {
  createCategory: {
    success: boolean
    message: string
    data: Category
  }
}

export interface UpdateCategoryResponse {
  updateCategory: {
    success: boolean
    message: string
    data: Category
  }
}

export interface CreateBlogPostInput {
  title: string
  slug?: string
  body: string
  description?: string
  userId: string
  authorId?: string
  blogPostCategoryId?: string
  isPublished?: boolean
  publishedAt?: number
  imageFile?: File
}

export interface UpdateBlogPostInput {
  id: string
  title: string
  slug: string
  body: string
  description?: string
  authorId?: string
  blogPostCategoryId?: string
  isPublished?: boolean
  publishedAt?: number
  imageFile?: File
}

export interface CreateCategoryInput {
  name: string
  slug?: string
  description?: string
}

export interface UpdateCategoryInput {
  id: string
  name: string
  slug: string
  description?: string
}

export interface DeleteBlogPostResponse {
  deleteBlogPost: {
    success: boolean
    message: string
  }
}

export interface DeleteCategoryResponse {
  deleteCategory: {
    success: boolean
    message: string
  }
}

export interface PublishBlogPostResponse {
  publishBlogPost: {
    success: boolean
    message: string
    data: BlogPost
  }
}

export interface UnpublishBlogPostResponse {
  unpublishBlogPost: {
    success: boolean
    message: string
    data: BlogPost
  }
}
