import { useCallback, useEffect, useState } from 'react';
import { fetchOrders, getOrders } from '@/lib/admin/ordersRepo';
import { isSupabaseConfigured } from '@/lib/supabase';
import { sbSubscribeOrders } from '@/lib/supabase/ordersApi';
import { ADMIN_HUB, type AdminHubDetail } from '@/lib/tenant/events';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import type { AdminOrder } from '@/lib/admin/types';

const POLL_MS_LOCAL = 3000;
const POLL_MS_REMOTE_FALLBACK = 20000;

export function useOrdersRealtime(restaurantId: string): AdminOrder[] {
  const [orders, setOrders] = useState<AdminOrder[]>(() =>
    isSupabaseConfigured() ? [] : getOrders(restaurantId),
  );

  const refresh = useCallback(() => {
    if (isSupabaseConfigured()) {
      void fetchOrders(restaurantId)
        .then(setOrders)
        .catch(() => setOrders([]));
    } else {
      setOrders(getOrders(restaurantId));
    }
  }, [restaurantId]);

  useEffect(() => {
    refresh();

    let unsubRealtime: (() => void) | undefined;
    let intervalId: number | undefined;

    if (isSupabaseConfigured()) {
      const { unsubscribe } = sbSubscribeOrders(restaurantId, refresh);
      unsubRealtime = unsubscribe;
      intervalId = window.setInterval(refresh, POLL_MS_REMOTE_FALLBACK);
    } else {
      intervalId = window.setInterval(refresh, POLL_MS_LOCAL);
    }

    const onHub = (e: Event) => {
      const d = (e as CustomEvent<AdminHubDetail>).detail;
      if (d?.restaurantId === restaurantId && d?.scope === 'orders') refresh();
    };
    const k = buildTenantStorageKeys(restaurantId);
    const onStorage = (e: StorageEvent) => {
      if (e.key === k.orders) refresh();
    };
    window.addEventListener(ADMIN_HUB, onHub);
    window.addEventListener('storage', onStorage);
    return () => {
      unsubRealtime?.();
      if (intervalId !== undefined) window.clearInterval(intervalId);
      window.removeEventListener(ADMIN_HUB, onHub);
      window.removeEventListener('storage', onStorage);
    };
  }, [restaurantId, refresh]);

  return orders;
}
