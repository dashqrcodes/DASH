import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getSupabaseAdminClient(): SupabaseClient {
  if (_client) return _client;
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin credentials are not configured');
  }
  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _client;
}

// Lazy: only throws when actually used, not at import. Allows pages that don't use Supabase to load.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseAdminClient() as unknown as Record<string, unknown>)[prop as string];
  },
});

