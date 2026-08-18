import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const enabled = process.env.NEXT_PUBLIC_ENABLE_SUPABASE === 'true';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let browserClient: SupabaseClient | null = null;

export function isSupabaseEnabled(): boolean {
  return enabled;
}

export function isSupabaseConfigured(): boolean {
  return enabled && Boolean(supabaseUrl && supabasePublishableKey);
}

/** Create the public browser client only when the optional integration is enabled. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  browserClient ??= createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
