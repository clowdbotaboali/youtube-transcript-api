import { createClient } from '@supabase/supabase-js';

// Production-safe fallback so frontend does not crash when Vercel env vars are missing.
// Both values are public client credentials (project URL + publishable key).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xvqhtsgpfqsywviitixh.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_OoAb7PXJTQlYGrIBGiHIQg_-WQ1hwPh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
