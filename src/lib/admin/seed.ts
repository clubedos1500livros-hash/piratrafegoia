import { mockProducts } from '@/data/menu';
import { getCompany, saveCompany } from '@/lib/admin/companyRepo';
import { saveCombos } from '@/lib/admin/combosRepo';
import { saveCustomers } from '@/lib/admin/customersRepo';
import { saveOrders } from '@/lib/admin/ordersRepo';
import { loadLocalProducts, saveLocalProducts } from '@/lib/admin/productsRepo';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import type { AdminCombo, AdminOrder, Customer } from '@/lib/admin/types';

export function seedTenantIfNeeded(restaurantId: string): void {
  const k = buildTenantStorageKeys(restaurantId);
  if (localStorage.getItem(k.seeded) === '1') return;
  localStorage.setItem(k.seeded, '1');

  const rid = k.restaurantId;
  const company = getCompany(rid);
  if (!company.name || company.name === 'Meu Restaurante') {
    saveCompany(rid, {
      ...company,
      name: 'Burger & Co',
      address: 'Rua Exemplo, 100 — Centro',
      phone: '(11) 99999-0000',
    });
  }

  if (loadLocalProducts(rid) === null) {
    saveLocalProducts(rid, mockProducts);
  }

  const sampleCustomers: Customer[] = [
    {
      id: '1',
      restaurant_id: rid,
      name: 'Ana Costa',
      address: 'Rua A, 10',
      phone: '11988887777',
      birth_date: `${new Date().getFullYear()}-04-04`,
    },
    {
      id: '2',
      restaurant_id: rid,
      name: 'Bruno Lima',
      address: 'Av. B, 200',
      phone: '11977776666',
      birth_date: '1990-06-15',
    },
  ];
  saveCustomers(rid, sampleCustomers);

  const now = Date.now();
  const orders: AdminOrder[] = [
    {
      id: 'o1',
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
      id: 'o2',
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
      id: 'o3',
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
      id: 'o4',
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
  saveOrders(rid, orders);

  const combo: AdminCombo = {
    id: '1',
    restaurant_id: rid,
    name: 'Combo Família',
    description: '2 burgers + 2 bebidas',
    product_ids: ['1', '3'],
    price: 39.9,
    image_url: '',
  };
  saveCombos(rid, [combo]);
}
