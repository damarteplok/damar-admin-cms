export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  metadata?: string
  features?: string
  isPopular: boolean
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export interface ProductsResponse {
  products: {
    success: boolean
    message: string
    data: {
      products: Product[]
      total: number
      page: number
      perPage: number
    }
  }
}

export interface ProductResponse {
  product: {
    success: boolean
    message: string
    data: Product
  }
}

export interface CreateProductInput {
  name: string
  slug: string
  description?: string
  metadata?: string
  features?: string
  isPopular?: boolean
  isDefault?: boolean
}

export interface UpdateProductInput {
  id: string
  name?: string
  slug?: string
  description?: string
  metadata?: string
  features?: string
  isPopular?: boolean
  isDefault?: boolean
}

export interface CreateProductResponse {
  createProduct: {
    success: boolean
    message: string
    data: Product
  }
}

export interface UpdateProductResponse {
  updateProduct: {
    success: boolean
    message: string
    data: Product
  }
}

export interface DeleteProductResponse {
  deleteProduct: {
    success: boolean
    message: string
  }
}
