"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Truck,
  RefreshCw,
  MessageSquareHeart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  doneOrders: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    doneOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      const orders = data.orders || [];

      const totalRevenue = orders
        .filter((o: any) => o.status !== "cancelled")
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
      const processingOrders = orders.filter((o: any) => o.status === "processing").length;
      const shippedOrders = orders.filter((o: any) => o.status === "shipped").length;
      const doneOrders = orders.filter((o: any) => o.status === "done").length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        processingOrders,
        shippedOrders,
        doneOrders,
        recentOrders: orders.slice(0, 5),
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    done: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    processing: "Diproses",
    shipped: "Dikirim",
    done: "Selesai",
    cancelled: "Dibatalkan",
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[85vh]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-600 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> Doodaily Studio Manager
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-white">
            Halo, {session?.user?.name || "Admin"}! 👋
          </h1>
          <p className="text-white/80 text-sm max-w-xl font-medium">
            Semua ringkasan transaksi pelanggan, omset penjualan, dan antrean custom pengerjaan keychain tercatat di sini.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Button
            variant="ghost"
            onClick={fetchStats}
            className="text-white bg-white/10 hover:bg-white/20 rounded-2xl gap-2 font-bold text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Link href="/admin/orders">
            <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-2xl gap-2 font-bold shadow-lg">
              Kelola Pesanan <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
              Total Omset
            </span>
            <div className="p-2.5 rounded-2xl bg-green-100 text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatRupiah(stats.totalRevenue)}</p>
          <span className="text-[11px] text-foreground/40 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> Transaksi sukses/aktif
          </span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-100 text-brand-blue">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-brand-blue">{stats.totalOrders}</p>
          <span className="text-[11px] text-foreground/40 font-medium mt-1 block">
            Semua riwayat pemesanan
          </span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
              Perlu Dikonfirmasi
            </span>
            <div className="p-2.5 rounded-2xl bg-yellow-100 text-yellow-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          <span className="text-[11px] text-foreground/40 font-medium mt-1 block">
            Menunggu approval admin
          </span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
              Sedang Dibuat
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.processingOrders}</p>
          <span className="text-[11px] text-foreground/40 font-medium mt-1 block">
            Proses workshop / packing
          </span>
        </div>
      </div>

      {/* Workflow Status Tracker */}
      <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 mb-8 shadow-sm">
        <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider text-foreground/60">
          Status Alur Pesanan Toko
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-bold text-yellow-800">Menunggu</span>
            </div>
            <p className="text-xl font-bold text-yellow-900">{stats.pendingOrders}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-800">Diproses</span>
            </div>
            <p className="text-xl font-bold text-purple-900">{stats.processingOrders}</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-800">Dikirim</span>
            </div>
            <p className="text-xl font-bold text-indigo-900">{stats.shippedOrders}</p>
          </div>
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-800">Selesai</span>
            </div>
            <p className="text-xl font-bold text-green-900">{stats.doneOrders}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border-2 border-brand-blue-light p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-brand-blue">Pesanan Paling Baru</h2>
            <p className="text-xs text-foreground/50">5 pesanan terakhir yang masuk ke sistem</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
            Lihat Semua Pesanan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-foreground/40 text-center py-10 font-medium text-sm">
            Belum ada pesanan masuk.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-foreground/50 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-3 font-bold">Order ID</th>
                  <th className="text-left py-3 px-3 font-bold">Pelanggan</th>
                  <th className="text-left py-3 px-3 font-bold">Metode</th>
                  <th className="text-left py-3 px-3 font-bold">Total</th>
                  <th className="text-left py-3 px-3 font-bold">Status</th>
                  <th className="text-left py-3 px-3 font-bold">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.order_id} className="border-b border-gray-50 hover:bg-[#FFFBF2]/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs font-bold text-foreground/70">
                      {order.order_id}
                    </td>
                    <td className="py-3 px-3 font-bold text-foreground">
                      {order.customer_name}
                      <span className="block text-[11px] font-normal text-foreground/50">{order.phone}</span>
                    </td>
                    <td className="py-3 px-3 text-xs font-medium uppercase text-foreground/70">
                      {order.payment_method}
                    </td>
                    <td className="py-3 px-3 font-bold text-brand-blue">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[order.status] || ""}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-foreground/50">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
