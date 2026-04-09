import { supabase } from '@/lib/supabase';
import { scopeProducts } from '@/lib/restaurant/scope';
import { productToRow, rowToProduct } from '@/lib/supabase/mappers';
import type { Product } from '@/types/product';

export async function sbFetchProducts(restaurantId: string): Promise<Product[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((row) => rowToProduct(row as Record<string, unknown>));
}

export async function sbSyncProducts(restaurantId: string, products: Product[]): Promise<void> {
  if (!supabase) return;
  const scoped = scopeProducts(products, restaurantId);

  const { data: existing, error: selErr } = await supabase
    .from('products')
    .select('id')
    .eq('restaurant_id', restaurantId);
  if (selErr) throw selErr;

  const keep = new Set(scoped.map((p) => p.id));
  const toRemove = (existing ?? []).map((r) => r.id as string).filter((id) => !keep.has(id));
  if (toRemove.length) {
    const { error: delErr } = await supabase
      .from('products')
      .delete()
      .eq('restaurant_id', restaurantId)
      .in('id', toRemove);
    if (delErr) throw delErr;
  }

  if (!scoped.length) return;

  const rows = scoped.map((p) => productToRow(p, restaurantId));
  const { error: upErr } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
  if (upErr) throw upErr;
}
