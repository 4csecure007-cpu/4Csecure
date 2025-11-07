import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing...')
    console.log('🔐 AuthProvider: Current URL:', window.location.href)

    getInitialSession()

    // Set a timeout failsafe - if still loading after 10 seconds, force complete
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ AuthProvider: Loading timeout reached (10s), forcing loading=false')
      setLoading(false)
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email)
      console.log('🔐 Session details:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id
      })

      if (session?.user) {
        console.log('✅ User session found:', session.user.email)
        setUser(session.user)
        await fetchUserRole(session.user.id)
      } else {
        console.log('❌ No user session')
        setUser(null)
        setUserRole(null)
      }
      console.log('🔐 Setting loading=false after auth state change')
      setLoading(false)
      clearTimeout(loadingTimeout)
    })

    return () => {
      console.log('🔐 AuthProvider: Cleaning up...')
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const getInitialSession = async () => {
    try {
      console.log('🔍 getInitialSession: Starting...')
      console.log('🔍 Current URL:', window.location.href)
      console.log('🔍 URL has session_id:', window.location.search.includes('session_id'))

      const { data: { session }, error } = await supabase.auth.getSession()

      console.log('🔍 getSession result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        email: session?.user?.email,
        error: error?.message
      })

      if (error) {
        console.error('❌ Error getting session:', error)
      }

      if (session?.user) {
        console.log('✅ Initial session found:', session.user.email)
        setUser(session.user)
        await fetchUserRole(session.user.id)
        console.log('🔍 Setting loading=false (session found)')
        setLoading(false)
      } else {
        console.log('ℹ️ No initial session found')
        setUser(null)
        setUserRole(null)
        console.log('🔍 Setting loading=false (no session)')
        setLoading(false)
      }
    } catch (error) {
      console.error('💥 Exception in getInitialSession:', error)
      setLoading(false)
    }
  }

  const fetchUserRole = async (userId) => {
    try {
      console.log('👤 fetchUserRole: Starting for userId:', userId)
      // Wait a brief moment for the database trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('👤 Querying user_roles table...')
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      console.log('👤 User role query result:', { data, error: error?.message })

      if (error) {
        console.error('❌ Error fetching user role:', error)
        // Default to 'user' role if fetch fails
        console.log('👤 Defaulting to "user" role')
        setUserRole('user')
      } else {
        console.log('✅ User role fetched:', data?.role)
        setUserRole(data?.role || 'user')
      }
    } catch (error) {
      console.error('💥 Exception in fetchUserRole:', error)
      setUserRole('user')
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Starting Supabase signIn...', { email })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log('Supabase signIn result:', { 
        user: data?.user ? 'success' : null, 
        error: error?.message 
      })
      
      return { data, error }
    } catch (error) {
      console.error('SignIn error:', error)
      return { data: null, error: { message: 'Network error or connection failed' } }
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      console.log('Starting Supabase signUp...', { email })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      console.log('Supabase signUp result:', {
        user: data?.user ? 'created' : null,
        error: error?.message
      })

      // Database trigger will automatically create user role
      return { data, error }
    } catch (error) {
      console.error('SignUp error:', error)
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth sign-in...')

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/subscription`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google sign-in error:', error)
        return { data, error }
      }

      console.log('Google OAuth initiated successfully')
      return { data, error }
    } catch (error) {
      console.error('Google sign-in error:', error)
      return { data: null, error }
    }
  }

  // Comprehensive session cleanup function
  const clearAllAuthStorage = () => {
    try {
      // Clear all possible Supabase storage keys
      const storageKeys = [
        'sb-auth-token',
        'supabase.auth.token',
        'supabase.auth.refreshToken',
        'supabase-auth-token',
        'sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token'
      ].filter(Boolean)

      // Clear from both sessionStorage and localStorage as fallback
      storageKeys.forEach(key => {
        try {
          window.sessionStorage.removeItem(key)
          window.localStorage.removeItem(key)
        } catch (e) {
          console.warn('Failed to clear storage key:', key)
        }
      })

      // Clear all session storage items that contain 'supabase' or 'auth'
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          window.sessionStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn('Error clearing auth storage:', error)
    }
  }

  const signOut = async () => {
    try {
      console.log('Starting Supabase signOut...')
      console.log('Current user before signout:', user?.email)

      // Clear local state immediately to prevent UI issues
      setUser(null)
      setUserRole(null)

      // Clear all authentication storage first
      clearAllAuthStorage()

      // Then call Supabase signOut
      const { error } = await supabase.auth.signOut({ scope: 'global' })

      if (error) {
        console.error('Supabase signOut error:', error.message)
        // Still return success to prevent UI from getting stuck
        return { error: null }
      }

      console.log('Sign-out completed successfully')
      return { error: null }

    } catch (error) {
      console.error('SignOut error:', error)

      // Force cleanup on any error
      clearAllAuthStorage()
      setUser(null)
      setUserRole(null)

      // Always return success to prevent UI from getting stuck
      return { error: null }
    }
  }

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}