import { createClient } from '@supabase/supabase-js';

function pickPublicEnv(keys) {
  for (const key of keys) {
    const value = String(import.meta.env?.[key] || '').trim();
    if (value) return value;
  }
  return '';
}

const supabaseUrl = pickPublicEnv(['VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']);
const supabaseAnonKey = pickPublicEnv([
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
]);

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = SUPABASE_CONFIGURED ? createClient(supabaseUrl, supabaseAnonKey) : null;
