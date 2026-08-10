import apiClient from './api-client'
import type {
  ApiResponse,
  LoginCredentials,
  LoginResult,
  RegisterCredentials,
} from '../types/auth'

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await apiClient.post<ApiResponse<LoginResult>>(
    '/api/v1/auth/login',
    credentials,
  )

  return response.data.data
}

export async function register(credentials: RegisterCredentials) {
  await apiClient.post<ApiResponse<unknown>>('/api/v1/auth/register', credentials)
}
