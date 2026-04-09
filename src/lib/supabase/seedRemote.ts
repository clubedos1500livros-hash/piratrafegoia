import { mockProducts } from '@/data/menu';
import { scopeCustomers, scopeOrders, scopeProducts } from '@/lib/restaurant/scope';
import { getTenant } from '@/lib/tenant/registry';
import { sbFetchCustomers, sbReplaceCustomers } from '@/lib/supabase/customersApi';
import { sbFetchOrders, sbInsertOrder } from '@/lib/supabase/ordersApi';
import { sbFetchProducts, sbSyncProducts } from '@/lib/supabase/productsApi';
import { sbUpsertRestaurant } from '@/lib/supabase/restaurantsApi';
import { supabase } from '@/lib/supabase';
import type { AdminOrder, Customer } from '@/lib/admin/types';

function sampleOrders(rid: string, now: number): AdminOrder[] {
  return [
    {
      id: `seed-o1-${rid}`,
      restaurant_id: rid,
      created_at: new Date(now - 86400000 * 2).toISOString(),
      status: 'completed',
      payment_type: 'pix',
      fulfillment_type: 'delivery',
      customer_name: 'Cliente A',
      customer_phone: '11900001111',
      items: [
        { name: 'Classic Smash', quantity: 2, unit_price: 32.9 },
        { name: 'Limonada Rosa', quantity: 1, unit_price: 12 },
      ],
      total: 77.8,
    },
    {
      id: `seed-o2-${rid}`,
      restaurant_id: rid,
      created_at: new Date(now - 86400000).toISOString(),
      status: 'completed',
      payment_type: 'card',
      fulfillment_type: 'table',
      customer_name: 'Mesa 4',
      customer_phone: '',
      items: [{ name: 'Bacon Crunch', quantity: 1, unit_price: 36.5 }],
      total: 36.5,
    },
    {
      id: `seed-o3-${rid}`,
      restaurant_id: rid,
      created_at: new Date(now - 3600000).toISOString(),
      status: 'preparing',
      payment_type: 'cash',
      fulfillment_type: 'pickup',
      customer_name: 'Carlos',
      customer_phone: '11933334444',
      items: [{ name: 'Cold Brew', quantity: 2, unit_price: 14.5 }],
      total: 29,
    },
    {
      id: `seed-o4-${rid}`,
      restaurant_id: rid,
      created_at: new Date(now - 600000).toISOString(),
      status: 'pending',
      payment_type: 'pix',
      fulfillment_type: 'delivery',
      customer_name: 'Delivery #12',
      customer_phone: '11922223333',
      items: [{ name: 'Classic Smash', quantity: 1, unit_price: 32.9 }],
      total: 32.9,
    },
  ];
}

function sampleCustomers(rid: string): Customer[] {
  return scopeCustomers(
    [
      {
        id: `seed-c1-${rid}`,
        restaurant_id: rid,
        name: 'Ana Costa',
        address: 'Rua A, 10',
        phone: '11988887777',
        birth_date: `${new Date().getFullYear()}-04-04`,
      },
      {
        id: `seed-c2-${rid}`,
        restaurant_id: rid,
        name: 'Bruno Lima',
        address: 'Av. B, 200',
        phone: '11977776666',
        birth_date: '1990-06-15',
      },
    ],
    rid,
  );
}

/** Garante linha em `restaurants` e dados demo se as tabelas estiverem vazias. */
export async function seedRemoteRestaurant(restaurantId: string): Promise<void> {
  if (!supabase) return;

  const name =
    getTenant(restaurantId)?.name ??
    (restaurantId === 'demo' ? 'Demonstração' : restaurantId);
  await sbUpsertRestaurant(restaurantId, name);

  const products = await sbFetchProducts(restaurantId);
  if (products.length === 0) {
    await sbSyncProducts(restaurantId, scopeProducts(mockProducts, restaurantId));
  }

  const orders = await sbFetchOrders(restaurantId);
  if (orders.length === 0) {
    const now = Date.now();
    for (const o of scopeOrders(sampleOrders(restaurantId, now), restaurantId)) {
      await sbInsertOrder(o);
    }
  }

  const customers = await sbFetchCustomers(restaurantId);
  if (customers.length === 0) {
    await sbReplaceCustomers(restaurantId, sampleCustomers(restaurantId));
  }
}
