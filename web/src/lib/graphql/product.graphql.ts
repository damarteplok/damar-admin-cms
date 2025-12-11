import { gql } from 'urql'

export const GET_PRODUCTS_QUERY = gql`
  query GetProducts(
    $page: Int
    $perPage: Int
    $search: String
    $sortBy: String
    $sortOrder: String
  ) {
    products(
      page: $page
      perPage: $perPage
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      success
      message
      data {
        products {
          id
          name
          slug
          description
          metadata
          features
          isPopular
          isDefault
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

export const GET_PRODUCT_QUERY = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      success
      message
      data {
        id
        name
        slug
        description
        metadata
        features
        isPopular
        isDefault
        createdAt
        updatedAt
      }
    }
  }
`

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      success
      message
      data {
        id
        name
        slug
        description
        isPopular
        isDefault
        createdAt
      }
    }
  }
`

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      success
      message
      data {
        id
        name
        slug
        description
        metadata
        features
        isPopular
        isDefault
        updatedAt
      }
    }
  }
`

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`
