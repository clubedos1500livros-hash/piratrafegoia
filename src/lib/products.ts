import { mockProducts } from '@/data/menu';
import { loadTenantDataOrLegacy } from '@/lib/admin/tenantDataRepo';
import { scopeProducts } from '@/lib/restaurant/scope';
import { getPublicRestaurantId } from '@/lib/tenant/publicTenant';
import type { Product } from '@/types/product';

const storageKey = (restaurantId: string) => `products_${restaurantId}`;

function loadLocalProducts(restaurantId: string): Product[] | null {
  const raw = localStorage.getItem(storageKey(restaurantId));
  if (raw === null) return null;
  try {
    const products = JSON.parse(raw) as Product[];
    if (!Array.isArray(products)) return null;
    return products.map((product) => ({ ...product, restaurant_id: restaurantId }));
  } catch {
    return null;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const restaurantId = getPublicRestaurantId();
  const localProducts = loadLocalProducts(restaurantId);
  if (localProducts !== null) return localProducts;

  const data = loadTenantDataOrLegacy(restaurantId);
  if (data.products.length) return data.products;
  return scopeProducts(mockProducts, restaurantId);
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const all = await fetchProducts();
  return all.find((p) => p.id === id);
}
