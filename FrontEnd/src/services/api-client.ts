import axios from 'axios'
import { API_URL } from '../config/environment'
import { expireAuthSession, getAuthSession, isAccessTokenExpired } from './auth-session'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const isPublicAuthRequest = config.url === '/api/v1/auth/login'
    || config.url === '/api/v1/auth/register'

  if (isPublicAuthRequest) {
    delete config.headers.Authorization
    return config
  }

  const accessToken = getAuthSession()?.access_token

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const accessToken = getAuthSession()?.access_token
      const isExpiredTokenResponse = status === 403 && accessToken
        ? isAccessTokenExpired(accessToken)
        : false

      if (status === 401 || isExpiredTokenResponse) {
        expireAuthSession()
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return fallback
}

export default apiClient
