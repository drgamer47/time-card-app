import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// These should be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Supabase URL and Anon Key must be set in environment variables. ' +
    'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project settings.';
  console.error(errorMsg);
  
  // Show user-friendly error in production
  if (import.meta.env.PROD) {
    console.error('See VERCEL_ENV_SETUP.md for instructions on setting environment variables.');
  }
}

// Create client without auth (using simple user_name instead)
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

