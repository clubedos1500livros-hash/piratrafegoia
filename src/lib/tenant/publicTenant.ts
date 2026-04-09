const PUBLIC_TENANT_STORAGE_KEY = 'cardapio_public_tenant_id';

function readStoredPublicTenantId(): string | null {
  try {
    const raw = window.localStorage.getItem(PUBLIC_TENANT_STORAGE_KEY);
    if (!raw) return null;
    return sanitizeRestaurantId(raw);
  } catch {
    return null;
  }
}

function readPublicTenantIdFromUrl(): string | null {
  try {
    const q = new URLSearchParams(window.location.search);
    const raw = q.get('tenant') ?? q.get('restaurant_id');
    if (!raw) return null;
    return sanitizeRestaurantId(raw);
  } catch {
    return null;
  }
}

export function setPublicRestaurantId(raw: string): string | null {
  const id = sanitizeRestaurantId(raw);
  if (!id) return null;
  try {
    window.localStorage.setItem(PUBLIC_TENANT_STORAGE_KEY, id);
  } catch {
    // Ignore storage errors (private mode, disabled storage, etc.)
  }
  return id;
}

/**
 * Identificador público do restaurante (slug) — mesmo valor de `restaurant_id` nos registros.
 * Em SaaS: subdomínio, path ou cookie.
 */
export function getPublicRestaurantId(): string {
  const fromUrl = readPublicTenantIdFromUrl();
  if (fromUrl) {
    setPublicRestaurantId(fromUrl);
    return fromUrl;
  }

  const fromStorage = readStoredPublicTenantId();
  if (fromStorage) return fromStorage;

  const fromEnv = import.meta.env.VITE_PUBLIC_TENANT_ID?.trim();
  if (fromEnv) return sanitizeRestaurantId(fromEnv) ?? 'demo';
  return 'demo';
}

/** @deprecated use getPublicRestaurantId */
export const getPublicTenantId = getPublicRestaurantId;

export function sanitizeRestaurantId(raw: string): string | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  if (s.length < 2 || s.length > 64) return null;
  if (s.startsWith('-') || s.endsWith('-')) return null;
  return s;
}

/** @deprecated use sanitizeRestaurantId */
export const sanitizeTenantId = sanitizeRestaurantId;
