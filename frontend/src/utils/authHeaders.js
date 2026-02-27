import { supabase } from './supabase';

export async function getAuthHeaders() {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}
