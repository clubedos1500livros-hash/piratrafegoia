
import { scopeCompany } from '@/lib/restaurant/scope';
import { emitAdminHub } from '@/lib/tenant/events';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import { loadTenantDataOrLegacy, saveTenantData } from '@/lib/admin/tenantDataRepo';
import type { CompanySettings } from '@/lib/admin/types';

export function getCompany(restaurantId: string): CompanySettings {
  return loadTenantDataOrLegacy(restaurantId).company;
}

export function saveCompany(restaurantId: string, c: CompanySettings): void {
  const k = buildTenantStorageKeys(restaurantId);
  const data = loadTenantDataOrLegacy(restaurantId);
  saveTenantData(restaurantId, {
    ...data,
    company: scopeCompany(c, k.restaurantId),
  });
  emitAdminHub(k.restaurantId, 'company');
}
