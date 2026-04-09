import type { Product } from '@/types/product';

export type OrderStatus = 'pending' | 'preparing' | 'completed';
export type PaymentType = 'cash' | 'pix' | 'card';
/** Para relatórios: mesa, entrega, retirada */
export type FulfillmentType = 'table' | 'delivery' | 'pickup';

export type CompanySettings = {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  phone: string;
  /** Texto livre ou linhas por dia */
  business_hours: string;
  logo_image_url: string;
  logo_video_url: string;
};

export type AdminCombo = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  product_ids: string[];
  price: number;
  image_url: string;
};

export type OrderLine = {
  name: string;
  quantity: number;
  unit_price: number;
};

export type AdminOrder = {
  id: string;
  restaurant_id: string;
  created_at: string;
  status: OrderStatus;
  payment_type: PaymentType;
  fulfillment_type: FulfillmentType;
  customer_name: string;
  customer_phone: string;
  items: OrderLine[];
  total: number;
};

export type Customer = {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  phone: string;
  /** ISO date yyyy-mm-dd */
  birth_date: string;
};

export type WhatsAppBotConfig = {
  restaurant_id: string;
  welcome_message: string;
  order_summary_intro: string;
  cart_footer_message: string;
  /** URL futura para webhook do chatbot */
  webhook_url_placeholder: string;
};

export type FinancialReportRow = {
  order_id: string;
  restaurant_id: string;
  date: string;
  total: number;
  payment_type: PaymentType;
  fulfillment_type: FulfillmentType;
  status: OrderStatus;
};

export type { Product };
