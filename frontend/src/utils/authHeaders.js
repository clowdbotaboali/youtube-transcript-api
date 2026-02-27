import { supabase } from './supabase';

async function withTimeout(promise, ms = 8000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Auth timeout')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function getAuthHeaders() {
  if (!supabase) return {};
  try {
    const result = await withTimeout(supabase.auth.getSession(), 8000);
    const token = result?.data?.session?.access_token;

    return token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {};
  } catch {
    return {};
  }
}
