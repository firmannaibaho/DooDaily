"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Quote, MessageSquareHeart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Testimonial {
  id: number;
  customer_name: string;
  product_name: string;
  message: string;
  image_url: string;
  created_at: string;
}

export default function TestimoniPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/testimonials");
        const data = (await res.json().catch(() => null)) as
          | { testimonials?: Testimonial[]; message?: string }
          | null;

        if (cancelled) return;
        if (!res.ok) {
          setError(data?.message || "Gagal memuat testimoni.");
        } else {
          setItems(data?.testimonials ?? []);
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
  }, []);

  const total = items.length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[70vh]">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand-blue-light/60 text-brand-blue px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <MessageSquareHeart className="w-4 h-4" />
          Testimoni
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-brand-blue mb-3">
          Kata Mereka Tentang Doodaily
        </h1>
        <p className="text-foreground/70 font-medium max-w-xl mx-auto">
          Cerita dan foto dari pembeli yang sudah menerima keychain & sticker
          buatan tangan kami.
        </p>
      </div>

      {/* Konten */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
          <p className="text-foreground/50 font-medium">Memuat testimoni...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-foreground/70 font-medium mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="rounded-full">
            Coba Lagi
          </Button>
        </div>
      ) : total === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-brand-blue-light">
          <div className="w-20 h-20 rounded-full bg-brand-blue-light/50 flex items-center justify-center mx-auto mb-5">
            <MessageSquareHeart className="w-10 h-10 text-brand-blue" />
          </div>
          <h2 className="font-display text-2xl text-brand-blue mb-2">
            Belum ada testimoni
          </h2>
          <p className="text-foreground/60 font-medium mb-6">
            Testimoni dari pembeli akan tampil di sini.
          </p>
          <Link href="/shop">
            <Button className="rounded-full">Lihat Produk</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <article
              key={t.id}
              className="bg-white rounded-3xl border-2 border-brand-blue-light shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
            >
              {t.image_url && (
                <div className="relative w-full aspect-[4/3] bg-[#FFFBF2] overflow-hidden">
                  <Image
                    src={t.image_url}
                    alt={`Foto testimoni dari ${t.customer_name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <Quote className="w-7 h-7 text-brand-orange/40 mb-2" />

                {t.message && (
                  <p className="text-foreground/80 font-medium leading-relaxed mb-5 flex-1 whitespace-pre-line">
                    {t.message}
                  </p>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <p className="font-bold text-foreground text-sm">
                    {t.customer_name}
                  </p>
                  <p className="text-xs text-foreground/50 font-medium">
                    {t.product_name || "Pembeli Doodaily"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 text-center bg-white rounded-3xl border-2 border-brand-blue-light p-10">
        <h2 className="font-display text-2xl md:text-3xl text-brand-blue mb-3">
          Sudah pesan? Bagikan pengalamanmu
        </h2>
        <p className="text-foreground/60 font-medium mb-6">
          Kirim foto & ceritamu lewat chat, nanti admin menampilkannya di sini.
        </p>
        <Link href="/chat">
          <Button size="lg" className="rounded-full gap-2">
            <MessageSquareHeart className="w-5 h-5" />
            Chat Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
