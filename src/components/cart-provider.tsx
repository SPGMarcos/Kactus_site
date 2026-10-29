'use client';
import { createContext, useContext, useEffect, useState } from 'react';
export type CartItem = {
  variant_id: string;
  name: string;
  size: string;
  color: string;
  price: number;
  image: string;
  quantity: number;
};
const Context = createContext<{
  items: CartItem[];
  ready: boolean;
  add: (item: CartItem) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
}>({
  items: [],
  ready: false,
  add: () => {},
  update: () => {},
  clear: () => {},
});
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const value = JSON.parse(localStorage.getItem('kactus-cart') || '[]');
        if (Array.isArray(value))
          setItems(
            value.filter(
              (i) =>
                i &&
                typeof i.variant_id === 'string' &&
                typeof i.name === 'string' &&
                Number.isInteger(i.quantity) &&
                i.quantity > 0 &&
                Number.isInteger(i.price),
            ),
          );
      } catch {}
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem('kactus-cart', JSON.stringify(items));
  }, [items, ready]);
  return (
    <Context.Provider
      value={{
        items,
        ready,
        add: (item) =>
          setItems((old) => {
            const existing = old.find((i) => i.variant_id === item.variant_id);
            return existing
              ? old.map((i) =>
                  i.variant_id === item.variant_id
                    ? {
                        ...i,
                        quantity: Math.min(20, i.quantity + item.quantity),
                      }
                    : i,
                )
              : [...old, item];
          }),
        update: (id, quantity) =>
          setItems((old) =>
            quantity > 0
              ? old.map((i) =>
                  i.variant_id === id
                    ? { ...i, quantity: Math.min(20, quantity) }
                    : i,
                )
              : old.filter((i) => i.variant_id !== id),
          ),
        clear: () => setItems([]),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useCart = () => useContext(Context);
