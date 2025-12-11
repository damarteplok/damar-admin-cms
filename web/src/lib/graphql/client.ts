import {
  Client,
  cacheExchange,
  fetchExchange,
  errorExchange,
  type CombinedError,
} from 'urql'
import { getAccessToken, removeAccessToken, removeRefreshToken } from '../auth'
import { env } from '@/config'

export const urqlClient = new Client({
  url: env.apiUrl,
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
