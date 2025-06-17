import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Temporary debug log - remove after confirming it works
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// Helper functions for admin operations
export const createAdminUser = async (email: string) => {
  const { error } = await supabase.rpc('create_admin_user', { user_email: email })
  if (error) throw error
}

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching user profile:', error)
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: user } = await supabase.auth.getUser()
        if (user?.user) {
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
            console.error('Error creating user profile:', insertError)
            throw insertError
          }
          return newProfile as UserProfile
        }
      }
      throw error
    }
    return data as UserProfile
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    throw error
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as UserProfile
}