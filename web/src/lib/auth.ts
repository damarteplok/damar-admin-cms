export interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  emailVerified?: boolean
}

const isClient = typeof window !== 'undefined'

export const getAccessToken = (): string | null => {
  if (!isClient) return null
  return localStorage.getItem('accessToken')
}

export const setAccessToken = (token: string): void => {
  if (!isClient) return
  localStorage.setItem('accessToken', token)
}

export const removeAccessToken = (): void => {
  if (!isClient) return
  localStorage.removeItem('accessToken')
}

export const getRefreshToken = (): string | null => {
  if (!isClient) return null
  return localStorage.getItem('refreshToken')
}

export const setRefreshToken = (token: string): void => {
  if (!isClient) return
  localStorage.setItem('refreshToken', token)
}

export const removeRefreshToken = (): void => {
  if (!isClient) return
  localStorage.removeItem('refreshToken')
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}

export const logout = (): void => {
  removeAccessToken()
  removeRefreshToken()
}
