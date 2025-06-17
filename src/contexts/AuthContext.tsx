import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile, getUserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Memoize the loadUserProfile function to prevent unnecessary recreations
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Memoize the refreshProfile function
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }, [user, loadUserProfile])

  // Memoize the signIn function
  const signIn = useCallback(async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return result
  }, [])

  // Memoize the signUp function
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email,
          },
        },
      })

      if (result.error) {
        throw result.error
      }

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify the profile was created
      if (result.data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', result.data.user.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile creation error:', profileError)
          // Try to create the profile manually if the trigger failed
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: result.data.user.id,
              email: email,
              full_name: fullName || email,
              role: 'customer'
            })
          
          if (insertError) {
            console.error('Manual profile creation failed:', insertError)
          }
        }
      }

      return result
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }, [])

  // Memoize the signOut function
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUserProfile(null)
  }, [])

  // Memoize the isAdmin value
  const isAdmin = useMemo(() => userProfile?.role === 'admin', [userProfile?.role])

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUserProfile])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    userProfile,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }), [user, session, userProfile, isAdmin, loading, signIn, signUp, signOut, refreshProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}