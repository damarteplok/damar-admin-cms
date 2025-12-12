/**
 * Common data models and interfaces used across the application
 */

export interface Blog {
  id: string
  title: string
  content: string
  slug: string
  authorId: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

// Add more models as needed
