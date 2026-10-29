"use client";

import { CartProvider } from "@/lib/cart-context";
import { MusicPlayer } from "@/components/ui/MusicPlayer";
import { ToastContainer } from "@/components/ui/Toast";
import { SessionProvider } from "next-auth/react";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <MusicPlayer />
        <ToastContainer />
      </CartProvider>
    </SessionProvider>
  );
}
