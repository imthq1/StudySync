import type { LoginResult } from '../types/auth'

const AUTH_SESSION_KEY = 'studysync.auth'
export const AUTH_EXPIRED_EVENT = 'studysync:auth-expired'

interface JwtPayload {
  exp?: number
}

export function isAccessTokenExpired(accessToken: string) {
  try {
    const encodedPayload = accessToken.split('.')[1]

    if (!encodedPayload) {
      return true
    }

    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payload = JSON.parse(atob(paddedBase64)) as JwtPayload

    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
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

export function saveAuthSession(session: LoginResult) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function getAuthSession(): LoginResult | null {
  const storedSession = localStorage.getItem(AUTH_SESSION_KEY)

  if (!storedSession) {
    return null
  }

  try {
    const session: unknown = JSON.parse(storedSession)

    if (!isLoginResult(session)) {
      clearAuthSession()
      return null
    }

    if (isAccessTokenExpired(session.access_token)) {
      expireAuthSession()
      return null
    }

    return session
  } catch {
    clearAuthSession()
    return null
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}

export function expireAuthSession() {
  clearAuthSession()
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}
