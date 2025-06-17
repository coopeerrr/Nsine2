import React, { createContext, useContext, useEffect, useState } from 'react'
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

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
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const isAdmin = userProfile?.role === 'admin'

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return result
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
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
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUserProfile(null)
  }

  const value = {
    user,
    session,
    userProfile,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}