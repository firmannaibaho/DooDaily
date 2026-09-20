"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Trash2, ChevronRight, Lock } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-4xl min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-48 h-48 relative opacity-50 mb-8 grayscale">
          <Image src="/logo.jpg" alt="Empty Cart" fill className="object-contain" />
        </div>
        <h1 className="font-display text-4xl text-brand-blue mb-4">
          Your playground is empty!
        </h1>
        <p className="text-foreground/70 font-medium mb-8">
          Looks like you haven&apos;t added any doodles yet.
        </p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full h-14 px-8 text-lg">
            Explore the Shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[80vh]">
      <h1 className="font-display text-4xl md:text-5xl text-brand-blue mb-8">
        Your Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-3xl p-4 md:p-6 border-2 border-brand-blue-light flex gap-4 md:gap-6 relative"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-[#FFFBF2] rounded-2xl relative p-2 border border-brand-blue-light/50 flex items-center justify-center">
                <div className="relative w-full h-full opacity-80">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex-grow flex flex-col justify-between py-2">
                <div>
                  <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight mb-1">
                    {item.name}
                  </h3>
                  <p className="text-brand-orange font-bold text-lg md:text-xl mb-2">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>

                  {item.customizations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.customizations.map((c, i) => (
                        <span
                          key={i}
                          className="text-xs font-bold bg-brand-blue-light text-brand-blue px-2 py-1 rounded-md"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-full p-1 w-28 justify-between">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-foreground font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-foreground font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-400 hover:text-red-600 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3 bg-white rounded-3xl p-6 md:p-8 border-2 border-brand-blue-light shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] sticky top-28">
          <h2 className="font-display text-2xl text-brand-blue mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 text-sm font-medium text-foreground/70 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-foreground">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-brand-orange">Calculated at checkout</span>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-brand-blue-light pt-6 mb-8 flex justify-between items-end">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-display text-3xl text-brand-blue">
              Rp {subtotal.toLocaleString("id-ID")}
            </span>
          </div>

          <Link href="/checkout">
            <Button size="lg" className="w-full h-16 text-xl rounded-full gap-2">
              Checkout <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>

          <div className="mt-6 flex justify-center items-center gap-2 text-xs text-foreground/50 font-medium">
            <Lock className="w-4 h-4" /> Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
