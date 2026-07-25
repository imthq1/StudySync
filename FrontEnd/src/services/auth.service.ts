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

function isLoginResult(value: unknown): value is LoginResult {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<LoginResult>

  return (
    typeof session.access_token === 'string' &&
    typeof session.refresh_token === 'string' &&
    typeof session.user?.id === 'number' &&
    typeof session.user.email === 'string' &&
    typeof session.user.name === 'string'
  )
}

export function getAuthSession(): LoginResult | null {
  const storedSession = localStorage.getItem(AUTH_SESSION_KEY)

  if (!storedSession) {
    return null
  }

  try {
    const session: unknown = JSON.parse(storedSession)
    return isLoginResult(session) ? session : null
  } catch {
    return null
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}
