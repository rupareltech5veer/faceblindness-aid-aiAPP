import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Face {
  id: string;
  user_id: string;
  image_url: string;
  name: string;
  description: string;
  mnemonic: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  image_url: string;
  frame_style: string;
  title: string | null;
  description: string | null;
  created_at: string;
}

export interface Connection {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  module_id: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed: string;
  created_at: string;
}

export interface AppSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}