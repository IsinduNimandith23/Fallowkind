"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartItem = {
  productId: number;
  name: string;
  category: string;
  price: string;
  priceValue: number;
  color: string;
  colorHex: string;
  size: string;
  quantity: number;
  imageUrl?: string;
  imageUrl2?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: number, color: string, size: string) => void;
  updateQty: (productId: number, color: string, size: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType>(null!);

function itemKey(productId: number, color: string, size: string) {
  return `${productId}|${color}|${size}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fk-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (skip before hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("fk-cart", JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const key = itemKey(item.productId, item.color, item.size);
      const existing = prev.find(
        (i) => itemKey(i.productId, i.color, i.size) === key
      );
      if (existing) {
        return prev.map((i) =>
          itemKey(i.productId, i.color, i.size) === key
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((productId: number, color: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => itemKey(i.productId, i.color, i.size) !== itemKey(productId, color, size))
    );
  }, []);

  const updateQty = useCallback(
    (productId: number, color: string, size: string, qty: number) => {
      if (qty < 1) {
        removeItem(productId, color, size);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.productId, i.color, i.size) === itemKey(productId, color, size)
            ? { ...i, quantity: qty }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("fk-cart");
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.priceValue * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalItems,
        subtotal,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
