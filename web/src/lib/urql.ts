import {
  Client,
  cacheExchange,
  fetchExchange,
  errorExchange,
  type CombinedError,
} from 'urql'
import { getAccessToken, removeAccessToken, removeRefreshToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/query'

export const urqlClient = new Client({
  url: API_URL,
  exchanges: [
    cacheExchange,
    errorExchange({
      onError: (error: CombinedError) => {
        // Handle 401 Unauthorized errors
        if (
          error.graphQLErrors.some((e) => e.message.includes('Unauthorized'))
        ) {
          // Clear tokens and redirect to login
          if (typeof window !== 'undefined') {
            removeAccessToken()
            removeRefreshToken()
            window.location.href = '/login'
          }
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
