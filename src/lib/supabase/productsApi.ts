import type { Product } from '@/types/product';

export async function sbFetchProducts(restaurantId: string): Promise<Product[]> {
  return [];
}

export async function sbSyncProducts(restaurantId: string, products: Product[]): Promise<void> {
  return;
}

export function sbSubscribeProducts(
  restaurantId: string,
  onChange: () => void,
): { unsubscribe: () => void } {
  return { unsubscribe: () => {} };
}
