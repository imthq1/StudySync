import apiClient from './api-client'
import type {
  ApiResponse,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from '../types/auth'

const AUTH_SESSION_KEY = 'studysync.auth'

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await apiClient.post<ApiResponse<LoginResult>>(
    '/api/v1/auth/login',
    credentials,
  )

  return response.data.data
}

export async function register(credentials: RegisterCredentials) {
  await apiClient.post<ApiResponse<unknown>>('/api/v1/auth/regiser', credentials)
}

export function saveAuthSession(session: LoginResult) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}
