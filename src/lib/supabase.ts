import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

/**
 * Cliente Supabase. Sem URL/chave válidas, retorna null (app usa dados locais).
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        global: {
          fetch: (input, init) =>
            fetch(input, {
              ...init,
              cache: 'no-store',
              headers: {
                ...(init?.headers ?? {}),
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
              },
            }),
        },
      })
    : null;

if (!supabase) {
  console.warn('Supabase não configurado - usando modo link externo');
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

export { rowToProduct } from '@/lib/supabase/mappers';
