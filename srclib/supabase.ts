import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isClientSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isClientSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  mode: 'supabase-live' | 'local-fallback';
  url: string | null;
  tables?: {
    products: boolean;
    orders: boolean;
    memes: boolean;
  };
  error?: string;
}

export async function getBackendSupabaseStatus(): Promise<SupabaseStatus> {
  try {
    const res = await fetch('/api/supabase/status');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      configured: data.configured,
      connected: data.connected,
      mode: data.connected ? 'supabase-live' : 'local-fallback',
      url: data.url,
      tables: data.tables,
      error: data.error,
    };
  } catch (err: any) {
    if (isClientSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').select('id').limit(1);
        return {
          configured: true,
          connected: !error,
          mode: !error ? 'supabase-live' : 'local-fallback',
          url: supabaseUrl || null,
          error: error?.message,
        };
      } catch (e: any) {
        return {
          configured: true,
          connected: false,
          mode: 'local-fallback',
          url: supabaseUrl || null,
          error: e.message,
        };
      }
    }

    return {
      configured: false,
      connected: false,
      mode: 'local-fallback',
      url: null,
      error: 'Backend API or Supabase credentials not detected',
    };
  }
}
