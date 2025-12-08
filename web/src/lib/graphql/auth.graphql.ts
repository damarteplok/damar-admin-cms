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

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  login: {
    success: boolean
    message: string
    data: {
      accessToken: string
      refreshToken: string
      user: {
        id: string
        name: string
        email: string
        isAdmin: boolean
        emailVerified: boolean
      }
    }
  }
}

export interface RefreshTokenResponse {
  refreshToken: {
    success: boolean
    message: string
    data: {
      accessToken: string
      refreshToken: string
    }
  }
}

export interface MeResponse {
  me: {
    success: boolean
    message: string
    data: {
      id: string
      name: string
      email: string
      isAdmin: boolean
      emailVerified: boolean
      createdAt: string
      updatedAt: string
    }
  }
}

export interface LogoutResponse {
  logout: {
    success: boolean
    message: string
  }
}

export interface ForgotPasswordResponse {
  forgotPassword: {
    success: boolean
    message: string
  }
}

export interface CreateUserResponse {
  createUser: {
    success: boolean
    message?: string
    data?: {
      id: string
      email: string
    }
  }
}

export interface VerifyEmailResponse {
  verifyEmail: {
    success: boolean
    message?: string
  }
}
