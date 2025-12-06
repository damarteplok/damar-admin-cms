export interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token)
}

export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken')
}

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken')
}

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token)
}

export const removeRefreshToken = (): void => {
  localStorage.removeItem('refreshToken')
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}

export const logout = (): void => {
  removeAccessToken()
  removeRefreshToken()
}
