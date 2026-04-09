import { sanitizeTenantId } from '@/lib/tenant/publicTenant';

const PREFIX = 'cardapio_tenant_v1';

export type TenantStorageKeys = {
  /** Slug na URL = `restaurant_id` nos modelos */
  restaurantId: string;
  company: string;
  products: string;
  combos: string;
  orders: string;
  customers: string;
  whatsapp: string;
  seeded: string;
};

export function buildTenantStorageKeys(restaurantIdRaw: string): TenantStorageKeys {
  const restaurantId = sanitizeTenantId(restaurantIdRaw);
  if (!restaurantId) {
    throw new Error(`Invalid restaurant id: ${restaurantIdRaw}`);
  }
  return {
    restaurantId,
    company: `${PREFIX}_${restaurantId}_company`,
    products: `${PREFIX}_${restaurantId}_products`,
    combos: `${PREFIX}_${restaurantId}_combos`,
    orders: `${PREFIX}_${restaurantId}_orders`,
    customers: `${PREFIX}_${restaurantId}_customers`,
    whatsapp: `${PREFIX}_${restaurantId}_whatsapp_bot`,
    seeded: `${PREFIX}_${restaurantId}_seeded`,
  };
}
