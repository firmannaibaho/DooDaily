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

/** Kunci localStorage untuk keranjang sebelum login. */
const GUEST_CART_KEY = "doodaily_cart_guest";

/**
 * Gabungkan dua daftar item keranjang.
 *
 * KENAPA MENGGABUNG, BUKAN MENIMPA:
 * Saat guest login, keranjang guest harus dipindahkan ke kunci milik user.
 * Kalau user itu sudah punya keranjang tersimpan (pernah belanja sebelumnya),
 * isinya tidak boleh hilang — jadi item dengan productId sama dijumlahkan
 * quantity-nya, sisanya digabung apa adanya.
 */
function mergeCartItems(base: CartItem[], incoming: CartItem[]): CartItem[] {
  const merged = new Map<number, CartItem>();

  for (const item of base) merged.set(item.productId, { ...item });

  for (const item of incoming) {
    const existing = merged.get(item.productId);
    if (existing) {
      merged.set(item.productId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      merged.set(item.productId, { ...item });
    }
  }

  return Array.from(merged.values());
}


export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Storage key spesifik per user (guest / user_id)
  const userKey =
    status === "authenticated" && session?.user
      ? `doodaily_cart_user_${(session.user as any).id || session.user.email}`
      : GUEST_CART_KEY;

  const prevUserKeyRef = useRef(userKey);

  /**
   * Muat keranjang untuk `userKey` yang aktif, sekaligus memindahkan isi
   * keranjang guest bila user baru saja login.
   *
   * KENAPA DIGABUNG SATU EFEK:
   * Tanpa migrasi, isi keranjang hilang begitu user login dari halaman
   * checkout: guest menyimpan di `doodaily_cart_guest`, lalu setelah login
   * kunci aktif berubah ke `doodaily_cart_user_<id>` yang masih kosong.
   *
   * Penggabungan (bukan penimpaan) menjaga keranjang yang sudah dimiliki user
   * dari sesi sebelumnya. Kunci guest dihapus agar tidak termigrasi dua kali.
   *
   * Keduanya digabung dalam satu efek supaya hanya ada satu pemanggilan
   * setItems per pergantian user — menghindari render berantai.
   */
  useEffect(() => {
    if (status === "loading") return;

    const isUserCart = userKey !== GUEST_CART_KEY;

    try {
      // 1. Ambil keranjang milik kunci aktif (kosong bila belum ada).
      const stored = localStorage.getItem(userKey);
      let nextItems: CartItem[] = [];
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) nextItems = parsed as CartItem[];
      }

      // 2. Serap keranjang guest ke keranjang user, lalu bersihkan kuncinya.
      const guestStored = isUserCart ? localStorage.getItem(GUEST_CART_KEY) : null;
      if (guestStored) {
        const guestParsed: unknown = JSON.parse(guestStored);
        if (Array.isArray(guestParsed) && guestParsed.length > 0) {
          nextItems = mergeCartItems(nextItems, guestParsed as CartItem[]);
          localStorage.setItem(userKey, JSON.stringify(nextItems));
        }
        localStorage.removeItem(GUEST_CART_KEY);
      }

      setItems(nextItems);
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
