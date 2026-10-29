"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  MessageCircle,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Sparkles,
  Camera,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "done", "cancelled"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  processing: "bg-purple-100 text-purple-800 border-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
  done: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  done: "Selesai",
  cancelled: "Dibatalkan",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [editProof, setEditProof] = useState<Record<string, { image: string; notes: string }>>({});
  const [savingProof, setSavingProof] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      const list = data.orders || [];
      setOrders(list);

      // Inisialisasi state upload proof
      const initialProof: Record<string, { image: string; notes: string }> = {};
      list.forEach((o: any) => {
        initialProof[o.order_id] = {
          image: o.result_image || "",
          notes: o.admin_notes || "",
        };
      });
      setEditProof(initialProof);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveProof = async (orderId: string) => {
    setSavingProof(orderId);
    const proof = editProof[orderId] || { image: "", notes: "" };
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          result_image: proof.image,
          admin_notes: proof.notes,
        }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === orderId
              ? { ...o, result_image: proof.image, admin_notes: proof.notes }
              : o
          )
        );
        alert("Foto hasil custom berhasil dikirim ke halaman user! ✨");
      } else {
        alert("Gagal menyimpan hasil preview");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setSavingProof(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm(`Yakin ingin menghapus pesanan ${orderId}?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
      } else {
        alert("Gagal menghapus pesanan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const getCleanPhone = (phone: string) => {
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) clean = "62" + clean.substring(1);
    if (!clean.startsWith("62")) clean = "62" + clean;
    return clean;
  };

  const createWhatsAppLink = (order: any) => {
    const phone = getCleanPhone(order.phone);
    const msg = `Halo kak ${order.customer_name}! 👋\nKami dari Doodaily Art ingin mengonfirmasi pesanan Anda dengan ID: *${order.order_id}*.\n\nStatus saat ini: *${statusLabels[order.status] || order.status}*\nTotal: *${formatRupiah(order.total)}*\n\nFoto hasil pengerjaan custom juga sudah kami upload di halaman akun web kakak ya! ✨ Terimakasih! 🙏`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const filteredOrders = orders.filter((o) => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      (o.notes && o.notes.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[85vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-3xl text-brand-blue">
              Kelola Pesanan & Workshop 📦
            </h1>
            <p className="text-foreground/60 text-sm font-medium">
              Lihat pesanan, upload foto hasil custom ke pembeli, dan kelola status.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchOrders} className="gap-2 rounded-xl text-sm font-bold">
            <RefreshCw className="w-4 h-4" /> Segarkan
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 md:p-6 border-2 border-brand-blue-light shadow-sm mb-6 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pembeli, Order ID, no. HP, atau catatan khusus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none text-sm font-medium transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-foreground/50 mr-1">Status:</span>
          {["all", ...STATUSES].map((s) => {
            const count = s === "all" ? orders.length : orders.filter((o) => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filter === s
                    ? "bg-brand-blue text-white shadow"
                    : "bg-gray-100 text-foreground/70 hover:bg-gray-200"
                }`}
              >
                <span>{s === "all" ? "Semua" : statusLabels[s] || s}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filter === s ? "bg-white/30 text-white" : "bg-gray-200 text-gray-700"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center text-foreground/50">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-lg font-bold text-foreground/70">Tidak ada pesanan ditemukan</p>
          <p className="text-sm">Coba ganti filter status atau kata kunci pencarian kamu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            let items: any[] = [];
            try {
              items = JSON.parse(order.items_json);
            } catch {}

            const isExpanded = expandedOrders[order.order_id] ?? true;
            const currentProof = editProof[order.order_id] || {
              image: order.result_image || "",
              notes: order.admin_notes || "",
            };

            return (
              <div
                key={order.order_id}
                className="bg-white rounded-3xl border-2 border-brand-blue-light/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header Card */}
                <div className="p-5 md:p-6 bg-gradient-to-r from-white via-white to-[#FFFBF2] border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-gray-100 px-2.5 py-1 rounded-lg text-foreground/70">
                        {order.order_id}
                      </span>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                        ● {statusLabels[order.status] || order.status}
                      </span>
                      {order.result_image && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Foto Terkirim
                        </span>
                      )}
                      <span className="text-xs text-foreground/40 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground">
                      {order.customer_name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60 font-medium">
                      <span>✉️ {order.email}</span>
                      <span>📞 {order.phone}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                        {order.address}, {order.city}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                    <div className="text-left md:text-right">
                      <p className="text-2xl font-bold text-brand-blue leading-none">
                        {formatRupiah(order.total)}
                      </p>
                      <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1 mt-1">
                        <CreditCard className="w-3 h-3" /> {order.payment_method}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={createWhatsAppLink(order)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-105"
                      >
                        <MessageCircle className="w-4 h-4" /> WA Pembeli
                      </a>
                      <button
                        onClick={() => handleDelete(order.order_id)}
                        title="Hapus Pesanan"
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleExpand(order.order_id)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-foreground hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="p-5 md:p-6 space-y-4 bg-white">
                    {/* Buyer Notes */}
                    {order.notes && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900">
                        <span className="font-bold block mb-0.5">Catatan Pengiriman / Pembeli:</span>
                        <p>{order.notes}</p>
                      </div>
                    )}

                    {/* Ordered Items & Custom Keychain Instructions */}
                    <div>
                      <h4 className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-2.5">
                        Daftar Produk Pesanan ({items.length} item)
                      </h4>
                      <div className="space-y-3">
                        {items.map((item: any, idx: number) => {
                          const hasCustom = item.customizations && item.customizations.length > 0;
                          return (
                            <div
                              key={idx}
                              className="bg-[#FFFBF2] border border-brand-blue-light/60 rounded-2xl p-4 flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-foreground flex items-center gap-2">
                                  <Package className="w-4 h-4 text-brand-blue" />
                                  {item.name}
                                  <span className="text-brand-orange font-bold text-xs bg-brand-orange-light/50 px-2 py-0.5 rounded-full">
                                    x{item.quantity}
                                  </span>
                                </span>
                                <span className="font-bold text-brand-blue">
                                  {formatRupiah((item.price || 0) * (item.quantity || 1))}
                                </span>
                              </div>

                              {/* Customization Details & Admin Instructions */}
                              {hasCustom && (
                                <div className="mt-1 pt-2 border-t border-amber-100 flex flex-col gap-1.5">
                                  <span className="text-[11px] font-bold text-brand-orange flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Detail Custom & Instruksi Khusus:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.customizations.map((c: string, cIdx: number) => {
                                      const isInstruction = c.toLowerCase().includes("instruksi khusus");
                                      const isLink = c.toLowerCase().includes("link referensi");
                                      return (
                                        <div
                                          key={cIdx}
                                          className={`text-xs px-3 py-1.5 rounded-xl font-medium ${
                                            isInstruction
                                              ? "bg-amber-100 text-amber-900 font-bold border border-amber-300 w-full"
                                              : isLink
                                              ? "bg-blue-100 text-blue-900 font-bold border border-blue-300 w-full"
                                              : "bg-white text-foreground/80 border border-gray-200"
                                          }`}
                                        >
                                          {isLink ? (
                                            <div className="flex items-center justify-between gap-2">
                                              <span>{c}</span>
                                              <a
                                                href={c.replace("Link Referensi/Foto: ", "").trim()}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                                              >
                                                Buka Link <ExternalLink className="w-3 h-3" />
                                              </a>
                                            </div>
                                          ) : (
                                            c
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* FITUR BARU: UPLOAD FOTO HASIL CUSTOM UNTUK USER */}
                    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-4 border-2 border-dashed border-brand-blue/30 space-y-3">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-brand-blue" />
                        <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                          Kirim Bukti / Foto Hasil Jadi Keychain ke Pembeli:
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                        <div className="space-y-2">
                          <input
                            type="url"
                            placeholder="URL Foto Hasil Jadi (misal: /catalog/study-work-keychain.jpg atau link gambar)"
                            value={currentProof.image}
                            onChange={(e) =>
                              setEditProof((prev) => ({
                                ...prev,
                                [order.order_id]: {
                                  ...currentProof,
                                  image: e.target.value,
                                },
                              }))
                            }
                            className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-xs bg-white font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Pesan singkat dari admin (contoh: 'Sudah selesai kak, siap dikirim sore ini! ✨')"
                            value={currentProof.notes}
                            onChange={(e) =>
                              setEditProof((prev) => ({
                                ...prev,
                                [order.order_id]: {
                                  ...currentProof,
                                  notes: e.target.value,
                                },
                              }))
                            }
                            className="w-full h-10 px-3.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:outline-none text-xs bg-white font-medium"
                          />
                          <Button
                            size="sm"
                            disabled={savingProof === order.order_id}
                            onClick={() => handleSaveProof(order.order_id)}
                            className="text-xs rounded-xl h-9 px-4 font-bold gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            {savingProof === order.order_id ? "Menyimpan..." : "Simpan & Tampilkan ke User"}
                          </Button>
                        </div>

                        {/* Preview Gambar Jika Ada */}
                        {currentProof.image ? (
                          <div className="relative h-28 w-full md:w-48 rounded-xl overflow-hidden border-2 border-brand-blue/20 bg-white flex items-center justify-center">
                            <img
                              src={currentProof.image}
                              alt="Preview Hasil Custom"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src = "/catalog/study-work-keychain.jpg";
                              }}
                            />
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                              Preview
                            </span>
                          </div>
                        ) : (
                          <div className="h-24 w-full md:w-48 rounded-xl border border-dashed border-gray-300 bg-white/50 flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                            <ImageIcon className="w-5 h-5 opacity-40" />
                            <span>Belum ada foto</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Update Status Bar */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs font-bold text-foreground/60">
                        Ubah Status Pengerjaan:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            disabled={updating === order.order_id}
                            onClick={() => updateStatus(order.order_id, s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              order.status === s
                                ? `${statusColors[s]} shadow-sm scale-105`
                                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {statusLabels[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
