"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
  Camera,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminOrderChatButton } from "@/components/chat/AdminOrderChatButton";
import { KeychainQrPanel } from "@/components/keychain/KeychainQrPanel";

interface OrderItem {
  productId?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customizations?: string[];
}

interface Order {
  id: number;
  order_id: string;
  user_id: number | null;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment_method: string;
  items_json: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_proof?: string;
  result_image?: string;
  admin_notes?: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  done: "Selesai",
  cancelled: "Dibatalkan",
};

/** URL gambar bukti bayar — mendukung path Storage maupun data lama. */
function proofUrl(value?: string): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("/")) {
    return value;
  }
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const bucket = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "uploads";
  const path = value.includes("/") ? value : `bukti/${value.split("/").pop()}`;
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : `/uploads/${path}`;
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = decodeURIComponent(String(params?.orderId ?? ""));

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.order) {
          setError(data?.message || "Pesanan tidak dapat dimuat.");
        } else {
          setOrder(data.order);
        }
      } catch {
        if (!cancelled) setError("Tidak dapat menghubungi server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${order.order_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.order_id, status: newStatus }),
      });
      if (res.ok) setOrder({ ...order, status: newStatus });
    } finally {
      setSaving(false);
    }
  };

  const rupiah = (n: number) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="font-bold text-foreground/70 mb-6">{error ?? "Pesanan tidak ditemukan."}</p>
        <Link href="/admin/orders">
          <Button variant="outline" className="rounded-full gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan
          </Button>
        </Link>
      </div>
    );
  }

  let items: OrderItem[] = [];
  try {
    items = JSON.parse(order.items_json || "[]");
  } catch {
    items = [];
  }

  const bukti = proofUrl(order.payment_proof);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Semua Pesanan
      </Link>

      {/* Ringkasan & alamat */}
      <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 md:p-8 shadow-sm mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">
              Detail Pesanan
            </p>
            <h1 className="font-mono font-bold text-xl text-brand-blue break-all">
              {order.order_id}
            </h1>
            <p className="text-xs text-foreground/50 font-medium mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(order.created_at).toLocaleString("id-ID")}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-brand-blue-light text-brand-blue">
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#FFFBF2] border border-brand-blue-light p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Alamat Pengiriman
            </p>
            <p className="font-bold text-sm text-foreground">{order.customer_name}</p>
            <p className="text-sm text-foreground/70 font-medium leading-snug">
              {order.address}
              {order.city ? `, ${order.city}` : ""}
            </p>
            <p className="text-sm text-foreground/70 font-medium mt-2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> {order.phone}
            </p>
            <p className="text-sm text-foreground/70 font-medium flex items-center gap-1.5 break-all">
              <Mail className="w-3.5 h-3.5" /> {order.email}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFFBF2] border border-brand-blue-light p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-blue mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Pembayaran
            </p>
            <p className="text-sm font-bold text-foreground uppercase">{order.payment_method}</p>
            <div className="mt-2 space-y-1 text-sm font-medium text-foreground/70">
              <div className="flex justify-between">
                <span>Harga Keychain</span>
                <span>{rupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir</span>
                <span className="text-brand-orange">Terpisah</span>
              </div>
              <div className="flex justify-between font-bold text-foreground pt-1 border-t border-brand-blue-light">
                <span>Total</span>
                <span>{rupiah(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
              Catatan Pembeli
            </p>
            <p className="text-sm font-medium text-amber-900 leading-relaxed">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Bukti Pembayaran */}
      <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 md:p-8 shadow-sm mb-6">
        <h2 className="font-bold text-lg text-brand-blue mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" /> Bukti Pembayaran
        </h2>
        {bukti ? (
          <a href={bukti} target="_blank" rel="noopener noreferrer" className="inline-block group">
            <div className="rounded-2xl overflow-hidden border-2 border-brand-blue-light bg-[#FFFBF2] max-w-xs group-hover:border-brand-blue transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bukti}
                alt={`Bukti pembayaran ${order.order_id}`}
                className="w-full max-h-80 object-contain"
              />
            </div>
            <p className="text-xs font-bold text-brand-blue underline mt-2">
              Buka bukti ukuran penuh
            </p>
          </a>
        ) : (
          <p className="text-sm font-medium text-foreground/50 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
            Belum ada bukti pembayaran yang diunggah pembeli.
          </p>
        )}
      </div>

      {/* Item Pesanan */}
      <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 md:p-8 shadow-sm mb-6">
        <h2 className="font-bold text-lg text-brand-blue mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" /> Item Pesanan ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-sm font-medium text-foreground/50">Tidak ada item.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item, i) => (
              <li key={i} className="py-3 flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">
                    {item.name}{" "}
                    <span className="text-brand-orange text-xs">×{item.quantity}</span>
                  </p>
                  {item.customizations && item.customizations.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {item.customizations.map((c, ci) => (
                        <li
                          key={ci}
                          className="text-xs text-foreground/60 font-medium break-words"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="text-sm font-bold text-brand-blue shrink-0">
                  {rupiah(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Kode QR Keychain untuk dicetak */}
      <KeychainQrPanel orderId={order.order_id} mode="admin" />

      {/* Aksi */}
      <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 md:p-8 shadow-sm">
        <h2 className="font-bold text-lg text-brand-blue mb-4">Aksi</h2>

        {order.user_id ? (
          <AdminOrderChatButton orderId={order.order_id} hasUser className="mb-4" />
        ) : (
          <p className="text-xs font-medium text-foreground/50 mb-4 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Pesanan ini dibuat tanpa akun, jadi tidak ada chat in-app. Hubungi lewat WhatsApp.
          </p>
        )}

        <p className="text-xs font-bold text-foreground/60 mb-2">Ubah Status:</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(STATUS_LABELS).map((s) => (
            <button
              key={s}
              disabled={saving}
              onClick={() => updateStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                order.status === s
                  ? "bg-brand-blue text-white border-brand-blue"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {order.status !== "done" && (
          <p className="text-xs text-foreground/40 font-medium mt-3 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Tandai &quot;Selesai&quot; setelah pembeli
            menerima barang.
          </p>
        )}

        <div className="mt-4">
          <Link
            href="/admin/orders"
            className="text-sm font-bold text-brand-blue hover:underline inline-flex items-center gap-1"
          >
            Kembali ke daftar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
