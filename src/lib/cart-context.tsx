"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customizations: string[];
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  toasts: Toast[];
  dismissToast: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Storage key spesifik per user (guest / user_id)
  const userKey =
    status === "authenticated" && session?.user
      ? `doodaily_cart_user_${(session.user as any).id || session.user.email}`
      : "doodaily_cart_guest";

  const prevUserKeyRef = useRef(userKey);

  // Muat keranjang saat user berganti / status session siap
  useEffect(() => {
    if (status === "loading") return;

    try {
      const stored = localStorage.getItem(userKey);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Gagal membaca keranjang dari localStorage:", e);
      setItems([]);
    }

    setHydrated(true);
    prevUserKeyRef.current = userKey;
  }, [userKey, status]);

  // Simpan keranjang ke localStorage spesifik user aktif setiap items berubah
  useEffect(() => {
    if (!hydrated || status === "loading") return;

    try {
      localStorage.setItem(userKey, JSON.stringify(items));
    } catch (e) {
      console.error("Gagal menyimpan keranjang ke localStorage:", e);
    }
  }, [items, userKey, hydrated, status]);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === newItem.productId);
        if (existing) {
          showToast(`Jumlah ${newItem.name} diperbarui di keranjang! 🛍️`);
          return prev.map((i) =>
            i.productId === newItem.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        showToast(`${newItem.name} ditambahkan ke keranjang! 🎉`);
        return [...prev, { ...newItem, quantity }];
      });
    },
    [showToast]
  );

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity < 1) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(userKey);
    } catch (e) {
      console.error("Gagal membersihkan keranjang:", e);
    }
  }, [userKey]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
