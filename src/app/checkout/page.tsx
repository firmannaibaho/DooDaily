"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  ChevronRight,
  CreditCard,
  Lock,
  Smartphone,
  Package,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

const WHATSAPP_NUMBER = "6285156524928"; // Ganti dengan nomor WA Doodaily

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DDL-${ts}-${rand}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const shipping = 10000;
  const total = subtotal + shipping;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    if (!form.firstName.trim()) errors.firstName = "Nama depan wajib diisi";
    if (!form.lastName.trim()) errors.lastName = "Nama belakang wajib diisi";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Email tidak valid";
    if (!form.phone.trim() || form.phone.length < 9)
      errors.phone = "Nomor HP tidak valid";
    if (!form.address.trim()) errors.address = "Alamat wajib diisi";
    if (!form.city.trim()) errors.city = "Kota wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    const orderId = generateOrderId();

    // Build WhatsApp message
    const itemLines = items
      .map(
        (item) =>
          `• ${item.name}${item.customizations.length ? ` (${item.customizations.join(", ")})` : ""} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`
      )
      .join("\n");

    const methodLabel =
      paymentMethod === "qris"
        ? "QRIS"
        : paymentMethod === "transfer"
          ? "Transfer Bank (BCA)"
          : "COD (Bayar di Tempat)";

    const message =
      `🛍️ *PESANAN BARU — Doodaily Art*\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `*ID Pesanan:* ${orderId}\n\n` +
      `👤 *Data Pembeli*\n` +
      `Nama: ${form.firstName} ${form.lastName}\n` +
      `Email: ${form.email}\n` +
      `No. HP: ${form.phone}\n` +
      `Alamat: ${form.address}, ${form.city}\n` +
      (form.notes ? `Catatan: ${form.notes}\n` : "") +
      `\n🛒 *Detail Pesanan*\n` +
      `${itemLines}\n\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Subtotal: Rp ${subtotal.toLocaleString("id-ID")}\n` +
      `Ongkir: Rp ${shipping.toLocaleString("id-ID")}\n` +
      `*Total: Rp ${total.toLocaleString("id-ID")}*\n\n` +
      `💳 *Metode Bayar:* ${methodLabel}\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Mohon konfirmasi pesanan ini ya kak! 🙏`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Short delay for UX feel
    await new Promise((r) => setTimeout(r, 800));

    // Clear cart
    clearCart();

    // Navigate to success page with params
    const successParams = new URLSearchParams({
      orderId,
      name: form.firstName,
      method: paymentMethod,
      total: total.toString(),
      wa: waUrl,
    });

    router.push(`/order-success?${successParams.toString()}`);
  };

  if (isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 text-2xl font-bold">
          🛡️
        </div>
        <h1 className="font-display text-3xl text-brand-blue mb-3">
          Akun Admin Terdeteksi
        </h1>
        <p className="text-foreground/70 font-medium mb-6 leading-relaxed">
          Akun dengan peran <b>Admin</b> dikhususkan untuk mengelola pesanan, stok, dan studio. Admin tidak diperbolehkan melakukan transaksi belanja / checkout.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/admin">
            <Button size="lg" className="rounded-xl w-full sm:w-auto">
              Ke Dashboard Admin
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline" size="lg" className="rounded-xl w-full sm:w-auto">
              Kelola Pesanan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-4xl min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-4xl text-brand-blue mb-4">
          Tidak ada yang di-checkout
        </h1>
        <p className="text-foreground/70 font-medium mb-8">
          Tambahkan produk ke keranjang dulu ya!
        </p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full h-14 px-8 text-lg">
            Ke Toko
          </Button>
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium transition-colors";
  const errorClass = "text-red-500 text-xs font-medium mt-1";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[80vh] flex flex-col lg:flex-row gap-12 items-start">
      {/* Checkout Flow */}
      <div className="w-full lg:w-3/5 flex flex-col gap-8">
        <h1 className="font-display text-4xl text-brand-blue mb-4">
          Checkout
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-0">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                step >= 1
                  ? "bg-brand-blue text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                step >= 1 ? "text-brand-blue" : "text-gray-400"
              )}
            >
              Informasi
            </span>
          </div>
          <div
            className={cn(
              "flex-1 h-0.5 mx-3 rounded-full transition-all",
              step >= 2 ? "bg-brand-orange" : "bg-gray-200"
            )}
          />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                step >= 2
                  ? "bg-brand-orange text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              2
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                step >= 2 ? "text-brand-orange" : "text-gray-400"
              )}
            >
              Pembayaran
            </span>
          </div>
        </div>

        {/* Step 1: Customer Info */}
        <div
          className={cn(
            "bg-white rounded-3xl p-6 md:p-8 border-2 transition-all duration-300",
            step >= 1 ? "border-brand-blue-light" : "opacity-50 pointer-events-none border-gray-100"
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
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
            </span>
            <h2 className="font-display text-2xl text-foreground">
              Kontak & Pengiriman
            </h2>
          </div>

          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleSubmitInfo}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-foreground/70 mb-1 block">
                    Nama Depan <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Budi"
                    className={cn(inputClass, formErrors.firstName && "border-red-400")}
                  />
                  {formErrors.firstName && (
                    <p className={errorClass}>{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground/70 mb-1 block">
                    Nama Belakang <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Santoso"
                    className={cn(inputClass, formErrors.lastName && "border-red-400")}
                  />
                  {formErrors.lastName && (
                    <p className={errorClass}>{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-foreground/70 mb-1 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="budi@email.com"
                  className={cn(inputClass, formErrors.email && "border-red-400")}
                />
                {formErrors.email && (
                  <p className={errorClass}>{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-foreground/70 mb-1 block">
                  No. HP / WhatsApp <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground/50">
                    +62
                  </span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="8123456789"
                    className={cn(inputClass, "pl-14", formErrors.phone && "border-red-400")}
                  />
                </div>
                {formErrors.phone && (
                  <p className={errorClass}>{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-foreground/70 mb-1 block">
                  Alamat Lengkap <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan..."
                  className={cn(
                    "w-full p-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none resize-none font-medium transition-colors",
                    formErrors.address && "border-red-400"
                  )}
                />
                {formErrors.address && (
                  <p className={errorClass}>{formErrors.address}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-foreground/70 mb-1 block">
                  Kota <span className="text-red-400">*</span>
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  type="text"
                  placeholder="Jakarta"
                  className={cn(inputClass, formErrors.city && "border-red-400")}
                />
                {formErrors.city && (
                  <p className={errorClass}>{formErrors.city}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-foreground/70 mb-1 block">
                  Catatan (opsional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Catatan untuk penjual, misal: minta bubble wrap ekstra, dll."
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none resize-none font-medium transition-colors"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" className="rounded-full px-8 h-12 gap-2">
                  Lanjut ke Pembayaran <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center bg-brand-blue-light/30 p-4 rounded-2xl">
              <div>
                <p className="font-bold text-foreground">
                  {form.firstName} {form.lastName}
                </p>
                <p className="text-sm text-foreground/70 font-medium">
                  {form.email} · +62{form.phone}
                </p>
                <p className="text-sm text-foreground/70 font-medium">
                  {form.address}, {form.city}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-brand-blue text-sm font-bold hover:underline ml-4"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Payment */}
        <div
          className={cn(
            "bg-white rounded-3xl p-6 md:p-8 border-2 transition-all duration-300",
            step >= 2
              ? "border-brand-blue-light"
              : "border-gray-100 opacity-40 pointer-events-none"
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
              Metode Pembayaran
            </h2>
          </div>

          {step === 2 && (
            <div className="space-y-4">
              {/* QRIS */}
              <button
                onClick={() => setPaymentMethod("qris")}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                  paymentMethod === "qris"
                    ? "border-brand-orange bg-brand-orange-light/30"
                    : "border-gray-200 hover:border-brand-orange/50"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-brand-orange-light text-brand-orange flex items-center justify-center shrink-0 text-xl">
                  📱
                </div>
                <div>
                  <p className="font-bold text-foreground">QRIS</p>
                  <p className="text-sm text-foreground/60">
                    Bayar lewat e-wallet atau m-banking (GoPay, OVO, Dana, dll.)
                  </p>
                </div>
                {paymentMethod === "qris" && (
                  <CheckCircle className="w-5 h-5 text-brand-orange ml-auto shrink-0" />
                )}
              </button>

              {/* Transfer Bank */}
              <button
                onClick={() => setPaymentMethod("transfer")}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                  paymentMethod === "transfer"
                    ? "border-brand-orange bg-brand-orange-light/30"
                    : "border-gray-200 hover:border-brand-orange/50"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Transfer Bank</p>
                  <p className="text-sm text-foreground/60">
                    BCA · Mandiri · BNI · BRI
                  </p>
                </div>
                {paymentMethod === "transfer" && (
                  <CheckCircle className="w-5 h-5 text-brand-orange ml-auto shrink-0" />
                )}
              </button>

              {/* COD */}
              <button
                onClick={() => setPaymentMethod("cod")}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                  paymentMethod === "cod"
                    ? "border-brand-orange bg-brand-orange-light/30"
                    : "border-gray-200 hover:border-brand-orange/50"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">COD (Bayar di Tempat)</p>
                  <p className="text-sm text-foreground/60">
                    Bayar tunai saat barang tiba
                  </p>
                </div>
                {paymentMethod === "cod" && (
                  <CheckCircle className="w-5 h-5 text-brand-orange ml-auto shrink-0" />
                )}
              </button>

              {/* Transfer Detail Preview */}
              {paymentMethod === "transfer" && (
                <div className="bg-brand-blue-light/20 rounded-2xl p-4 border border-brand-blue-light">
                  <p className="text-xs font-bold text-foreground/50 mb-2 uppercase tracking-widest">
                    Rekening Tujuan
                  </p>
                  <p className="font-bold text-foreground">BCA — 1234567890</p>
                  <p className="text-sm text-foreground/70 font-medium">
                    a.n. Doodaily Art
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                <Button
                  className="w-full h-16 text-xl rounded-full gap-3 shadow-[0_6px_0_0_#2B4C7E] hover:shadow-[0_2px_0_0_#2B4C7E] hover:translate-y-[4px] transition-all"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Buat Pesanan · Rp {total.toLocaleString("id-ID")}
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-foreground/50 font-medium mt-4 flex items-center justify-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  Pesanan akan langsung dikirim via WhatsApp untuk konfirmasi
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="w-full lg:w-2/5 bg-[#FFFBF2] rounded-3xl p-6 md:p-8 border-4 border-brand-blue-light shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] sticky top-28">
        <h3 className="font-display text-2xl text-brand-blue mb-6">
          Ringkasan Pesanan
        </h3>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 pb-4 border-b border-gray-200"
            >
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center relative overflow-hidden shrink-0">
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center z-10">
                  {item.quantity}
                </span>
                <div className="relative w-10 h-10 opacity-70">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-bold text-sm text-foreground leading-snug truncate">
                  {item.name}
                </p>
                {item.customizations.length > 0 && (
                  <p className="text-xs text-foreground/60 mt-0.5">
                    {item.customizations.join(", ")}
                  </p>
                )}
              </div>
              <p className="font-bold text-sm shrink-0">
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
            <span>Ongkir (Reguler)</span>
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

        {/* Trust badges */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col gap-2">
          {[
            { icon: "🔒", text: "Transaksi aman & terpercaya" },
            { icon: "📦", text: "Dikemas dengan bubble wrap" },
            { icon: "💬", text: "Konfirmasi via WhatsApp" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-foreground/60 font-medium">
              <span>{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
