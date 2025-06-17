import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Temporary debug log - remove after confirming it works
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Configure Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'n-sine-medical'
    }
  },
  db: {
    schema: 'public'
  }
})

// Database types
export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'customer'
  full_name?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category_id: string | null
  images: string[]
  specifications: Record<string, any>
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: string
  customer_id: string | null
  customer_email: string
  customer_name: string
  customer_phone: string | null
  products: any[]
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: any
  notes?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  replied_at?: string
  created_at: string
}

// Cache for user profiles to reduce database calls
const profileCache = new Map<string, { profile: UserProfile; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const getUserProfile = async (userId: string) => {
  try {
    // Check cache first
    const cached = profileCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached profile for user:', userId)
      return cached.profile
    }

    console.log('Fetching profile for user:', userId)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })

      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        console.log('Profile not found, attempting to create one')
        const { data: user } = await supabase.auth.getUser()
        if (user?.user) {
          console.log('Creating profile for user:', user.user.email)
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              email: user.user.email,
              full_name: user.user.user_metadata.full_name || user.user.email,
              role: 'customer'
            })
            .select()
            .single()
          
          if (insertError) {
            console.error('Error creating user profile:', {
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            })
            throw insertError
          }
          console.log('Successfully created new profile:', newProfile)
          // Cache the new profile
          profileCache.set(userId, { profile: newProfile as UserProfile, timestamp: Date.now() })
          return newProfile as UserProfile
        }
      }
      throw error
    }
    console.log('Successfully fetched profile:', data)
    // Cache the fetched profile
    profileCache.set(userId, { profile: data as UserProfile, timestamp: Date.now() })
    return data as UserProfile
  } catch (error) {
    console.error('Error in getUserProfile:', {
      error,
      userId,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error

    // Update cache
    if (data) {
      profileCache.set(userId, { profile: data as UserProfile, timestamp: Date.now() })
    }

    return data as UserProfile
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Helper function to clear profile cache
export const clearProfileCache = (userId?: string) => {
  if (userId) {
    profileCache.delete(userId)
  } else {
    profileCache.clear()
  }
}

// Helper functions for admin operations
export const createAdminUser = async (email: string) => {
  const { error } = await supabase.rpc('create_admin_user', { user_email: email })
  if (error) throw error
}