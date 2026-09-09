'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, hasSupabase } from '@/lib/env';

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!hasSupabase()) throw new Error('Supabase 공개 URL과 publishable key가 필요합니다.');
  browserClient ??= createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return browserClient;
}

export async function getAccessToken(): Promise<string | undefined> {
  if (!hasSupabase()) return undefined;
  const { data } = await getSupabaseClient().auth.getSession();
  return data.session?.access_token;
}
