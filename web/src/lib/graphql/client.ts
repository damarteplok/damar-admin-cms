import {
  Client,
  cacheExchange,
  fetchExchange,
  errorExchange,
  type CombinedError,
} from 'urql'
import { toast } from 'sonner'
import { getAccessToken, removeAccessToken, removeRefreshToken } from '../auth'
import { env } from '@/config'

export const urqlClient = new Client({
  url: env.apiUrl,
  exchanges: [
    cacheExchange,
    errorExchange({
      onError: (error: CombinedError) => {
        // Handle 401 Unauthorized errors (invalid/expired token)
        const is401Error =
          error.graphQLErrors.some(
            (e) =>
              e.message.includes('Unauthorized') ||
              e.message.includes('Invalid or expired token') ||
              e.message.includes('token'),
          ) || error.response?.status === 401

        if (is401Error) {
          // Only handle on client-side
          if (typeof window !== 'undefined') {
            // Clear authentication state
            removeAccessToken()
            removeRefreshToken()

            // Show user-friendly message
            toast.error('Your session has expired. Please login again.')

            // Store current path for redirect after login
            const currentPath = window.location.pathname
            if (currentPath !== '/login') {
              sessionStorage.setItem('redirectAfterLogin', currentPath)
            }

            // Immediate redirect to login (will reload page, clearing all state)
            window.location.href = '/login'
          }
        }

        // Handle other GraphQL errors (optional logging)
        if (error.graphQLErrors.length > 0 && !is401Error) {
          console.error('[GraphQL Error]:', error.graphQLErrors)
        }

        // Handle network errors
        if (error.networkError) {
          console.error('[Network Error]:', error.networkError)
        }
      },
    }),
    fetchExchange,
  ],
  fetchOptions: () => {
    const token = getAccessToken()
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  },
})
