import type { AdminOrder, Customer, OrderLine, OrderStatus } from '@/lib/admin/types';
import type { Product } from '@/types/product';
import { getPublicRestaurantId } from '@/lib/tenant/publicTenant';

export function rowToProduct(row: Record<string, unknown>): Product {
  const fallbackRid = getPublicRestaurantId();
  const ing = row.ingredients;
  let ingredients: string[] | null = null;
  if (Array.isArray(ing)) ingredients = ing as string[];
  else if (ing && typeof ing === 'object') ingredients = Object.values(ing as object) as string[];

  const image_url = String(row.image_url ?? row.imageUrl ?? '');
  const video_raw = (row.video ?? row.video_url ?? row.videoUrl ?? null) as string | null | undefined;
  const createdAt = row.created_at ? String(row.created_at) : undefined;
  const videoType =
    (row.video_type as Product['videoType']) ??
    (video_raw && typeof video_raw === 'string' && video_raw.includes('/storage/v1/object/public/')
      ? 'upload'
      : video_raw
        ? 'link'
        : undefined);

  return {
    id: String(row.id),
    restaurant_id: String(row.restaurant_id ?? row.tenant_id ?? fallbackRid),
    category: String(row.category ?? 'outros'),
    name: String(row.name),
    description: String(row.description ?? ''),
    price: Number(row.price),
    image_url,
    video_url: video_raw,
    image: image_url,
    video: video_raw,
    videoType,
    createdAt,
    ingredients,
  };
}

export function productToRow(p: Product, restaurantId: string): Record<string, unknown> {
  return {
    id: p.id,
    restaurant_id: restaurantId,
    category: p.category,
    name: p.name,
    description: p.description,
    price: p.price,
    image_url: p.image_url || p.image || '',
    video_url: p.video_url ?? p.video ?? null,
    image: p.image_url || p.image || '',
    video: p.video_url ?? p.video ?? null,
    video_type: p.videoType ?? null,
    ingredients: p.ingredients ?? null,
    updated_at: new Date().toISOString(),
  };
}

export function rowToAdminOrder(row: Record<string, unknown>): AdminOrder {
  const itemsRaw = row.items;
  const items: OrderLine[] = Array.isArray(itemsRaw)
    ? (itemsRaw as OrderLine[])
    : typeof itemsRaw === 'string'
      ? (JSON.parse(itemsRaw) as OrderLine[])
      : [];

  return {
    id: String(row.id),
    restaurant_id: String(row.restaurant_id),
    created_at: String(row.created_at),
    status: row.status as OrderStatus,
    payment_type: row.payment_type as AdminOrder['payment_type'],
    fulfillment_type: row.fulfillment_type as AdminOrder['fulfillment_type'],
    customer_name: String(row.customer_name ?? ''),
    customer_phone: String(row.customer_phone ?? ''),
    items,
    total: Number(row.total),
  };
}

export function adminOrderToRow(o: AdminOrder): Record<string, unknown> {
  return {
    id: o.id,
    restaurant_id: o.restaurant_id,
    created_at: o.created_at,
    status: o.status,
    payment_type: o.payment_type,
    fulfillment_type: o.fulfillment_type,
    customer_name: o.customer_name,
    customer_phone: o.customer_phone,
    items: o.items,
    total: o.total,
  };
}

export function rowToCustomer(row: Record<string, unknown>): Customer {
  const bd = row.birth_date;
  let birth_date = '';
  if (bd) {
    const s = String(bd);
    birth_date = s.length >= 10 ? s.slice(0, 10) : s;
  }
  return {
    id: String(row.id),
    restaurant_id: String(row.restaurant_id),
    name: String(row.name),
    address: String(row.address ?? ''),
    phone: String(row.phone ?? ''),
    birth_date,
  };
}

export function customerToRow(c: Customer): Record<string, unknown> {
  return {
    id: c.id,
    restaurant_id: c.restaurant_id,
    name: c.name,
    address: c.address,
    phone: c.phone,
    birth_date: c.birth_date || null,
  };
}
