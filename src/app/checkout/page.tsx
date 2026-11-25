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
  AlertCircle,
  UserPlus,
  LogIn,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { ChatContextButton } from "@/components/chat/ChatContextButton";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

const WHATSAPP_NUMBER = "6282284479726"; // WhatsApp Doodaily Art

/** Batas waktu permintaan simpan pesanan (ms). */
const SAVE_ORDER_TIMEOUT_MS = 20_000;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  // ── GERBANG STATUS SESI ──────────────────────────────────────────────────
  // Jangan merender form sebelum sesi diketahui. Selain mencegah user yang
  // sudah login sempat melihat gerbang, ini membuat nilai awal form di
  // CheckoutForm bisa langsung memakai data akun tanpa perlu useEffect.
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-24 max-w-xl min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
        <p className="text-foreground/60 font-medium">Memeriksa sesi...</p>
      </div>
    );
  }

  // Checkout WAJIB punya akun.
  if (status === "unauthenticated") {
    return <CheckoutLoginGate />;
  }

  if (isAdmin) {
    return <AdminBlocked />;
  }

  return <CheckoutForm sessionUser={session?.user} />;
}

/**
 * Gerbang yang tampil saat pengunjung belum login.
 *
 * Kenapa berupa halaman, bukan redirect otomatis: user perlu tahu MENGAPA
 * dialihkan, dan perlu yakin isi keranjangnya tidak hilang. Ringkasan
 * keranjang ditampilkan untuk menegaskan hal itu.
 */
function CheckoutLoginGate() {
  const { items } = useCart();
  const loginHref = "/login?next=%2Fcheckout";
  const registerHref = "/register?next=%2Fcheckout";

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-full bg-white rounded-3xl border-4 border-brand-blue-light shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h1 className="font-display text-3xl text-brand-blue mb-2">
          Login Dulu untuk Checkout
        </h1>
        <p className="text-foreground/70 font-medium mb-6 leading-relaxed">
          Pesanan perlu terhubung ke akun supaya kamu bisa memantau status
          produksi dan riwayat pesanan kapan saja.
        </p>

        {/* Ringkasan keranjang: menegaskan isi keranjang tetap aman */}
        {items.length > 0 && (
          <div className="bg-[#FFFBF2] rounded-2xl border-2 border-brand-blue-light p-4 mb-6 text-left">
            <p className="text-sm font-bold text-foreground/70 mb-2">
              Keranjangmu ({items.length} item) tetap tersimpan:
            </p>
            <ul className="space-y-1">
              {items.slice(0, 4).map((item) => (
                <li
                  key={item.productId}
                  className="flex justify-between text-sm text-foreground/70 font-medium"
                >
                  <span className="truncate pr-3">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="shrink-0 font-bold">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </span>
                </li>
              ))}
            </ul>
            {items.length > 4 && (
              <p className="text-xs text-foreground/50 mt-2 font-medium">
                dan {items.length - 4} item lainnya
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={loginHref} className="flex-1">
            <Button size="lg" className="w-full rounded-xl gap-2">
              <LogIn className="w-5 h-5" />
              Masuk
            </Button>
          </Link>
          <Link href={registerHref} className="flex-1">
            <Button variant="outline" size="lg" className="w-full rounded-xl gap-2">
              <UserPlus className="w-5 h-5" />
              Daftar Akun
            </Button>
          </Link>
        </div>

        <Link
          href="/cart"
          className="inline-block mt-6 text-sm font-bold text-foreground/50 hover:text-brand-blue transition-colors"
        >
          ← Kembali ke keranjang
        </Link>
      </div>
    </div>
  );
}

/** Admin tidak boleh bertransaksi. */
function AdminBlocked() {
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

/**
 * Form checkout untuk user yang sudah login.
 *
 * Hanya dirender setelah status sesi "authenticated", sehingga nilai awal
 * form bisa langsung memakai data akun tanpa useEffect.
 */
function CheckoutForm({
  sessionUser,
}: {
  sessionUser: { name?: string | null; email?: string | null } | undefined;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [qrMode, setQrMode] = useState<"none" | "per_unit" | "per_order">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** order_id pesanan yang baru dibuat; dipakai di step 3 (unggah bukti). */
  const [orderId, setOrderId] = useState("");
  /** Berkas bukti pembayaran yang dipilih user di step 3. */
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState("");
  const [proofUploading, setProofUploading] = useState(false);
  const { items, clearCart } = useCart();

  const useQr = qrMode !== "none";
  const pricedItems = useQr
    ? items.map((item) => ({ ...item, price: Math.max(item.price, 15000) }))
    : items;

  /**
   * Nilai awal form.
   *
   * Nama & email diambil dari akun yang login dan dipecah saat inisialisasi
   * state (bukan di useEffect) agar tidak memicu cascading render. Karena
   * hanya berlaku sebagai NILAI AWAL, ketikan user tidak pernah tertimpa.
   */
  const [form, setForm] = useState<FormData>(() => {
    const sessionName = sessionUser?.name?.trim() ?? "";
    const spaceIndex = sessionName.indexOf(" ");
    return {
      firstName: spaceIndex === -1 ? sessionName : sessionName.slice(0, spaceIndex),
      lastName: spaceIndex === -1 ? "" : sessionName.slice(spaceIndex + 1),
      email: sessionUser?.email ?? "",
      phone: "",
      address: "",
      city: "",
      notes: "",
    };
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  /**
   * ONGKIR TIDAK DIHITUNG DI SINI.
   *
   * Harga yang ditagihkan hanya harga keychain (subtotal). Ongkir dikonfirmasi
   * terpisah lewat chat admin, jadi `total === subtotal` dan `shipping` selalu
   * 0. Kolom `shipping` tetap dikirim agar skema database tidak berubah.
   */
  const subtotal = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal;

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

  /**
   * STEP 2 → 3: Simpan pesanan ke database, lalu tampilkan step 3
   * (unggah bukti pembayaran).
   *
   * Pesanan sengaja dibuat SEBELUM bukti diunggah supaya bukti punya
   * `order_id` tujuan. Kalau user batal di step 3, pesanan tetap ada dengan
   * status `pending` dan tanpa bukti — admin bisa menagih lewat chat.
   */
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // ── 1. SIMPAN PESANAN KE DATABASE ────────────────────────────────
    // Sebelumnya langkah ini tidak ada sehingga tabel `orders` selalu kosong
    // dan pesanan hanya terkirim lewat WhatsApp. order_id sekarang dibuat
    // oleh SERVER agar konsisten dengan data yang tersimpan.
    let createdId: string;
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(SAVE_ORDER_TIMEOUT_MS),
        body: JSON.stringify({
          customer_name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          notes: form.notes.trim(),
          payment_method: paymentMethod,
          items_json: JSON.stringify(pricedItems),
          subtotal,
          shipping,
          total,
          qr_mode: qrMode,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { order_id?: string; message?: string }
        | null;

      if (!response.ok || !data?.order_id) {
        // Sesi kedaluwarsa / belum login: arahkan ke halaman login.
        if (response.status === 401) {
          setSubmitError("Sesi kamu sudah berakhir. Silakan login ulang.");
          setIsSubmitting(false);
          router.push("/login?next=%2Fcheckout");
          return;
        }
        setSubmitError(
          data?.message ||
            "Pesanan gagal disimpan. Periksa koneksi lalu coba lagi."
        );
        setIsSubmitting(false);
        return;
      }

      createdId = data.order_id;
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      setSubmitError(
        timedOut
          ? "Server terlalu lama merespons. Coba lagi sebentar."
          : "Tidak dapat menghubungi server. Periksa koneksi Anda."
      );
      setIsSubmitting(false);
      return;
    }

    setOrderId(createdId);
    setIsSubmitting(false);

    // COD tidak butuh bukti bayar → langsung selesaikan.
    if (paymentMethod === "cod") {
      finalizeOrder(createdId);
      return;
    }

    // QRIS / transfer → minta bukti pembayaran di step 3.
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * STEP 3 → SELESAI: finalisasi pesanan.
   *
   * Mengosongkan keranjang, lalu pindah ke /order-success. Yang dikirim lewat
   * URL hanya `orderId` (dan tautan WhatsApp): nama, metode bayar, dan total
   * sengaja TIDAK dimasukkan karena halaman sukses mengambilnya dari server —
   * mencegah data dipalsukan lewat URL.
   */
  const finalizeOrder = (id: string) => {
    const methodLabel =
      paymentMethod === "qris"
        ? "QRIS"
        : paymentMethod === "transfer"
          ? "Transfer Bank"
          : "COD (Bayar di Tempat)";

    const itemLines = pricedItems
      .map(
        (item) =>
          `• ${item.name}${item.customizations.length ? ` (${item.customizations.join(", ")})` : ""} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`
      )
      .join("\n");

    const message =
      `🛍️ *PESANAN BARU — Doodaily Art*\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `*ID Pesanan:* ${id}\n\n` +
      `👤 *Data Pembeli*\n` +
      `Nama: ${form.firstName} ${form.lastName}\n` +
      `Email: ${form.email}\n` +
      `No. HP: ${form.phone}\n` +
      `Alamat: ${form.address}, ${form.city}\n` +
      (form.notes ? `Catatan: ${form.notes}\n` : "") +
      `\n🛒 *Detail Pesanan*\n` +
      `${itemLines}\n\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Total (harga keychain): Rp ${total.toLocaleString("id-ID")}\n` +
      `_Ongkir dihitung terpisah — mohon info ongkirnya kak_\n\n` +
      `💳 *Metode Bayar:* ${methodLabel}\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `Mohon konfirmasi pesanan ini ya kak! 🙏`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    clearCart();

    const successParams = new URLSearchParams({ orderId: id });
    if (waUrl) successParams.set("wa", waUrl);

    router.push(`/order-success?${successParams.toString()}`);
  };

  /** Pilih berkas bukti pembayaran (step 3). */
  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) return;

    if (picked.size > 5 * 1024 * 1024) {
      setSubmitError("Ukuran bukti pembayaran maksimal 5 MB.");
      e.target.value = "";
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(picked.type)) {
      setSubmitError("Format bukti harus JPG, PNG, WEBP, atau GIF.");
      e.target.value = "";
      return;
    }

    setSubmitError(null);
    setProofFile(picked);
    setProofPreview(URL.createObjectURL(picked));
  };

  /**
   * STEP 3: unggah bukti pembayaran lalu finalisasi.
   *
   * Bukti diunggah ke `/api/orders/<order_id>/bukti` (server memeriksa bahwa
   * pesanan ini memang milik user yang login). Kalau unggahan gagal, pesanan
   * tetap tersimpan sebagai `pending` dan user bisa mencoba lagi.
   */
  const handleUploadProofAndFinish = async () => {
    if (!orderId) return;

    if (!proofFile) {
      setSubmitError("Pilih gambar bukti pembayaran terlebih dahulu.");
      return;
    }

    setSubmitError(null);
    setProofUploading(true);
    try {
      const body = new FormData();
      body.set("image", proofFile);

      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}/bukti`,
        { method: "POST", body, signal: AbortSignal.timeout(30_000) }
      );
      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setSubmitError(data?.message || "Gagal mengunggah bukti pembayaran.");
        return;
      }

      finalizeOrder(orderId);
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      setSubmitError(
        timedOut
          ? "Unggah terlalu lama. Coba gambar yang lebih kecil."
          : "Tidak dapat menghubungi server. Periksa koneksi Anda."
      );
    } finally {
      setProofUploading(false);
    }
  };

  if (items.length === 0 && !isSubmitting && step !== 3) {
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
          <div
            className={cn(
              "flex-1 h-0.5 mx-3 rounded-full transition-all",
              step >= 3 ? "bg-green-500" : "bg-gray-200"
            )}
          />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                step >= 3
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              3
            </div>
            <span
              className={cn(
                "text-sm font-bold",
                step >= 3 ? "text-green-600" : "text-gray-400"
              )}
            >
              Bukti Bayar
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

              <div>
                <label className="text-sm font-bold text-foreground/70 mb-2 block">
                  Kode QR di Belakang Keychain (Opsional)
                </label>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setQrMode("none")}
                    className={cn(
                      "p-3.5 rounded-xl border-2 text-left transition-all",
                      qrMode === "none"
                        ? "border-brand-blue bg-brand-blue-light/30"
                        : "border-gray-200 hover:border-brand-blue/50"
                    )}
                  >
                    <p className="text-sm font-bold text-foreground">Tanpa QR</p>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      Harga normal (Rp 10.000/item).
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrMode("per_unit")}
                    className={cn(
                      "p-3.5 rounded-xl border-2 text-left transition-all",
                      qrMode === "per_unit"
                        ? "border-brand-blue bg-brand-blue-light/30"
                        : "border-gray-200 hover:border-brand-blue/50"
                    )}
                  >
                    <p className="text-sm font-bold text-foreground">1 QR per Unit</p>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      Tiap keychain punya QR sendiri (Rp 15.000/item).
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrMode("per_order")}
                    className={cn(
                      "p-3.5 rounded-xl border-2 text-left transition-all",
                      qrMode === "per_order"
                        ? "border-brand-blue bg-brand-blue-light/30"
                        : "border-gray-200 hover:border-brand-blue/50"
                    )}
                  >
                    <p className="text-sm font-bold text-foreground">1 QR per Pesanan</p>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      Semua item pakai 1 halaman QR (Rp 15.000/item).
                    </p>
                  </button>
                </div>
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
                {submitError && (
                  <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-red-700 leading-snug">{submitError}</p>
                  </div>
                )}
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
                  {paymentMethod === "cod"
                    ? "Pesanan langsung dibuat, bayar tunai saat barang tiba"
                    : "Lanjut ke unggah bukti pembayaran setelah ini"}
                </p>
                <div className="mt-4">
                  <ChatContextButton kind="cart" className="w-full" variant="ghost" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Bukti Pembayaran (QRIS & Transfer) */}
        <div
          className={cn(
            "bg-white rounded-3xl p-6 md:p-8 border-2 transition-all duration-300",
            step === 3
              ? "border-green-400"
              : "border-gray-100 opacity-40 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-4 mb-6">
            <span
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                step === 3 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
              )}
            >
              3
            </span>
            <h2 className="font-display text-2xl text-foreground">Bukti Pembayaran</h2>
          </div>

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-brand-blue-light/20 border border-brand-blue-light p-4">
                <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-1">
                  ID Pesanan
                </p>
                <p className="font-mono font-bold text-brand-blue break-all">{orderId}</p>
                <p className="text-sm text-foreground/70 font-medium mt-2">
                  Total yang harus dibayar:{" "}
                  <strong className="text-brand-orange text-base">
                    Rp {total.toLocaleString("id-ID")}
                  </strong>
                </p>
                <p className="text-xs text-foreground/50 font-medium mt-1">
                  Harga keychain saja — ongkir menyusul lewat chat admin.
                </p>
              </div>

              {/* Instruksi pembayaran */}
              {paymentMethod === "qris" ? (
                <div className="rounded-2xl border-2 border-brand-orange/30 bg-brand-orange-light/20 p-4">
                  <p className="font-bold text-foreground mb-3">
                    Scan QRIS berikut, lalu unggah bukti bayarnya
                  </p>
                  <div className="flex justify-center bg-white rounded-xl p-3">
                    <Image
                      src="/qris.jpg"
                      alt="Kode QRIS Doodaily Art"
                      width={260}
                      height={260}
                      className="rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-foreground/60 font-medium mt-3 text-center">
                    Nominal: Rp {total.toLocaleString("id-ID")}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4">
                  <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-2">
                    Rekening Tujuan
                  </p>
                  <p className="font-bold text-foreground">BCA — 1234567890</p>
                  <p className="text-sm text-foreground/70 font-medium">a.n. Doodaily Art</p>
                  <p className="text-sm text-foreground/70 font-medium mt-2">
                    Nominal:{" "}
                    <strong className="text-brand-blue">
                      Rp {total.toLocaleString("id-ID")}
                    </strong>
                  </p>
                </div>
              )}

              {/* Unggah bukti */}
              <div>
                <label className="block text-xs font-bold text-foreground/70 mb-2 uppercase tracking-wide">
                  Unggah Bukti Pembayaran <span className="text-red-400">*</span>
                </label>
                <input
                  id="bukti-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleProofChange}
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        (document.getElementById("bukti-input") as HTMLInputElement)?.click()
                      }
                      className="rounded-xl gap-2 h-12"
                    >
                      <Upload className="w-4 h-4" />
                      {proofPreview ? "Ganti Bukti" : "Pilih Bukti"}
                    </Button>
                    <p className="text-xs text-foreground/50 font-medium">
                      JPG, PNG, WEBP, atau GIF · maksimal 5 MB.
                    </p>
                    {proofFile && (
                      <p className="text-xs text-brand-blue font-bold truncate max-w-[200px]">
                        {proofFile.name} · {(proofFile.size / 1024).toFixed(0)} KB
                      </p>
                    )}
                  </div>
                  {proofPreview && (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-green-400 bg-[#FFFBF2] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proofPreview}
                        alt="Pratinjau bukti pembayaran"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-red-700 leading-snug">{submitError}</p>
                </div>
              )}

              <Button
                className="w-full h-16 text-xl rounded-full gap-3 bg-green-500 hover:bg-green-600 shadow-[0_6px_0_0_#166534] hover:shadow-[0_2px_0_0_#166534] hover:translate-y-[4px] transition-all"
                onClick={handleUploadProofAndFinish}
                disabled={proofUploading}
              >
                {proofUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" /> Unggah &amp; Finalisasi
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-foreground/50 font-medium">
                Pesanan sudah tersimpan. Kalau kamu menutup halaman ini, bukti
                pembayaran bisa dikirim nanti lewat chat admin.
              </p>
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
          {pricedItems.map((item) => (
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
            <span>Harga Keychain</span>
            <span className="font-bold text-foreground">
              Rp {subtotal.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ongkir</span>
            <span className="font-bold text-brand-orange">Dihitung terpisah</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-brand-blue-light p-3 mb-6 text-xs text-foreground/70 font-medium leading-relaxed">
          Harga di atas hanya untuk keychain. Ongkir menyesuaikan kota tujuan —
          chat admin untuk info ongkir.
        </div>

        <div className="flex justify-between items-end border-t-2 border-brand-blue-light pt-6">
          <span className="font-bold text-foreground">Total Keychain</span>
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
