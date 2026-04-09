/**
 * Mapa de tabelas sugeridas no Supabase (RLS conforme sua política).
 * Todas as tabelas de negócio referenciam `restaurant_id` → `restaurants.id`.
 */
export const SUPABASE_TABLES = {
  /** Catálogo de restaurantes (SaaS) */
  restaurants: 'restaurants',
  company_settings: 'company_settings',
  products: 'products',
  combos: 'combos',
  orders: 'orders',
  customers: 'customers',
  whatsapp_config: 'whatsapp_bot_config',
} as const;

/**
 * RLS típico: `restaurant_id = auth.jwt() ->> 'restaurant_id'` ou tabela `restaurant_users`.
 */
export type SupabaseRestaurantRow = {
  id: string;
  name: string;
  created_at: string;
};

/** @deprecated use SupabaseRestaurantRow */
export type SupabaseTenantRow = SupabaseRestaurantRow;

export type SupabaseCompanyRow = {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  phone: string;
  business_hours: string;
  logo_image_url: string | null;
  logo_video_url: string | null;
};

export type SupabaseProductRow = {
  id: string;
  restaurant_id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  video_url: string | null;
  ingredients: string[] | null;
};

export type SupabaseComboRow = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  product_ids: string[];
  price: number;
  image_url: string | null;
};

export type SupabaseOrderRow = {
  id: string;
  restaurant_id: string;
  created_at: string;
  status: string;
  payment_type: string;
  fulfillment_type: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: unknown;
  total: number;
};

export type SupabaseCustomerRow = {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  phone: string;
  birth_date: string;
};

export type SupabaseWhatsAppConfigRow = {
  restaurant_id: string;
  welcome_message: string;
  order_summary_intro: string;
  cart_footer_message: string;
  webhook_url_placeholder: string | null;
};
