import { supabase } from '@/lib/supabase';
import { scopeCustomers } from '@/lib/restaurant/scope';
import { customerToRow, rowToCustomer } from '@/lib/supabase/mappers';
import type { Customer } from '@/lib/admin/types';

export async function sbFetchCustomers(restaurantId: string): Promise<Customer[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((row) => rowToCustomer(row as Record<string, unknown>));
}

export async function sbReplaceCustomers(restaurantId: string, customers: Customer[]): Promise<void> {
  if (!supabase) return;
  const scoped = scopeCustomers(customers, restaurantId);

  const { error: delErr } = await supabase.from('customers').delete().eq('restaurant_id', restaurantId);
  if (delErr) throw delErr;

  if (!scoped.length) return;

  const rows = scoped.map((c) => customerToRow(c));
  const { error: insErr } = await supabase.from('customers').insert(rows);
  if (insErr) throw insErr;
}
