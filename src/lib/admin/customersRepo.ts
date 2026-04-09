import { scopeCustomers } from '@/lib/restaurant/scope';
import { loadJson, saveJson } from '@/lib/admin/jsonStorage';
import { emitAdminHub } from '@/lib/tenant/events';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import { isSupabaseConfigured } from '@/lib/supabase';
import { sbFetchCustomers, sbReplaceCustomers } from '@/lib/supabase/customersApi';
import type { Customer } from '@/lib/admin/types';

export function getCustomers(restaurantId: string): Customer[] {
  const k = buildTenantStorageKeys(restaurantId);
  const raw = loadJson<Customer[]>(k.customers, []);
  return scopeCustomers(raw, k.restaurantId);
}

export function saveCustomers(restaurantId: string, customers: Customer[]): void {
  const k = buildTenantStorageKeys(restaurantId);
  saveJson(k.customers, scopeCustomers(customers, k.restaurantId));
  emitAdminHub(k.restaurantId, 'customers');
}

export async function fetchCustomers(restaurantId: string): Promise<Customer[]> {
  if (isSupabaseConfigured()) {
    return sbFetchCustomers(restaurantId);
  }
  return getCustomers(restaurantId);
}

export async function persistCustomers(
  restaurantId: string,
  customers: Customer[],
): Promise<void> {
  if (isSupabaseConfigured()) {
    await sbReplaceCustomers(restaurantId, customers);
    emitAdminHub(restaurantId, 'customers');
    return;
  }
  saveCustomers(restaurantId, customers);
}

export function newCustomerId(list: Customer[]): string {
  if (isSupabaseConfigured()) {
    return crypto.randomUUID();
  }
  const nums = list.map((c) => parseInt(c.id, 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1);
}

export function customersWithBirthdayToday(list: Customer[]): Customer[] {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  return list.filter((c) => {
    if (!c.birth_date) return false;
    const parts = c.birth_date.split('-').map(Number);
    const mm = parts[1];
    const dd = parts[2];
    if (!mm || !dd) return false;
    return mm === m && dd === d;
  });
}
