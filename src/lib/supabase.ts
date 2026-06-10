import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// If variables are missing or set to dummy placeholders, count as unconfigured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder-project') &&
  !supabaseAnonKey.includes('placeholder-anon-key')
);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase configuration is missing or using placeholders. The site will run in offline/fallback mode. " +
    "Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable dynamic database features."
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);
