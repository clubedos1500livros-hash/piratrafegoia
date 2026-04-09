import { LEGACY_ADMIN_KEYS } from '@/lib/admin/storageKeys';
import { sanitizeTenantId } from '@/lib/tenant/publicTenant';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';

/**
 * Copia dados do armazenamento global antigo (single-tenant) para um tenant.
 * Executa uma vez quando o tenant ainda não tem flag `seeded` e existem chaves legadas.
 */
export function migrateLegacyStorageToTenant(targetTenantId: string): void {
  const slug = sanitizeTenantId(targetTenantId);
  if (!slug) return;
  const keys = buildTenantStorageKeys(slug);
  if (localStorage.getItem(keys.seeded) === '1') return;

  const hadLegacy =
    localStorage.getItem(LEGACY_ADMIN_KEYS.products) !== null ||
    localStorage.getItem(LEGACY_ADMIN_KEYS.company) !== null;

  if (!hadLegacy) return;

  const copyIfMissing = (legacyKey: string, newKey: string) => {
    const legacy = localStorage.getItem(legacyKey);
    if (legacy === null) return;
    if (localStorage.getItem(newKey) !== null) return;
    localStorage.setItem(newKey, legacy);
  };

  copyIfMissing(LEGACY_ADMIN_KEYS.company, keys.company);
  copyIfMissing(LEGACY_ADMIN_KEYS.products, keys.products);
  copyIfMissing(LEGACY_ADMIN_KEYS.combos, keys.combos);
  copyIfMissing(LEGACY_ADMIN_KEYS.orders, keys.orders);
  copyIfMissing(LEGACY_ADMIN_KEYS.customers, keys.customers);
  copyIfMissing(LEGACY_ADMIN_KEYS.whatsapp, keys.whatsapp);
  if (localStorage.getItem(LEGACY_ADMIN_KEYS.seeded) === '1') {
    localStorage.setItem(keys.seeded, '1');
  }
}
