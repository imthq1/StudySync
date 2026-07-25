import { useState, type ReactNode } from 'react'
import { clearAuthSession, getAuthSession, saveAuthSession } from '../services/auth.service'
import type { LoginResult } from '../types/auth'
import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<LoginResult | null>(getAuthSession)

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
