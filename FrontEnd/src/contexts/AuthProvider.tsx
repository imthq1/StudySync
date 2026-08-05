import { useEffect, useState, type ReactNode } from 'react'
import {
  AUTH_EXPIRED_EVENT,
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../services/auth-session'
import type { LoginResult } from '../types/auth'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<LoginResult | null>(getAuthSession)

  useEffect(() => {
    function handleExpiredSession() {
      clearAuthSession()
      setSession(null)
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession)
  }, [])

  function signIn(nextSession: LoginResult) {
    saveAuthSession(nextSession)
    setSession(nextSession)
  }

  function signOut() {
    clearAuthSession()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        isAuthenticated: session !== null,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
