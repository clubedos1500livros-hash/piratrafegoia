/**
 * Identificador público do restaurante (slug) — mesmo valor de `restaurant_id` nos registros.
 * Em SaaS: subdomínio, path ou cookie.
 */
export function getPublicRestaurantId(): string {
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
