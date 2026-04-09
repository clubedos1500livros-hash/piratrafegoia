import { scopeOrders } from '@/lib/restaurant/scope';
import { loadJson, saveJson } from '@/lib/admin/jsonStorage';
import { emitAdminHub } from '@/lib/tenant/events';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  sbFetchOrders,
  sbInsertOrder,
  sbUpdateOrderStatus,
  scopedOrderForInsert,
} from '@/lib/supabase/ordersApi';
import type { AdminOrder, OrderStatus } from '@/lib/admin/types';

export function getOrders(restaurantId: string): AdminOrder[] {
  const k = buildTenantStorageKeys(restaurantId);
  const raw = loadJson<AdminOrder[]>(k.orders, []);
  return scopeOrders(raw, k.restaurantId);
}

export function saveOrders(restaurantId: string, orders: AdminOrder[]): void {
  const k = buildTenantStorageKeys(restaurantId);
  saveJson(k.orders, scopeOrders(orders, k.restaurantId));
  emitAdminHub(k.restaurantId, 'orders');
}

export function updateOrderStatus(
  restaurantId: string,
  id: string,
  status: OrderStatus,
): void {
  const list = getOrders(restaurantId);
  const next = list.map((o) => (o.id === id ? { ...o, status } : o));
  saveOrders(restaurantId, next);
}

export function appendOrder(restaurantId: string, order: AdminOrder): void {
  const k = buildTenantStorageKeys(restaurantId);
  const list = getOrders(restaurantId);
  const scoped = scopeOrders([order], k.restaurantId)[0];
  saveOrders(restaurantId, [scoped, ...list]);
}

export async function fetchOrders(restaurantId: string): Promise<AdminOrder[]> {
  if (isSupabaseConfigured()) {
    return sbFetchOrders(restaurantId);
  }
  return getOrders(restaurantId);
}

export async function updateOrderStatusAsync(
  restaurantId: string,
  id: string,
  status: OrderStatus,
): Promise<void> {
  if (isSupabaseConfigured()) {
    await sbUpdateOrderStatus(restaurantId, id, status);
    emitAdminHub(restaurantId, 'orders');
    return;
  }
  updateOrderStatus(restaurantId, id, status);
}

export async function appendOrderAsync(restaurantId: string, order: AdminOrder): Promise<void> {
  if (isSupabaseConfigured()) {
    const scoped = scopedOrderForInsert(order, restaurantId);
    await sbInsertOrder(scoped);
    emitAdminHub(restaurantId, 'orders');
    return;
  }
  appendOrder(restaurantId, order);
}
