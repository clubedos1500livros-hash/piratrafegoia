
import { scopeCompany } from '@/lib/restaurant/scope';
import { emitAdminHub } from '@/lib/tenant/events';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import type { CompanySettings } from '@/lib/admin/types';

function defaultCompany(restaurantId: string): CompanySettings {
  return {
    id: restaurantId,
    restaurant_id: restaurantId,
    name: 'Meu Restaurante',
    address: '',
    phone: '',
    business_hours: 'Seg–Sex 11h–23h\nSáb–Dom 11h–00h',
    logo_image_url: '',
    logo_video_url: '',
  };
}

export function getCompany(restaurantId: string): CompanySettings {
  const k = buildTenantStorageKeys(restaurantId);
  const raw = loadJson<CompanySettings>(k.company, defaultCompany(k.restaurantId));
  return scopeCompany({ ...defaultCompany(k.restaurantId), ...raw }, k.restaurantId);
}

export function saveCompany(restaurantId: string, c: CompanySettings): void {
  const k = buildTenantStorageKeys(restaurantId);
  saveJson(k.company, scopeCompany(c, k.restaurantId));
  emitAdminHub(k.restaurantId, 'company');
}
