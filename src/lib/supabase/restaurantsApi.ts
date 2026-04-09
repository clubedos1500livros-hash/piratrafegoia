import { supabase } from '@/lib/supabase';
import type { TenantRecord } from '@/lib/tenant/types';

export async function sbListRestaurants(): Promise<TenantRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, created_at')
    .order('name');
  if (error) {
    console.warn('[supabase] restaurants list', error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    created_at: r.created_at,
  }));
}

export async function sbRestaurantExists(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function sbUpsertRestaurant(id: string, name: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('restaurants').upsert(
    { id, name, created_at: new Date().toISOString() },
    { onConflict: 'id' },
  );
  if (error) throw error;
}
