import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          color: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string
          user_id?: string
          created_at?: string
        }
      }
      subcategories: {
        Row: {
          id: string
          name: string
          parent_id: string
          type: 'income' | 'expense'
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_id: string
          type: 'income' | 'expense'
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string
          type?: 'income' | 'expense'
          user_id?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: 'income' | 'expense' | 'investment'
          amount: number
          category_id: string
          subcategory_id: string | null
          bank_account_id: string | null
          date: string
          paid: boolean
          observation: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'income' | 'expense' | 'investment'
          amount: number
          category_id: string
          subcategory_id?: string | null
          bank_account_id?: string | null
          date: string
          paid?: boolean
          observation?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'income' | 'expense' | 'investment'
          amount?: number
          category_id?: string
          subcategory_id?: string | null
          bank_account_id?: string | null
          date?: string
          paid?: boolean
          observation?: string | null
          user_id?: string
          created_at?: string
        }
      }
      bank_accounts: {
        Row: {
          id: string
          bank_name: string
          account_number: string
          type: 'checking' | 'savings' | 'credit_card' | 'investment'
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          bank_name: string
          account_number: string
          type: 'checking' | 'savings' | 'credit_card' | 'investment'
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          bank_name?: string
          account_number?: string
          type?: 'checking' | 'savings' | 'credit_card' | 'investment'
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}