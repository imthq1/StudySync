import { createContext } from 'react'
import type { LoginResult, User } from '../types/auth'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  signIn: (session: LoginResult) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
