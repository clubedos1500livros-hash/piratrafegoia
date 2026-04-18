import { mockProducts } from '@/data/menu';
import { emitAdminHub } from '@/lib/tenant/events';
import type { Product } from '@/types/product';

const storageKey = (restaurantId: string) => `products_${restaurantId}`;

export function loadLocalProducts(restaurantId: string): Product[] | null {
  try {
    const data = localStorage.getItem(storageKey(restaurantId));
    if (data === null) return null;
    const products = JSON.parse(data) as Product[];
    if (!Array.isArray(products)) return null;
    return products.map((product) => ({ ...product, restaurant_id: restaurantId }));
  } catch {
    return null;
  }
}

export function saveLocalProducts(restaurantId: string, products: Product[]): void {
  localStorage.setItem(storageKey(restaurantId), JSON.stringify(products));
  emitAdminHub(restaurantId, 'products');
}

export async function loadProductsForAdmin(restaurantId: string): Promise<Product[]> {
  const products = loadLocalProducts(restaurantId);
  if (products !== null) return products;
  return mockProducts.map((product) => ({ ...product, restaurant_id: restaurantId }));
}

export async function persistProductsForAdmin(
  restaurantId: string,
  products: Product[],
): Promise<void> {
  if (!restaurantId?.trim()) {
    console.error('[ProductsRepo] restaurant_id inválido. Não será possível salvar produtos.', restaurantId);
    throw new Error('restaurant_id inválido para salvar produtos');
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
