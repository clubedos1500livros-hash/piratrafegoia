import { supabase } from '@/lib/supabase';
import { scopeOrders } from '@/lib/restaurant/scope';
import { adminOrderToRow, rowToAdminOrder } from '@/lib/supabase/mappers';
import type { AdminOrder, OrderStatus } from '@/lib/admin/types';

export async function sbFetchOrders(restaurantId: string): Promise<AdminOrder[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => rowToAdminOrder(row as Record<string, unknown>));
}

export async function sbInsertOrder(order: AdminOrder): Promise<void> {
  if (!supabase) return;
  const row = adminOrderToRow(order);
  const { error } = await supabase.from('orders').insert(row);
  if (error) throw error;
}

export async function sbUpdateOrderStatus(
  restaurantId: string,
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('restaurant_id', restaurantId);
  if (error) throw error;
}

export function sbSubscribeOrders(
  restaurantId: string,
  onChange: () => void,
): { unsubscribe: () => void } {
  const client = supabase;
  if (!client) {
    return { unsubscribe: () => {} };
  }

  const channel = client
    .channel(`orders:${restaurantId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      () => {
        onChange();
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void client.removeChannel(channel);
    },
  };
}

/** Garante escopo antes de gravar (ex.: pedido simulado). */
export function scopedOrderForInsert(order: AdminOrder, restaurantId: string): AdminOrder {
  return scopeOrders([order], restaurantId)[0];
}
