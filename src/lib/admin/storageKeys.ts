/** Chaves legadas (pré multi-tenant) — usadas só para migração. */
export const LEGACY_ADMIN_KEYS = {
  company: 'cardapio_admin_v1_company',
  products: 'cardapio_admin_v1_products',
  combos: 'cardapio_admin_v1_combos',
  orders: 'cardapio_admin_v1_orders',
  customers: 'cardapio_admin_v1_customers',
  whatsapp: 'cardapio_admin_v1_whatsapp_bot',
  seeded: 'cardapio_admin_v1_seeded',
} as const;
