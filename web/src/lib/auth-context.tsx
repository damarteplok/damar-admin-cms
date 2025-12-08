import React, { createContext, useEffect, useState } from 'react'
import { useClient } from 'urql'
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  setAccessToken as setAccessTokenStorage,
  setRefreshToken as setRefreshTokenStorage,
  User,
} from './auth'
import {
  ME_QUERY,
  MeResponse,
  LOGOUT_MUTATION,
  LogoutResponse,
} from './graphql/auth.graphql'

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  isHydrated: boolean
}

export interface AuthContextType extends AuthState {
  login: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  refreshAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const client = useClient()
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    isHydrated: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadAuthState = async () => {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()

      if (accessToken) {
        try {
          const result = await client
            .query<MeResponse>(ME_QUERY, {}, { requestPolicy: 'network-only' })
            .toPromise()

          if (result.data?.me.success && result.data.me.data) {
            const user = {
              id: result.data.me.data.id,
              name: result.data.me.data.name,
              email: result.data.me.data.email,
              isAdmin: result.data.me.data.isAdmin,
              emailVerified: result.data.me.data.emailVerified,
            }

            setState({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isAdmin: user.isAdmin,
              isLoading: false,
              isHydrated: true,
            })
          } else {
            removeAccessToken()
            removeRefreshToken()
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isHydrated: true,
            }))
          }
        } catch (error) {
          removeAccessToken()
          removeRefreshToken()
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isHydrated: true,
          }))
        }
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isHydrated: true,
        }))
      }
    }

    loadAuthState()
  }, [client])

  const login = async (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => {
    setAccessTokenStorage(accessToken)
    setRefreshTokenStorage(refreshToken)

    setState({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isAdmin: user.isAdmin,
      isLoading: false,
      isHydrated: true,
    })

    // Fetch authoritative user data from server to ensure consistency
    try {
      await refreshAuth()
    } catch (err) {
      // If refresh fails, logout will be triggered inside refreshAuth
      console.error('refreshAuth after login failed', err)
    }
  }

  const logout = async () => {
    const refreshToken = getRefreshToken()

    // Call logout mutation if we have a refresh token
    if (refreshToken) {
      try {
        await client
          .mutation<LogoutResponse>(LOGOUT_MUTATION, {
            refreshToken,
          })
          .toPromise()
      } catch (error) {
        console.error('Logout mutation failed:', error)
        // Continue with local logout even if server call fails
      }
    }

    // Clear local storage and state
    removeAccessToken()
    removeRefreshToken()

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      isHydrated: true,
    })
  }

  const updateUser = (user: User) => {
    setState((prev) => ({
      ...prev,
      user,
      isAdmin: user.isAdmin,
    }))
  }

  const refreshAuth = async () => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()

    if (!accessToken || !refreshToken) {
      logout()
      return
    }

    try {
      const result = await client
        .query<MeResponse>(ME_QUERY, {}, { requestPolicy: 'network-only' })
        .toPromise()

      if (result.data?.me.success && result.data.me.data) {
        const user = {
          id: result.data.me.data.id,
          name: result.data.me.data.name,
          email: result.data.me.data.email,
          isAdmin: result.data.me.data.isAdmin,
          emailVerified: result.data.me.data.emailVerified,
        }

        setState((prev) => ({
          ...prev,
          user,
          isAdmin: user.isAdmin,
        }))
      } else {
        logout()
      }
    } catch (error) {
      logout()
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    refreshAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
