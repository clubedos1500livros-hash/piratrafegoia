import { loadJson, saveJson } from '@/lib/admin/jsonStorage';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  sbListRestaurants,
  sbRestaurantExists,
  sbUpsertRestaurant,
} from '@/lib/supabase/restaurantsApi';
import type { TenantRecord, TenantRegistryFile } from '@/lib/tenant/types';
import { sanitizeTenantId } from '@/lib/tenant/publicTenant';

const REGISTRY_KEY = 'cardapio_saas_v1_tenant_registry';

function readRegistry(): TenantRegistryFile {
  return loadJson<TenantRegistryFile>(REGISTRY_KEY, { tenants: [] });
}

function writeRegistry(r: TenantRegistryFile): void {
  saveJson(REGISTRY_KEY, r);
}

export function listTenants(): TenantRecord[] {
  const { tenants } = readRegistry();
  return [...tenants].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function getTenant(id: string): TenantRecord | undefined {
  const slug = sanitizeTenantId(id);
  if (!slug) return undefined;
  return readRegistry().tenants.find((t) => t.id === slug);
}

export function tenantExists(id: string): boolean {
  return Boolean(getTenant(id));
}

export function registerTenant(rawId: string, name: string): TenantRecord | null {
  const id = sanitizeTenantId(rawId);
  if (!id) return null;
  const r = readRegistry();
  if (r.tenants.some((t) => t.id === id)) return null;
  const row: TenantRecord = {
    id,
    name: name.trim() || id,
    created_at: new Date().toISOString(),
  };
  r.tenants.push(row);
  writeRegistry(r);
  return row;
}

/** Garante tenant `demo` para desenvolvimento e migrações. */
export function ensureDefaultTenants(): void {
  const r = readRegistry();
  if (r.tenants.length === 0) {
    r.tenants.push({
      id: 'demo',
      name: 'Demonstração',
      created_at: new Date().toISOString(),
    });
    writeRegistry(r);
  }
}

export async function listRestaurantsUnified(): Promise<TenantRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    let list = await sbListRestaurants();
    if (list.length === 0) {
      await sbUpsertRestaurant('demo', 'Demonstração');
      list = await sbListRestaurants();
    }
    return list;
  }
  ensureDefaultTenants();
  return listTenants();
}

export async function restaurantExistsUnified(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    return sbRestaurantExists(id);
  }
  return tenantExists(id);
}

export async function registerRestaurantUnified(
  rawId: string,
  name: string,
): Promise<TenantRecord | null> {
  const id = sanitizeTenantId(rawId);
  if (!id) return null;
  if (isSupabaseConfigured() && supabase) {
    const exists = await sbRestaurantExists(id);
    if (exists) return null;
    try {
      await sbUpsertRestaurant(id, name.trim() || id);
      return { id, name: name.trim() || id, created_at: new Date().toISOString() };
    } catch {
      return null;
    }
  }
  return registerTenant(rawId, name);
}
