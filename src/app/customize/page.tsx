"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Sparkle } from "@/components/stickers/Decorations";
import { RefreshCcw, ShoppingBag, Check, Loader2 } from "lucide-react";
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

export default function CustomizePage() {
  const [shape, setShape] = useState<"circle" | "rounded">("circle");
  const [character, setCharacter] = useState("cat");
  const [color, setColor] = useState("blue");
  const [accessory, setAccessory] = useState("star");
  const [name, setName] = useState("");
  const { addItem } = useCart();

  const selectedColor = COLORS.find((c) => c.id === color);
  const selectedColorHex = selectedColor?.hex || "#4776B9";
  const selectedAccessory = ACCESSORIES.find((a) => a.id === accessory);

  const handleReset = () => {
    setCharacter("cat");
    setColor("blue");
    setAccessory("star");
    setName("");
  };

  const handleAddToCart = () => {
    const customizations = [
      `Character: ${CHARACTERS.find((c) => c.id === character)?.name}`,
      `Color: ${selectedColor?.name}`,
      `Charm: ${selectedAccessory?.name}`,
    ];
    if (name) customizations.push(`Name: ${name}`);

    addItem({
      productId: 1000 + Math.floor(Math.random() * 9000),
      name: `Custom ${CHARACTERS.find((c) => c.id === character)?.name} Keychain`,
      price: 55000,
      image: "/logo.jpg",
      customizations,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-[80vh]">
      <div className="text-center mb-12 relative">
        <FloatingElement className="-top-8 left-1/4 hidden md:block">
          <Sparkle className="text-brand-orange w-10 h-10" />
        </FloatingElement>
        <h1 className="font-display text-5xl md:text-6xl text-brand-blue mb-4">
          Make It Yours!
        </h1>
        <p className="text-lg text-foreground/70 font-medium">
          Design your perfect Doodaily keychain in 3D.
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

          {/* Color indicator */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-blue-light z-10">
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: selectedColorHex }}
            ></div>
            <span className="text-xs font-bold text-foreground/60">
              {selectedColor?.name}
            </span>
          </div>
        </div>

        {/* ============ CONTROLS ============ */}
        <div className="flex flex-col gap-8 bg-[#FFFBF2] lg:bg-transparent rounded-3xl p-6 lg:p-0">
          {/* Step 1: Shape */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h3 className="font-display text-2xl text-brand-blue">
                Choose Keychain Shape
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
                1
              </span>
              <h3 className="font-display text-2xl text-brand-blue">
                Choose Character
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

          {/* Step 2: Color */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h3 className="font-display text-2xl text-brand-orange">
                Pick a Color
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

          {/* Step 3: Text */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                3
              </span>
              <h3 className="font-display text-2xl text-brand-blue">
                Add Your Name
              </h3>
            </div>
            <div>
              <input
                type="text"
                placeholder="e.g. Doodaily..."
                maxLength={10}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-6 rounded-full border-2 border-brand-blue-light focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/20 text-lg font-bold transition-all bg-white"
              />
              <p className="text-xs text-foreground/50 mt-2 font-medium px-4">
                Max 10 characters. Watch it appear on the keychain in 3D!
              </p>
            </div>
          </div>

          {/* Step 4: Accessory */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm">
                4
              </span>
              <h3 className="font-display text-2xl text-brand-orange">
                Add a Charm
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
                Total Price
              </span>
              <span className="font-display text-3xl text-brand-blue">
                Rp 55.000
              </span>
            </div>
            <Button
              size="lg"
              className="w-full sm:w-auto h-16 px-10 text-xl gap-3"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-6 h-6" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
