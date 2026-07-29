import type { LoginResult } from '../types/auth'

const AUTH_SESSION_KEY = 'studysync.auth'

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
    return isLoginResult(session) ? session : null
  } catch {
    return null
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY)
}
