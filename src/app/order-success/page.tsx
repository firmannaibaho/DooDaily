"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ChatContextButton } from "@/components/chat/ChatContextButton";
import {
  CheckCircle,
  Package,
  MessageCircle,
  Home,
  Copy,
} from "lucide-react";

/** Bentuk data pesanan yang dikembalikan GET /api/orders/[order_id]. */
interface LoadedOrder {
  order_id: string;
  customer_name: string;
  payment_method: string;
  total: number;
}

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "";
  const waLink = params.get("wa") || "";

  /**
   * Data pesanan diambil dari server, bukan dari query string.
   *
   * KENAPA: sebelumnya `name`, `method`, dan `total` dibaca dari URL sehingga
   * siapa pun bisa membuka `/order-success?orderId=DDL-XXXX&name=Budi&total=1`
   * dan melihat halaman "Pesanan Masuk!" palsu. Sekarang server yang menentukan
   * kebenarannya, dan endpoint hanya mengembalikan pesanan milik user tersebut.
   */
  const [order, setOrder] = useState<LoadedOrder | null>(null);
  // Tanpa orderId tidak ada yang perlu dimuat: status awal langsung final,
  // sehingga effect tidak perlu memanggil setState secara sinkron.
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState<string | null>(
    orderId ? null : "ID pesanan tidak ditemukan."
  );

  useEffect(() => {
    document.title = "Pesanan Berhasil! | Doodaily Art";
  }, []);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          signal: controller.signal,
        });
        const data = (await res.json().catch(() => null)) as
          | { order?: LoadedOrder; message?: string }
          | null;

        if (cancelled) return;

        if (!res.ok || !data?.order) {
          setError(data?.message || "Pesanan tidak dapat dimuat.");
        } else {
          setOrder(data.order);
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") return;
        setError("Tidak dapat menghubungi server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [orderId]);

  const name = order?.customer_name || "Pelanggan";
  const method = order?.payment_method || "qris";
  const total = order?.total ?? 0;

  const copyOrderId = () => {
    if (orderId) navigator.clipboard.writeText(orderId);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-blue border-t-transparent mx-auto mb-4" />
          <p className="text-foreground/50 font-medium">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  /**
   * Tanpa pesanan yang sah, jangan tampilkan halaman sukses sama sekali.
   * Ini menutup celah /order-success yang bisa dibuka langsung dari URL.
   */
  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl text-brand-blue mb-3">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-foreground/70 font-medium mb-8 leading-relaxed">
            {error ?? "Pesanan tidak dapat dimuat."} Pastikan kamu sudah login
            dengan akun yang dipakai saat memesan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/my-orders" className="flex-1">
              <Button size="lg" className="w-full h-14 text-lg rounded-full gap-3">
                <Package className="w-5 h-5" />
                Lihat Pesanan Saya
              </Button>
            </Link>
            <Link href="/shop" className="flex-1">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 text-lg rounded-full gap-3 border-2 border-brand-blue-light hover:border-brand-blue"
              >
                <Home className="w-5 h-5" />
                Ke Toko
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
            <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={1.5} />
          </div>
          <span className="absolute -top-2 -right-2 text-3xl animate-spin-slow">🎉</span>
          <span className="absolute -bottom-2 -left-2 text-2xl">✨</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl text-brand-blue mb-3">
          Pesanan Masuk!
        </h1>
        <p className="text-foreground/70 font-medium text-lg mb-2">
          Haii <span className="font-bold text-foreground">{name}</span>! Pesananmu udah kami terima 🥳
        </p>
        <p className="text-foreground/60 text-sm font-medium mb-8">
          Cek WhatsApp kamu ya untuk konfirmasi lebih lanjut
        </p>

        {/* Order ID */}
        <div className="bg-[#FFFBF2] rounded-3xl p-6 border-2 border-brand-orange border-dashed mb-6 text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
              ID Pesanan
            </span>
            <button
              onClick={copyOrderId}
              className="text-brand-blue hover:text-brand-blue/70 transition-colors"
              title="Salin ID Pesanan"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="font-display text-2xl text-brand-blue mb-4">{orderId}</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between font-medium">
              <span className="text-foreground/60">Metode Pembayaran</span>
              <span className="font-bold text-foreground uppercase">
                {method === "qris" ? "QRIS" : method === "transfer" ? "Transfer Bank" : method === "cod" ? "COD" : method}
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-foreground/60">Total Pembayaran</span>
              <span className="font-bold text-brand-orange text-base">
                Rp {Number(total).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {method === "qris" && (
          <div className="bg-white rounded-3xl p-6 border-2 border-brand-blue-light mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📱</span>
              <h3 className="font-bold text-foreground">Cara Bayar via QRIS</h3>
            </div>
            <ol className="space-y-2 text-sm text-foreground/70 font-medium">
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-brand-orange text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                Buka aplikasi e-wallet atau m-banking kamu
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-brand-orange text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                Pilih menu Scan / QRIS
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-brand-orange text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                Scan QR Code yang akan dikirim via WhatsApp
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-brand-orange text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                Bayar sebesar{" "}
                <strong className="text-foreground">
                  Rp {Number(total).toLocaleString("id-ID")}
                </strong>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-brand-orange text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</span>
                Kirim bukti pembayaran ke WhatsApp kami
              </li>
            </ol>
          </div>
        )}

        {method === "transfer" && (
          <div className="bg-white rounded-3xl p-6 border-2 border-brand-blue-light mb-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🏦</span>
              <h3 className="font-bold text-foreground">Info Transfer Bank</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-brand-blue-light/30 rounded-2xl p-4">
                <p className="text-xs font-bold text-foreground/50 mb-1">BCA</p>
                <p className="font-display text-xl text-brand-blue">1234567890</p>
                <p className="text-sm font-bold text-foreground">a.n. Doodaily Art</p>
              </div>
              <p className="text-sm text-foreground/60 font-medium">
                Transfer tepat sebesar{" "}
                <strong className="text-foreground">
                  Rp {Number(total).toLocaleString("id-ID")}
                </strong>{" "}
                dan kirim bukti transfer ke WhatsApp kami.
              </p>
            </div>
          </div>
        )}

        {method === "cod" && (
          <div className="bg-white rounded-3xl p-6 border-2 border-brand-blue-light mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🚪</span>
              <h3 className="font-bold text-foreground">COD — Bayar di Tempat</h3>
            </div>
            <p className="text-sm text-foreground/70 font-medium">
              Siapkan uang tunai sebesar{" "}
              <strong className="text-foreground">
                Rp {Number(total).toLocaleString("id-ID")}
              </strong>{" "}
              saat kurir tiba. Kami akan konfirmasi jadwal pengiriman via WhatsApp.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-3xl p-6 border-2 border-brand-blue-light mb-8 text-left">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-blue" />
            Status Pesanan
          </h3>
          <div className="space-y-3">
            {[
              { label: "Pesanan Diterima", done: true, emoji: "✅" },
              { label: "Menunggu Konfirmasi Pembayaran", done: false, emoji: "⏳" },
              { label: "Diproses & Dikemas", done: false, emoji: "📦" },
              { label: "Dikirim", done: false, emoji: "🚚" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{s.emoji}</span>
                <span
                  className={`text-sm font-medium ${
                    s.done ? "text-green-600 font-bold" : "text-foreground/50"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button
                size="lg"
                className="w-full h-14 text-lg rounded-full gap-3 bg-green-500 hover:bg-green-600 shadow-[0_6px_0_0_#166534] hover:shadow-[0_2px_0_0_#166534] hover:translate-y-1 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Chat WhatsApp
              </Button>
            </a>
          )}
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg rounded-full gap-3 border-2 border-brand-blue-light hover:border-brand-blue"
            >
              <Home className="w-5 h-5" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        {/* Chat langsung ke admin soal pesanan ini */}
        <div className="mt-4 flex justify-center">
          <ChatContextButton
            kind="order"
            orderId={orderId}
            label="Chat Admin soal pesanan ini"
            className="h-12 px-6"
          />
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><p className="text-foreground/50 font-medium">Memuat...</p></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
