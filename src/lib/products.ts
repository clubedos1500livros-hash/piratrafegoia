import { mockProducts } from '@/data/menu';
import { loadTenantDataOrLegacy } from '@/lib/admin/tenantDataRepo';
import { scopeProducts } from '@/lib/restaurant/scope';
import { getPublicRestaurantId } from '@/lib/tenant/publicTenant';
import { isSupabaseConfigured } from '@/lib/supabase';
import { sbFetchProducts } from '@/lib/supabase/productsApi';
import type { Product } from '@/types/product';

export async function fetchProducts(): Promise<Product[]> {
  const restaurantId = getPublicRestaurantId();

  if (!isSupabaseConfigured()) {
    const data = loadTenantDataOrLegacy(restaurantId);
    if (data.products.length) return data.products;
    return scopeProducts(mockProducts, restaurantId);
  }

  try {
    return await sbFetchProducts(restaurantId);
  } catch (e) {
    console.warn('[products] Supabase error, usando mock local.', e);
    const data = loadTenantDataOrLegacy(restaurantId);
    if (data.products.length) return data.products;
    return scopeProducts(mockProducts, restaurantId);
  }
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const all = await fetchProducts();
  return all.find((p) => p.id === id);
}
