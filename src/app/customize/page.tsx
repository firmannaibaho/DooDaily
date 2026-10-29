"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Sparkle } from "@/components/stickers/Decorations";
import { RefreshCcw, ShoppingBag, Check, Loader2, MessageSquareHeart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

// Lazy load the 3D viewer to avoid SSR issues
const KeychainViewer3D = dynamic(
  () => import("@/components/3d/KeychainViewer3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-4 bg-[#FFFBF2] rounded-[3rem]">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <p className="text-brand-blue font-bold text-sm">Loading 3D Preview...</p>
      </div>
    ),
  }
);

const CHARACTERS = [
  { id: "cat", name: "Doodaily Cat" },
  { id: "bear", name: "Sleepy Bear" },
  { id: "bunny", name: "Bouncy Bunny" },
];

const COLORS = [
  { id: "blue", hex: "#4776B9", name: "Doodaily Blue" },
  { id: "orange", hex: "#F5A03A", name: "Sunset Orange" },
  { id: "pink", hex: "#F472B6", name: "Cherry Blossom" },
  { id: "green", hex: "#34D399", name: "Mint Fresh" },
  { id: "purple", hex: "#A78BFA", name: "Lavender" },
  { id: "gold", hex: "#FBBF24", name: "Golden Hour" },
];

const ACCESSORIES = [
  { id: "none", name: "None", icon: "🚫" },
  { id: "star", name: "Star Charm", icon: "⭐" },
  { id: "heart", name: "Heart Charm", icon: "❤️" },
  { id: "fish", name: "Fish Charm", icon: "🐟" },
  { id: "flower", name: "Flower Charm", icon: "🌸" },
];

const QUICK_PRESETS = [
  "Nuansa Pastel Aesthetic",
  "Tema Gliter & Sparkling",
  "Warna Gradasi Lembut",
  "Tambahkan Gantungan Lonceng Kecil",
  "Pakai Font Huruf Sambung Lucu",
  "Tema Monokrom Minimalis",
];

export default function CustomizePage() {
  const [shape, setShape] = useState<"circle" | "rounded">("circle");
  const [character, setCharacter] = useState("cat");
  const [color, setColor] = useState("blue");
  const [accessory, setAccessory] = useState("star");
  const [name, setName] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const { addItem } = useCart();

  const selectedColor = COLORS.find((c) => c.id === color);
  const selectedColorHex = selectedColor?.hex || "#4776B9";
  const selectedAccessory = ACCESSORIES.find((a) => a.id === accessory);

  const handleReset = () => {
    setShape("circle");
    setCharacter("cat");
    setColor("blue");
    setAccessory("star");
    setName("");
    setCustomInstructions("");
    setReferenceLink("");
  };

  const handleAddPreset = (preset: string) => {
    setCustomInstructions((prev) => {
      if (!prev.trim()) return preset;
      if (prev.includes(preset)) return prev;
      return `${prev}, ${preset}`;
    });
  };

  const handleAddToCart = () => {
    const customizations = [
      `Bentuk: ${shape === "circle" ? "Circle (Bulat)" : "Persegi Rounded"}`,
      `Karakter Dasar: ${CHARACTERS.find((c) => c.id === character)?.name}`,
      `Warna Dasar: ${selectedColor?.name}`,
      `Charm Pilihan: ${selectedAccessory?.name}`,
    ];
    if (name.trim()) customizations.push(`Nama/Inisial: ${name.trim()}`);
    if (customInstructions.trim()) {
      customizations.push(`Instruksi Khusus (Admin Crafted): ${customInstructions.trim()}`);
    }
    if (referenceLink.trim()) {
      customizations.push(`Link Referensi/Foto: ${referenceLink.trim()}`);
    }

    addItem({
      productId: 1000 + Math.floor(Math.random() * 9000),
      name: `Custom Handcrafted Keychain (${CHARACTERS.find((c) => c.id === character)?.name})`,
      price: 15000,
      image: "/catalog/study-work-keychain.jpg",
      customizations,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-[80vh]">
      <div className="text-center mb-12 relative">
        <FloatingElement className="-top-8 left-1/4 hidden md:block">
          <Sparkle className="text-brand-orange w-10 h-10" />
        </FloatingElement>
        <span className="inline-flex items-center gap-2 bg-brand-orange-light text-brand-orange px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4" /> Handmade with Love by Admin
        </span>
        <h1 className="font-display text-4xl md:text-6xl text-brand-blue mb-4">
          Request Custom Keychain Kamu!
        </h1>
        <p className="text-base md:text-lg text-foreground/70 font-medium max-w-2xl mx-auto">
          Tentukan referensi awal atau tuliskan ide sesukamu di <b>Instruksi Khusus</b>. Pengrajin Doodaily akan membuatkannya secara personal dan detail untukmu ✨
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start">
        {/* ============ 3D PREVIEW ============ */}
        <div className="bg-white rounded-[3rem] border-4 border-brand-blue-light aspect-square lg:aspect-auto lg:h-[600px] relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] sticky top-28">
          {/* Dotted background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e0eaf5_2px,transparent_2px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

          {/* 3D Canvas */}
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
              </div>
            }
          >
            <KeychainViewer3D
              color={selectedColorHex}
              name={name}
              accessoryEmoji={selectedAccessory?.icon || ""}
              character={character}
              shape={shape}
            />
          </Suspense>

          {/* Reset button overlay */}
          <button
            onClick={handleReset}
            className="absolute top-6 right-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-foreground/60 hover:text-brand-blue border border-brand-blue-light hover:border-brand-blue transition-all flex items-center gap-2 z-10"
          >
            <RefreshCcw className="w-4 h-4" /> Reset
          </button>

          {/* Live Badge indicator */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-blue-light z-10">
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: selectedColorHex }}
            ></div>
            <span className="text-xs font-bold text-foreground/60">
              Preview Model Dasar
            </span>
          </div>

          {customInstructions && (
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-brand-orange-light shadow-sm z-10 text-xs">
              <span className="font-bold text-brand-orange flex items-center gap-1.5 mb-1">
                <MessageSquareHeart className="w-3.5 h-3.5" /> Catatan Khusus untuk Admin:
              </span>
              <p className="line-clamp-2 text-foreground/80 italic">
                &ldquo;{customInstructions}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* ============ CONTROLS ============ */}
        <div className="flex flex-col gap-8 bg-[#FFFBF2] lg:bg-transparent rounded-3xl p-6 lg:p-0">
          
          {/* FITUR UTAMA: INSTRUKSI KHUSUS UNTUK ADMIN */}
          <div className="bg-white rounded-3xl p-6 border-4 border-brand-orange shadow-md relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm shadow">
                ★
              </div>
              <div>
                <h3 className="font-display text-2xl text-brand-orange">
                  Instruksi Khusus untuk Admin
                </h3>
                <p className="text-xs text-foreground/60 font-medium">
                  Tuliskan konsep atau detail yang kamu mau, admin yang langsung eksekusi!
                </p>
              </div>
            </div>

            <textarea
              rows={4}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Contoh: Kak mau warna pastel ungu gradasi ke pink, tambah glitter bintang kecil-kecil, terus di belakangnya kasih inisial 'F & A' yaa..."
              className="w-full p-4 rounded-2xl border-2 border-brand-orange-light focus:border-brand-orange focus:outline-none focus:ring-4 focus:ring-brand-orange/20 text-sm font-medium transition-all bg-[#FFFBF2] resize-none"
            />

            {/* Quick preset chips */}
            <div className="mt-3">
              <span className="text-xs font-bold text-foreground/60 block mb-2">
                Ide Cepat (Klik untuk tambah ke catatan):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="text-xs bg-brand-orange-light/50 hover:bg-brand-orange-light text-brand-orange font-bold px-3 py-1 rounded-full border border-brand-orange/20 transition-all hover:scale-105 active:scale-95"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference link input */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-xs font-bold text-foreground/70 block mb-1.5">
                Link Referensi Gambar / Drive (Opsional):
              </label>
              <input
                type="url"
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://pinterest.com/... atau link Google Drive"
                className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-orange focus:outline-none text-xs font-medium transition-colors bg-white"
              />
            </div>
          </div>

          {/* Step 1: Shape */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h3 className="font-display text-2xl text-brand-blue">
                Pilih Bentuk Dasar Akrilik
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShape("circle")}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex items-center gap-3 bg-white font-bold text-sm",
                  shape === "circle"
                    ? "border-brand-orange text-brand-orange shadow-[0_0_0_4px_rgba(245,160,58,0.2)]"
                    : "border-brand-blue-light text-foreground/70 hover:border-brand-blue"
                )}
              >
                <span className="text-2xl">🔴</span>
                <div className="text-left">
                  <p className="font-bold">Circle (Bulat)</p>
                  <p className="text-xs opacity-60">Classic round acrylic</p>
                </div>
              </button>
              <button
                onClick={() => setShape("rounded")}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex items-center gap-3 bg-white font-bold text-sm",
                  shape === "rounded"
                    ? "border-brand-orange text-brand-orange shadow-[0_0_0_4px_rgba(245,160,58,0.2)]"
                    : "border-brand-blue-light text-foreground/70 hover:border-brand-blue"
                )}
              >
                <span className="text-2xl">🔲</span>
                <div className="text-left">
                  <p className="font-bold">Persegi Rounded</p>
                  <p className="text-xs opacity-60">Rounded rectangle</p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Character */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h3 className="font-display text-2xl text-brand-blue">
                Pilih Karakter Referensi
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setCharacter(char.id)}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center bg-white text-center",
                    character === char.id
                      ? "border-brand-orange shadow-[0_0_0_4px_rgba(245,160,58,0.2)]"
                      : "border-brand-blue-light hover:border-brand-blue"
                  )}
                >
                  <span className="text-3xl mb-2">
                    {char.id === "cat" ? "🐱" : char.id === "bear" ? "🐻" : "🐰"}
                  </span>
                  <span className="text-xs font-bold text-center leading-tight">
                    {char.name}
                  </span>
                  {character === char.id && (
                    <div className="absolute -top-2 -right-2 bg-brand-orange text-white rounded-full p-1 border-2 border-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Color */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                3
              </span>
              <h3 className="font-display text-2xl text-brand-blue">
                Warna Dasar Dominan
              </h3>
            </div>
            <div className="flex flex-wrap gap-4">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={cn(
                    "w-14 h-14 rounded-full border-4 transition-all duration-200 relative group",
                    color === c.id
                      ? "border-foreground scale-110"
                      : "border-white hover:scale-110 shadow-sm"
                  )}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                  title={c.name}
                >
                  {color === c.id && (
                    <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
                      <Check className="w-6 h-6" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Text Name */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                4
              </span>
              <h3 className="font-display text-2xl text-brand-blue">
                Nama / Inisial di Keychain
              </h3>
            </div>
            <div>
              <input
                type="text"
                placeholder="Contoh: Doodaily, Firman..."
                maxLength={15}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-6 rounded-full border-2 border-brand-blue-light focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/20 text-lg font-bold transition-all bg-white"
              />
              <p className="text-xs text-foreground/50 mt-2 font-medium px-4">
                Nama ini akan ditulis langsung oleh admin pada gantungan kunci.
              </p>
            </div>
          </div>

          {/* Step 5: Charm */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                5
              </span>
              <h3 className="font-display text-2xl text-brand-blue">
                Gantungan Tambahan (Charm)
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAccessory(acc.id)}
                  className={cn(
                    "px-6 py-3 rounded-full border-2 font-bold text-sm flex items-center gap-2 transition-all bg-white",
                    accessory === acc.id
                      ? "border-brand-orange text-brand-orange bg-brand-orange-light shadow-[0_0_0_2px_rgba(245,160,58,0.2)]"
                      : "border-brand-blue-light text-foreground/70 hover:border-brand-blue hover:text-brand-blue"
                  )}
                >
                  <span className="text-xl">{acc.icon}</span> {acc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-8 pt-8 border-t-2 border-brand-blue-light flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground/50 uppercase tracking-wide">
                Harga Custom Handmade
              </span>
              <span className="font-display text-3xl text-brand-blue">
                Rp 15.000
              </span>
            </div>
            <Button
              size="lg"
              className="w-full sm:w-auto h-16 px-10 text-xl gap-3 shadow-lg"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-6 h-6" /> Masukkan Keranjang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
