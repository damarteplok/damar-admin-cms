/**
 * Authentication-related types
 */

export interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  loading: boolean
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: 'admin' | 'user'
}
