'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  acceptInvite: (token: string, password: string, name: string) => Promise<void>
  sendInvite: (email: string) => Promise<void>
  canCreateCampaign: () => boolean
  updateUserRole: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Loading component for authentication states
export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}

// Protected route wrapper
interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return fallback || <AuthLoading />
  }

  if (!user) {
    // Redirect to login will be handled by middleware
    return null
  }

  return <>{children}</>
}

// Public route wrapper (only for non-authenticated users)
interface PublicRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function PublicRoute({ children, fallback }: PublicRouteProps) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return fallback || <AuthLoading />
  }

  if (user) {
    // Redirect to dashboard will be handled by middleware
    return null
  }

  return <>{children}</>
}
