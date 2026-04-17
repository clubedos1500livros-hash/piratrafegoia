import { mockProducts } from '@/data/menu';
import { scopeProducts } from '@/lib/restaurant/scope';
import { emitAdminHub } from '@/lib/tenant/events';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import { loadTenantData, loadTenantDataOrLegacy, saveTenantData } from '@/lib/admin/tenantDataRepo';
import { isSupabaseConfigured } from '@/lib/supabase';
import { sbFetchProducts, sbSyncProducts } from '@/lib/supabase/productsApi';
import type { Product } from '@/types/product';

export function loadLocalProducts(restaurantId: string): Product[] | null {
  const existing = loadTenantData(restaurantId);
  if (existing !== null) return existing.products;

  const k = buildTenantStorageKeys(restaurantId);
  try {
    const raw = localStorage.getItem(k.products);
    if (raw === null) return null;
    const p = JSON.parse(raw) as Product[];
    if (!Array.isArray(p)) return null;
    return scopeProducts(p, k.restaurantId);
  } catch {
    return null;
  }
}

export function saveLocalProducts(restaurantId: string, products: Product[]): void {
  const k = buildTenantStorageKeys(restaurantId);
  const data = loadTenantDataOrLegacy(restaurantId);
  saveTenantData(restaurantId, {
    ...data,
    products: scopeProducts(products, k.restaurantId),
  });
  emitAdminHub(k.restaurantId, 'products');
}

export function getAdminProductsOrInitial(restaurantId: string): Product[] {
  const data = loadTenantData(restaurantId);
  if (data !== null) return data.products;

  const k = buildTenantStorageKeys(restaurantId);
  const local = loadLocalProducts(restaurantId);
  if (local !== null) return local;
  return scopeProducts(mockProducts, k.restaurantId);
}

export async function loadProductsForAdmin(restaurantId: string): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    return sbFetchProducts(restaurantId);
  }
  return getAdminProductsOrInitial(restaurantId);
}

export async function persistProductsForAdmin(
  restaurantId: string,
  products: Product[],
): Promise<void> {
  if (!restaurantId?.trim()) {
    console.error('[ProductsRepo] restaurant_id inválido. Não será possível salvar produtos.', restaurantId);
    throw new Error('restaurant_id inválido para salvar produtos');
  }
  if (isSupabaseConfigured()) {
    await sbSyncProducts(restaurantId, products);
    emitAdminHub(restaurantId, 'products');
    return;
  }
  saveLocalProducts(restaurantId, products);
}

export function upsertProduct(product: Product, all: Product[]): Product[] {
  const i = all.findIndex((p) => p.id === product.id);
  if (i === -1) return [...all, product];
  const next = [...all];
  next[i] = product;
  return next;
}

export function deleteProduct(id: string, all: Product[]): Product[] {
  return all.filter((p) => p.id !== id);
}

export function newProductId(all: Product[]): string {
  const nums = all.map((p) => parseInt(p.id, 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1);
}
