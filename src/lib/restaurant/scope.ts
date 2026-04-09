import type {
  AdminCombo,
  AdminOrder,
  CompanySettings,
  Customer,
  WhatsAppBotConfig,
} from '@/lib/admin/types';
import type { Product } from '@/types/product';

/** Garante `restaurant_id` em cada registro (dados legados / mock sem campo). */
export function scopeProduct(p: Product, restaurantId: string): Product {
  return { ...p, restaurant_id: restaurantId };
}

export function scopeProducts(list: Product[], restaurantId: string): Product[] {
  return list.map((p) => scopeProduct(p, restaurantId));
}

export function scopeCustomer(c: Customer, restaurantId: string): Customer {
  return { ...c, restaurant_id: restaurantId };
}

export function scopeCustomers(list: Customer[], restaurantId: string): Customer[] {
  return list.map((c) => scopeCustomer(c, restaurantId));
}

export function scopeOrder(o: AdminOrder, restaurantId: string): AdminOrder {
  return { ...o, restaurant_id: restaurantId };
}

export function scopeOrders(list: AdminOrder[], restaurantId: string): AdminOrder[] {
  return list.map((o) => scopeOrder(o, restaurantId));
}

export function scopeCombo(c: AdminCombo, restaurantId: string): AdminCombo {
  return { ...c, restaurant_id: restaurantId };
}

export function scopeCombos(list: AdminCombo[], restaurantId: string): AdminCombo[] {
  return list.map((c) => scopeCombo(c, restaurantId));
}

export function scopeCompany(c: CompanySettings, restaurantId: string): CompanySettings {
  return { ...c, restaurant_id: restaurantId, id: restaurantId };
}

export function scopeWhatsAppConfig(
  c: WhatsAppBotConfig,
  restaurantId: string,
): WhatsAppBotConfig {
  return { ...c, restaurant_id: restaurantId };
}
