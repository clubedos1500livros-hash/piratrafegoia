import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { openWhatsAppOrder, type WhatsAppLine } from '@/lib/whatsapp';
import type { OrderType, Product } from '@/types/product';

export type CartItem = {
  product: Product;
  orderType: OrderType;
  quantity: number;
};

function keyOf(productId: string, orderType: OrderType): string {
  return `${productId}::${orderType}`;
}

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (product: Product, orderType: OrderType, quantity?: number) => void;
  setQuantity: (productId: string, orderType: OrderType, quantity: number) => void;
  increment: (productId: string, orderType: OrderType) => void;
  decrement: (productId: string, orderType: OrderType) => void;
  removeLine: (productId: string, orderType: OrderType) => void;
  clear: () => void;
  subtotal: number;
  lineCount: number;
  sendWhatsApp: () => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  const addItem = useCallback((product: Product, orderType: OrderType, quantity = 1) => {
    setItems((prev) => {
      const k = keyOf(product.id, orderType);
      const idx = prev.findIndex(
        (i) => keyOf(i.product.id, i.orderType) === k,
      );
      if (idx === -1) {
        return [...prev, { product, orderType, quantity }];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
      return next;
    });
  }, []);

  const setQuantity = useCallback(
    (productId: string, orderType: OrderType, quantity: number) => {
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter(
            (i) => keyOf(i.product.id, i.orderType) !== keyOf(productId, orderType),
          );
        }
        return prev.map((i) =>
          keyOf(i.product.id, i.orderType) === keyOf(productId, orderType)
            ? { ...i, quantity }
            : i,
        );
      });
    },
    [],
  );

  const increment = useCallback((productId: string, orderType: OrderType) => {
    setItems((prev) =>
      prev.map((i) =>
        keyOf(i.product.id, i.orderType) === keyOf(productId, orderType)
          ? { ...i, quantity: i.quantity + 1 }
          : i,
      ),
    );
  }, []);

  const decrement = useCallback((productId: string, orderType: OrderType) => {
    setItems((prev) => {
      const next = prev
        .map((i) =>
          keyOf(i.product.id, i.orderType) === keyOf(productId, orderType)
            ? { ...i, quantity: i.quantity - 1 }
            : i,
        )
        .filter((i) => i.quantity > 0);
      return next;
    });
  }, []);

  const removeLine = useCallback((productId: string, orderType: OrderType) => {
    setItems((prev) =>
      prev.filter((i) => keyOf(i.product.id, i.orderType) !== keyOf(productId, orderType)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    [items],
  );

  const lineCount = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items],
  );

  const sendWhatsApp = useCallback(() => {
    if (!items.length) return;
    const lines: WhatsAppLine[] = items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.price,
      orderType: i.orderType,
    }));
    openWhatsAppOrder(lines);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      setOpen,
      addItem,
      setQuantity,
      increment,
      decrement,
      removeLine,
      clear,
      subtotal,
      lineCount,
      sendWhatsApp,
    }),
    [
      items,
      isOpen,
      addItem,
      setQuantity,
      increment,
      decrement,
      removeLine,
      clear,
      subtotal,
      lineCount,
      sendWhatsApp,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
