"use client";

import { CartProvider } from "@/lib/cart-context";
import { MusicPlayer } from "@/components/ui/MusicPlayer";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <MusicPlayer />
    </CartProvider>
  );
}
