import { gql } from 'urql'

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      data {
        accessToken
        refreshToken
        user {
          id
          name
          email
          isAdmin
          emailVerified
        }
      }
    }
  }
`

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      success
      message
      data {
        accessToken
        refreshToken
      }
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      success
      message
      data {
        id
        name
        email
        isAdmin
        emailVerified
        createdAt
        updatedAt
      }
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken) {
      success
      message
    }
  }
`

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      success
      message
      data {
        id
        email
      }
    }
  }
`

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
    }
  }
`

export const GET_USERS_QUERY = gql`
  query GetAllUsers($page: Int!, $perPage: Int!) {
    users(page: $page, perPage: $perPage) {
      success
      message
      data {
        users {
          id
          name
          email
          isAdmin
          isBlocked
          emailVerified
        }
        total
        page
        perPage
      }
    }
  }
`

export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($query: String!, $page: Int!, $perPage: Int!) {
    searchUsers(query: $query, page: $page, perPage: $perPage) {
      success
      message
      data {
        users {
          id
          name
          email
          isAdmin
          isBlocked
          emailVerified
        }
        total
        page
        perPage
      }
    }
  }
`

export const GET_USER_BY_ID_QUERY = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      success
      message
      data {
        id
        name
        email
        publicName
        isAdmin
        isBlocked
        phoneNumber
        position
        emailVerified
        emailVerifiedAt
        lastLoginAt
        createdAt
        updatedAt
      }
    }
  }
`

/**
 * GraphQL Input Types
 * These are used for mutations
 */
export interface LoginInput {
  email: string
  password: string
}

/**
 * Note: Response types moved to @/types/api.ts
 * Import from '@/types' instead of this file
 *
 * Available types:
 * - LoginResponse
 * - RefreshTokenResponse
 * - MeResponse
 * - LogoutResponse
 * - ForgotPasswordResponse
 * - CreateUserResponse
 * - VerifyEmailResponse
 */
