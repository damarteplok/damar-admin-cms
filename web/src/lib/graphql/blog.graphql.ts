import { gql } from 'urql'

// ============================================================================
// BLOG POST QUERIES
// ============================================================================

export const GET_BLOG_POSTS_QUERY = gql`
  query GetBlogPosts(
    $page: Int
    $perPage: Int
    $publishedOnly: Boolean
    $categoryId: ID
    $sortBy: String
    $sortOrder: String
  ) {
    blogPosts(
      page: $page
      perPage: $perPage
      publishedOnly: $publishedOnly
      categoryId: $categoryId
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      success
      message
      data {
        blogPosts {
          id
          title
          slug
          body
          isPublished
          publishedAt
          userId
          authorId
          blogPostCategoryId
          description
          createdAt
          updatedAt
          author {
            id
            name
            email
            publicName
            avatar {
              id
              url
            }
          }
          category {
            id
            name
            slug
          }
          featuredImage {
            id
            uuid
            url
            fileName
            mimeType
            isPublic
            publicUrl
          }
        }
        total
        page
        perPage
      }
    }
  }
`

export const GET_BLOG_POST_QUERY = gql`
  query GetBlogPost($id: ID!) {
    blogPost(id: $id) {
      success
      message
      data {
        id
        title
        slug
        body
        isPublished
        publishedAt
        userId
        authorId
        blogPostCategoryId
        description
        createdAt
        updatedAt
        author {
          id
          name
          email
          publicName
        }
        category {
          id
          name
          slug
        }
        featuredImage {
          id
          uuid
          url
          fileName
          mimeType
          isPublic
          publicUrl
        }
      }
    }
  }
`

export const GET_BLOG_POST_BY_SLUG_QUERY = gql`
  query GetBlogPostBySlug($slug: String!) {
    blogPostBySlug(slug: $slug) {
      success
      message
      data {
        id
        title
        slug
        body
        isPublished
        publishedAt
        userId
        authorId
        blogPostCategoryId
        description
        createdAt
        updatedAt
        author {
          id
          name
          email
          publicName
          avatar {
            id
            url
          }
        }
        category {
          id
          name
          slug
          description
        }
      }
    }
  }
`

export const SEARCH_BLOG_POSTS_QUERY = gql`
  query SearchBlogPosts(
    $query: String!
    $page: Int
    $perPage: Int
    $publishedOnly: Boolean
  ) {
    searchBlogPosts(
      query: $query
      page: $page
      perPage: $perPage
      publishedOnly: $publishedOnly
    ) {
      success
      message
      data {
        blogPosts {
          id
          title
          slug
          body
          isPublished
          publishedAt
          userId
          authorId
          blogPostCategoryId
          description
          createdAt
          updatedAt
          author {
            id
            name
            email
            publicName
          }
          category {
            id
            name
            slug
          }
        }
        total
        page
        perPage
      }
    }
  }
`

// ============================================================================
// BLOG POST MUTATIONS
// ============================================================================

export const CREATE_BLOG_POST_MUTATION = gql`
  mutation CreateBlogPost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) {
      success
      message
      data {
        id
        title
        slug
        body
        isPublished
        userId
        authorId
        blogPostCategoryId
        description
        createdAt
        updatedAt
      }
    }
  }
`

export const UPDATE_BLOG_POST_MUTATION = gql`
  mutation UpdateBlogPost($input: UpdateBlogPostInput!) {
    updateBlogPost(input: $input) {
      success
      message
      data {
        id
        title
        slug
        body
        isPublished
        publishedAt
        userId
        authorId
        blogPostCategoryId
        description
        createdAt
        updatedAt
      }
    }
  }
`

export const DELETE_BLOG_POST_MUTATION = gql`
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id) {
      success
      message
    }
  }
`

export const PUBLISH_BLOG_POST_MUTATION = gql`
  mutation PublishBlogPost($id: ID!) {
    publishBlogPost(id: $id) {
      success
      message
      data {
        id
        title
        slug
        isPublished
        publishedAt
        updatedAt
      }
    }
  }
`

export const UNPUBLISH_BLOG_POST_MUTATION = gql`
  mutation UnpublishBlogPost($id: ID!) {
    unpublishBlogPost(id: $id) {
      success
      message
      data {
        id
        title
        slug
        isPublished
        publishedAt
        updatedAt
      }
    }
  }
`

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export const GET_CATEGORIES_QUERY = gql`
  query GetCategories(
    $page: Int
    $perPage: Int
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    categories(
      page: $page
      perPage: $perPage
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      success
      message
      data {
        categories {
          id
          name
          slug
          description
          createdAt
          updatedAt
        }
        total
        page
        perPage
      }
    }
  }
`

export const GET_CATEGORY_QUERY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      success
      message
      data {
        id
        name
        slug
        description
        createdAt
        updatedAt
      }
    }
  }
`

export const GET_CATEGORY_BY_SLUG_QUERY = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      success
      message
      data {
        id
        name
        slug
        description
        createdAt
        updatedAt
      }
    }
  }
`

// ============================================================================
// CATEGORY MUTATIONS
// ============================================================================

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      success
      message
      data {
        id
        name
        slug
        description
        createdAt
        updatedAt
      }
    }
  }
`

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      success
      message
      data {
        id
        name
        slug
        description
        createdAt
        updatedAt
      }
    }
  }
`

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      success
      message
    }
  }
`
