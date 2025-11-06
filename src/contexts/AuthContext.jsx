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
    getInitialSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        setUser(session.user)
        await fetchUserRole(session.user.id)
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Initial session check:', session?.user?.email || 'no session')
      
      if (session?.user) {
        setUser(session.user)
        await fetchUserRole(session.user.id)
        setLoading(false)
      } else {
        setUser(null)
        setUserRole(null)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error getting session:', error)
      setLoading(false)
    }
  }

  const fetchUserRole = async (userId) => {
    try {
      // Wait a brief moment for the database trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        // Default to 'user' role if fetch fails
        setUserRole('user')
      } else {
        setUserRole(data?.role || 'user')
        console.log('User role fetched:', data?.role)
      }
    } catch (error) {
      console.error('Error:', error)
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