"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareHeart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminOrderChatButtonProps {
  orderId: string;
  /** Pesanan tanpa akun tidak punya chat in-app. */
  hasUser: boolean;
  className?: string;
}

/**
 * Tombol "Chat" pada halaman pesanan admin.
 *
 * Alurnya: minta server membuka/membuat thread pesanan, lalu langsung buka
 * halaman chat dengan thread tersebut. Sebelumnya tombol hanya menuju
 * /admin/chat sehingga percakapan yang belum pernah ada tidak terbuka sama
 * sekali.
 */
export function AdminOrderChatButton({
  orderId,
  hasUser,
  className,
}: AdminOrderChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    if (!hasUser) {
      setError("Pesanan tanpa akun — hubungi pembeli lewat WhatsApp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/chat/admin/order-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = (await res.json().catch(() => null)) as
        | { thread_id?: number; message?: string }
        | null;

      if (!res.ok || !data?.thread_id) {
        setError(data?.message || "Gagal membuka percakapan.");
        return;
      }

      router.push(`/admin/chat?thread=${data.thread_id}`);
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button onClick={handleClick} disabled={loading} className="rounded-full gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MessageSquareHeart className="w-4 h-4" />
        )}
        {loading ? "Membuka chat..." : "Chat Pembeli soal Pesanan Ini"}
      </Button>
      {error && <p className="text-xs font-bold text-red-600 mt-2">{error}</p>}
    </div>
  );
}
