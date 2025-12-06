import { Client, cacheExchange, fetchExchange } from 'urql'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/query'

export const urqlClient = new Client({
  url: API_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem('accessToken')
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  },
})
