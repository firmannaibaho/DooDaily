"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ArrowLeft, Sparkles, Camera, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Sedang Diproses Studio",
  shipped: "Dalam Pengiriman",
  done: "Pesanan Selesai",
  cancelled: "Dibatalkan",
};

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[80vh]">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl text-brand-blue">
            Pesanan Saya 📋
          </h1>
          <p className="text-foreground/60 font-medium text-sm">
            Pantau status pengerjaan dan lihat foto hasil custom keychain kamu langsung dari admin.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <p className="text-lg font-bold text-foreground/50 mb-2">
            Belum ada pesanan
          </p>
          <p className="text-foreground/40 mb-6">
            Yuk mulai belanja atau buat custom keychain kamu!
          </p>
          <Link href="/shop">
            <Button>Ke Toko</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            let items: any[] = [];
            try {
              items = JSON.parse(order.items_json);
            } catch {}

            return (
              <div
                key={order.order_id}
                className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                  <div>
                    <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded-lg text-foreground/70">
                      {order.order_id}
                    </span>
                    <p className="text-xs text-foreground/50 mt-1.5">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        statusColors[order.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      ● {statusLabels[order.status] || order.status}
                    </span>
                    <p className="text-xl font-bold text-brand-blue">
                      {formatRupiah(order.total)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                {items.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-2 mb-4">
                    {items.map((item: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1 border-b border-gray-200/50 pb-2 last:border-none last:pb-0">
                        <div className="flex justify-between font-bold">
                          <span>
                            {item.name} <span className="text-brand-orange text-xs">x{item.quantity}</span>
                          </span>
                          <span className="text-brand-blue">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.customizations.map((c: string, cIdx: number) => (
                              <span
                                key={cIdx}
                                className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-foreground/70"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* FOTO HASIL JADI DARI ADMIN (JIKA SUDAH DIUPLOAD) */}
                {order.result_image && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-brand-orange/30 flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:w-36 h-36 rounded-xl overflow-hidden relative border-2 border-white shadow-sm shrink-0 bg-white">
                      <img
                        src={order.result_image}
                        alt="Hasil Jadi Keychain Kamu"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = "/catalog/study-work-keychain.jpg";
                        }}
                      />
                    </div>
                    <div className="space-y-1.5 text-center md:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-orange text-white text-[11px] font-bold">
                        <Sparkles className="w-3.5 h-3.5" /> Hasil Jadi dari Admin
                      </div>
                      <h4 className="font-bold text-foreground text-sm">
                        Keychain kamu sudah selesai dibuat! ✨
                      </h4>
                      {order.admin_notes && (
                        <p className="text-xs text-foreground/70 italic bg-white/70 p-2.5 rounded-xl border border-brand-orange/20">
                          &ldquo;{order.admin_notes}&rdquo;
                        </p>
                      )}
                      <p className="text-[11px] text-foreground/50">
                        Foto di atas adalah hasil fisik asli yang dibuatkan oleh tim Doodaily sebelum dikirimkan ke alamatmu.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center text-xs text-foreground/40 pt-2 border-t border-gray-100">
                  <span>Metode: {order.payment_method}</span>
                  <span>Tujuan: {order.city}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
