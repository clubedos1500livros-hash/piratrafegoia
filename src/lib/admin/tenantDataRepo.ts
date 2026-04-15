import { mockProducts } from '@/data/menu';
import { scopeCompany, scopeProducts } from '@/lib/restaurant/scope';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import { sanitizeRestaurantId } from '@/lib/tenant/publicTenant';
import type { CompanySettings } from '@/lib/admin/types';
import type { Product } from '@/types/product';

const STORAGE_PREFIX = 'tenant_data_';

export type AdminTenantData = {
  company: CompanySettings;
  products: Product[];
};

function buildTenantDataKey(restaurantIdRaw: string): string {
  const restaurantId = sanitizeRestaurantId(restaurantIdRaw);
  if (!restaurantId) {
    throw new Error(`Invalid restaurant id: ${restaurantIdRaw}`);
  }
  return `${STORAGE_PREFIX}${restaurantId}`;
}

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

function parseProductList(value: string | null, restaurantId: string): Product[] | null {
  if (value === null) return null;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;
    return scopeProducts(parsed, restaurantId);
  } catch {
    return null;
  }
}

export function loadTenantData(restaurantId: string): AdminTenantData | null {
  const key = buildTenantDataKey(restaurantId);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as AdminTenantData;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.products) || typeof parsed.company !== 'object' || parsed.company === null) {
      return null;
    }
    return {
      company: scopeCompany({ ...defaultCompany(restaurantId), ...parsed.company }, restaurantId),
      products: scopeProducts(parsed.products, restaurantId),
    };
  } catch {
    return null;
  }
}

export function loadTenantDataOrLegacy(restaurantId: string): AdminTenantData {
  const existing = loadTenantData(restaurantId);
  if (existing) return existing;

  const k = buildTenantStorageKeys(restaurantId);
  let company = defaultCompany(k.restaurantId);
  try {
    const rawCompany = localStorage.getItem(k.company);
    if (rawCompany !== null) {
      const parsed = JSON.parse(rawCompany) as Partial<CompanySettings>;
      if (parsed && typeof parsed === 'object') {
        company = { ...company, ...parsed };
      }
    }
  } catch {
    // ignore invalid legacy company data
  }

  let products = parseProductList(localStorage.getItem(k.products), k.restaurantId);
  if (products === null) {
    products = scopeProducts(mockProducts, k.restaurantId);
  }

  return {
    company: scopeCompany(company, k.restaurantId),
    products,
  };
}

export function saveTenantData(restaurantId: string, data: AdminTenantData): void {
  try {
    localStorage.setItem(buildTenantDataKey(restaurantId), JSON.stringify(data));
  } catch {
    // Ignore storage errors.
  }
}
