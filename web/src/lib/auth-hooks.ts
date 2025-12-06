import { useContext } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthContext, AuthContextType } from './auth-context'

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const auth = useAuth()
  const navigate = useNavigate()

  if (!auth.isHydrated) {
    return { ...auth, isLoading: true }
  }

  if (!auth.isAuthenticated) {
    navigate({ to: '/login', search: { redirect: window.location.pathname } })
  }

  return auth
}

export function useRequireAdmin() {
  const auth = useAuth()
  const navigate = useNavigate()

  if (!auth.isHydrated) {
    return { ...auth, isLoading: true }
  }

  if (!auth.isAuthenticated) {
    navigate({ to: '/login', search: { redirect: window.location.pathname } })
    return auth
  }

  if (!auth.isAdmin) {
    throw new Error('Admin access required')
  }

  return auth
}
