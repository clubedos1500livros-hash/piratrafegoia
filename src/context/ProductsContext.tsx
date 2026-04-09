import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ADMIN_HUB, type AdminHubDetail } from '@/lib/tenant/events';
import { getPublicRestaurantId } from '@/lib/tenant/publicTenant';
import { fetchProducts } from '@/lib/products';
import type { Product } from '@/types/product';

type ProductsState = {
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ProductsContext = createContext<ProductsState | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar cardápio');
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const restaurantId = getPublicRestaurantId();
    const onHub = (e: Event) => {
      const d = (e as CustomEvent<AdminHubDetail>).detail;
      if (d?.restaurantId === restaurantId && d?.scope === 'products') void refresh({ silent: true });
    };
    window.addEventListener(ADMIN_HUB, onHub);
    return () => window.removeEventListener(ADMIN_HUB, onHub);
  }, [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh({ silent: true });
    }, 5000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refresh({ silent: true });
      }
    };
    const onFocus = () => void refresh({ silent: true });
    const onPageShow = () => void refresh({ silent: true });
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ products, loading, refreshing, error, refresh: () => refresh() }),
    [products, loading, refreshing, error, refresh],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsState {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
