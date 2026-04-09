import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { getTenant } from '@/lib/tenant/registry';
import type { TenantStorageKeys } from '@/lib/tenant/storageKeys';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';

export type TenantContextValue = {
  /** Mesmo valor persistido como `restaurant_id` nos modelos */
  restaurantId: string;
  displayName: string;
  keys: TenantStorageKeys;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  restaurantId: restaurantIdProp,
  children,
}: {
  restaurantId: string;
  children: ReactNode;
}) {
  const value = useMemo((): TenantContextValue => {
    const keys = buildTenantStorageKeys(restaurantIdProp);
    const rec = getTenant(keys.restaurantId);
    return {
      restaurantId: keys.restaurantId,
      displayName: rec?.name ?? keys.restaurantId,
      keys,
    };
  }, [restaurantIdProp]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
