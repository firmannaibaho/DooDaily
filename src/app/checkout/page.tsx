"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ChevronRight, CreditCard, Lock, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const { items, subtotal } = useCart();

  const shipping = 10000;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-4xl min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-4xl text-brand-blue mb-4">Nothing to checkout</h1>
        <p className="text-foreground/70 font-medium mb-8">Add some items to your cart first!</p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full h-14 px-8 text-lg">Go to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[80vh] flex flex-col lg:flex-row gap-12 items-start">
      {/* Checkout Flow */}
      <div className="w-full lg:w-3/5 flex flex-col gap-8">
        <h1 className="font-display text-4xl text-brand-blue mb-4">Checkout</h1>

        {/* Step 1: Customer Info */}
        <div
          className={cn(
            "bg-white rounded-3xl p-6 md:p-8 border-2 transition-colors duration-300",
            step >= 1 ? "border-brand-blue-light" : "opacity-50 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-4 mb-6">
            <span
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                step === 1
                  ? "bg-brand-blue text-white"
                  : "bg-brand-blue-light text-brand-blue"
              )}
            >
              1
            </span>
            <h2 className="font-display text-2xl text-foreground">
              Contact &amp; Shipping
            </h2>
          </div>

          {step === 1 ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-foreground/70 mb-1 block">
                    First Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground/70 mb-1 block">
                    Last Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-foreground/70 mb-1 block">
                  Email (for order updates)
                </label>
                <input
                  required
                  type="email"
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground/70 mb-1 block">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-foreground/70 mb-1 block">
                  Full Address
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none resize-none"
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="rounded-full px-8">
                  Continue to Payment
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="font-bold text-foreground">Contact info saved</p>
                <p className="text-sm text-foreground/70">
                  You can edit before placing order
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-brand-blue text-sm font-bold hover:underline"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Payment */}
        <div
          className={cn(
            "bg-white rounded-3xl p-6 md:p-8 border-2 transition-colors duration-300",
            step >= 2
              ? "border-brand-blue-light"
              : "border-gray-100 opacity-50 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-4 mb-6">
            <span
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                step === 2
                  ? "bg-brand-orange text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              2
            </span>
            <h2 className="font-display text-2xl text-foreground">
              Payment Method
            </h2>
          </div>

          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMethod("qris")}
                className={cn(
                  "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left",
                  paymentMethod === "qris"
                    ? "border-brand-orange bg-brand-orange-light/30"
                    : "border-gray-200 hover:border-brand-orange/50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-brand-orange-light text-brand-orange flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">QRIS</p>
                  <p className="text-sm text-foreground/60">
                    Pay with any e-wallet or banking app
                  </p>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("transfer")}
                className={cn(
                  "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left",
                  paymentMethod === "transfer"
                    ? "border-brand-orange bg-brand-orange-light/30"
                    : "border-gray-200 hover:border-brand-orange/50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    Bank Transfer (Virtual Account)
                  </p>
                  <p className="text-sm text-foreground/60">
                    BCA, Mandiri, BNI, BRI
                  </p>
                </div>
              </button>

              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                <Button className="w-full h-16 text-xl rounded-full gap-2 shadow-[0_6px_0_0_#2B4C7E]">
                  <Lock className="w-5 h-5" /> Pay Rp{" "}
                  {total.toLocaleString("id-ID")}
                </Button>
                <p className="text-center text-xs text-foreground/50 font-medium mt-4">
                  This is a secure, encrypted payment process. (Architecture
                  prepared for real integration)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="w-full lg:w-2/5 bg-[#FFFBF2] rounded-3xl p-6 md:p-8 border-4 border-brand-blue-light shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] sticky top-28">
        <h3 className="font-display text-2xl text-brand-blue mb-6">
          Order Summary
        </h3>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 pb-4 border-b border-gray-200"
            >
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center relative overflow-hidden">
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center z-10">
                  {item.quantity}
                </span>
                <div className="relative w-10 h-10 opacity-60">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex-grow">
                <p className="font-bold text-sm text-foreground">{item.name}</p>
                {item.customizations.length > 0 && (
                  <p className="text-xs text-foreground/60">
                    {item.customizations.join(", ")}
                  </p>
                )}
              </div>
              <p className="font-bold text-sm">
                Rp {(item.price * item.quantity).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3 text-sm font-medium text-foreground/70 mb-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-foreground">
              Rp {subtotal.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Shipping (Reguler)</span>
            <span className="font-bold text-foreground">
              Rp {shipping.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end border-t-2 border-brand-blue-light pt-6">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-display text-3xl text-brand-orange">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );
}
