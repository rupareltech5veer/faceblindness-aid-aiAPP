export interface Favorite {
  id: string;
  user_id: string;
  image_url: string;
  frame_style: string;
  title: string;
  created_at?: string;
}
 
// client/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

export type Face = {
  id: string
  name: string
  image_url: string
  mnemonic: string
  description: string
  created_at: string
}
