"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Sparkle } from "@/components/stickers/Decorations";
import {
  ShoppingBag,
  Loader2,
  AlertCircle,
  CheckCircle,
  MessageSquareHeart,
  Camera,
  Upload,
  X,
  Link2,
  Info,
  Package,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

/** Produk custom yang dipakai saat menambah ke keranjang. */
const CUSTOM_PRODUCT_ID = 9001;
const CUSTOM_PRICE = 10000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const QUICK_TIPS = [
  "Nuansa pastel aesthetic",
  "Tema glitter & sparkling",
  "Warna gradasi lembut",
  "Pakai font huruf sambung lucu",
  "Tema monokrom minimalis",
  "Tambahkan gantungan lonceng kecil",
];

export default function CustomizePage() {
  const router = useRouter();
  const { addItem } = useCart();

  const [instructions, setInstructions] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");

  const clearImage = () => {
    setFile(null);
    setPreview("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) return;

    if (picked.size > MAX_IMAGE_BYTES) {
      setError("Ukuran gambar maksimal 5 MB.");
      e.target.value = "";
      return;
    }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(picked.type)) {
      setError("Format gambar harus JPG, PNG, WEBP, atau GIF.");
      e.target.value = "";
      return;
    }

    setError(null);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const handleAddPreset = (tip: string) => {
    setInstructions((prev) => {
      if (!prev.trim()) return tip;
      if (prev.includes(tip)) return prev;
      return `${prev}, ${tip}`;
    });
  };

  /**
   * Simpan request custom sebagai item keranjang.
   *
   * Gambar referensi diunggah lebih dulu ke `/api/uploads/referensi` supaya
   * keranjang hanya menyimpan URL pendek (aman untuk localStorage), bukan
   * seluruh isi berkas.
   */
  const handleAddToCart = async () => {
    setError(null);

    if (!instructions.trim()) {
      setError("Tulis dulu instruksi untuk admin.");
      return;
    }
    if (!file && !referenceLink.trim()) {
      setError("Lampirkan gambar referensi (unggah gambar atau tempel link).");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = "";

      if (file) {
        const body = new FormData();
        body.set("image", file);
        const response = await fetch("/api/uploads/referensi", {
          method: "POST",
          body,
          signal: AbortSignal.timeout(30_000),
        });
        const data = (await response.json().catch(() => null)) as
          | { url?: string; message?: string }
          | null;

        if (!response.ok || !data?.url) {
          setError(data?.message || "Gagal mengunggah gambar referensi.");
          return;
        }
        imageUrl = data.url;
      }

      const customizations = [`Instruksi: ${instructions.trim()}`];
      if (imageUrl) customizations.push(`Gambar referensi: ${imageUrl}`);
      if (referenceLink.trim()) customizations.push(`Link referensi: ${referenceLink.trim()}`);
      if (name.trim()) customizations.push(`Nama/Inisial: ${name.trim()}`);

      addItem({
        productId: CUSTOM_PRODUCT_ID,
        name: "Custom Keychain (Request)",
        price: CUSTOM_PRICE,
        image: imageUrl || "/logo.jpg",
        customizations,
      });

      setDone(true);
    } catch (err) {
      const timedOut = err instanceof Error && err.name === "TimeoutError";
      setError(
        timedOut
          ? "Unggah terlalu lama. Coba gambar yang lebih kecil."
          : "Tidak dapat menghubungi server. Periksa koneksi Anda."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-5 py-4 rounded-2xl border-2 border-brand-blue-light focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/20 font-medium transition-all bg-white";

  if (done) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-full bg-white rounded-[2.5rem] border-4 border-brand-blue-light p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)]">
          <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl text-brand-blue mb-3">
            Request Masuk Keranjang!
          </h1>
          <p className="text-foreground/70 font-medium mb-6 leading-relaxed">
            Admin akan meninjau instruksi &amp; gambar referensimu. Selesaikan
            checkout untuk mengirim request.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push("/checkout")}
              className="flex-1 h-14 rounded-full gap-2"
            >
              <ShoppingBag className="w-5 h-5" /> Ke Checkout
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/cart")}
              className="flex-1 h-14 rounded-full"
            >
              Lihat Keranjang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-10 relative">
        <FloatingElement className="-top-8 left-1/4 hidden md:block">
          <Sparkle className="text-brand-orange w-10 h-10" />
        </FloatingElement>
        <FloatingElement className="-top-6 right-1/4 hidden md:block">
          <Sparkle className="text-brand-blue w-8 h-8" />
        </FloatingElement>

        <div className="inline-flex items-center gap-2 bg-brand-blue-light/60 text-brand-blue px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <MessageSquareHeart className="w-4 h-4" />
          Pesanan Custom
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-brand-blue mb-3">
          Request Custom Keychain
        </h1>
        <p className="text-foreground/70 font-medium max-w-xl mx-auto">
          Ceritakan keychain impianmu dan lampirkan gambar referensi. Admin akan
          mengerjakannya sesuai instruksimu.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border-4 border-brand-blue-light p-6 md:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)]">
        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-700 leading-snug">{error}</p>
          </div>
        )}

        {/* 1. Instruksi untuk admin */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shrink-0">
              1
            </span>
            <h2 className="font-display text-2xl text-brand-blue">
              Instruksi untuk Admin <span className="text-red-400">*</span>
            </h2>
          </div>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={5}
            className={`${inputClass} resize-y`}
            placeholder="Contoh: Tolong buatkan keychain bentuk kucing warna pastel, tulisan nama 'Dinda' warna putih, ukuran 5 cm, bahan akrilik."
          />

          <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-4 mb-2">
            Ide cepat (klik untuk menambah)
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TIPS.map((tip) => (
              <button
                key={tip}
                type="button"
                onClick={() => handleAddPreset(tip)}
                className="px-4 py-2 rounded-full border-2 border-brand-blue-light text-xs font-bold text-foreground/70 hover:border-brand-blue hover:text-brand-blue transition-colors bg-white"
              >
                {tip}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Gambar referensi */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </span>
            <h2 className="font-display text-2xl text-brand-blue">Gambar Referensi</h2>
          </div>
          <p className="text-sm text-foreground/60 font-medium mb-4">
            Unggah gambar acuan <strong>atau</strong> tempel link-nya. Salah satu
            sudah cukup.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
            <div className="sm:col-span-2 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground/70 mb-2 uppercase tracking-wide">
                  <Camera className="w-3.5 h-3.5" /> Unggah Gambar
                </label>
                <input
                  id="referensi-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      (document.getElementById("referensi-input") as HTMLInputElement)?.click()
                    }
                    className="rounded-xl gap-2 h-12"
                  >
                    <Upload className="w-4 h-4" />
                    {preview ? "Ganti Gambar" : "Pilih Gambar"}
                  </Button>
                  {preview && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearImage}
                      className="rounded-xl gap-2 h-12 text-red-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" /> Hapus
                    </Button>
                  )}
                </div>
                <p className="text-xs text-foreground/50 font-medium mt-2">
                  JPG, PNG, WEBP, atau GIF · maksimal 5 MB.
                </p>
                {file && (
                  <p className="text-xs text-brand-blue font-bold mt-1 truncate">
                    {file.name} · {(file.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-foreground/70 mb-2 uppercase tracking-wide">
                  <Link2 className="w-3.5 h-3.5" /> Link Gambar Referensi
                </label>
                <input
                  type="url"
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                  className={inputClass}
                  placeholder="https://pinterest.com/... atau link Google Drive"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              {preview ? (
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-brand-blue-light bg-[#FFFBF2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Pratinjau gambar referensi"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-1 p-4 text-center">
                  <Upload className="w-6 h-6 opacity-40" />
                  <span className="text-xs font-medium">Belum ada gambar</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Nama opsional */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </span>
            <h2 className="font-display text-2xl text-brand-blue">
              Nama / Inisial{" "}
              <span className="text-sm font-sans font-medium text-foreground/40">
                (opsional)
              </span>
            </h2>
          </div>
          <input
            type="text"
            maxLength={15}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Contoh: Dinda"
          />
          <p className="text-xs text-foreground/50 mt-2 font-medium">
            Nama yang akan ditulis pada gantungan kunci.
          </p>
        </section>

        {/* Keterangan harga */}
        <div className="rounded-2xl bg-brand-blue-light/20 border border-brand-blue-light p-4 mb-8">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/70 font-medium leading-relaxed">
              Harga di bawah adalah <strong>harga keychain saja</strong>.{" "}
              <strong>Ongkir dihitung terpisah</strong> — chat admin untuk
              informasi ongkir ke kotamu.
            </p>
          </div>
        </div>

        {/* Harga & CTA */}
        <div className="pt-6 border-t-2 border-brand-blue-light flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground/50 uppercase tracking-wide">
              Harga Keychain
            </span>
            <span className="font-display text-3xl text-brand-blue">
              Rp {CUSTOM_PRICE.toLocaleString("id-ID")}
            </span>
            <span className="text-xs text-foreground/50 font-medium">
              Belum termasuk ongkir
            </span>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto h-16 px-10 text-xl gap-3 shadow-lg"
            onClick={handleAddToCart}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Mengunggah...
              </>
            ) : (
              <>
                <ShoppingBag className="w-6 h-6" /> Masukkan Keranjang
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Informasi ongkir terpisah */}
      <div className="mt-8 bg-[#FFFBF2] rounded-[2rem] border-2 border-brand-blue-light p-6 md:p-8">
        <h2 className="font-display text-xl text-brand-blue mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" /> Ongkir Dihitung Terpisah
        </h2>
        <p className="text-sm text-foreground/70 font-medium leading-relaxed mb-4">
          Harga yang tertera hanya untuk keychain. Ongkos kirim menyesuaikan kota
          tujuan dan jumlah pesanan. Hubungi admin untuk info ongkir sebelum atau
          sesudah checkout.
        </p>
        <Link href="/chat">
          <Button variant="outline" className="rounded-full gap-2">
            <MessageSquareHeart className="w-4 h-4" /> Chat Admin soal Ongkir
          </Button>
        </Link>
      </div>
    </div>
  );
}



