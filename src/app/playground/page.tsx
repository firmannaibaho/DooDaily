"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Star, Sparkle, CatPaw, DoodleArrow } from "@/components/stickers/Decorations";
import { Button } from "@/components/ui/Button";
import { Trash2, RefreshCcw, Sparkles, Heart, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Sound Effects Synthesizer (Web Audio API) ──────────────────────
function playPopSound(freq = 600, duration = 0.1) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch {
    // Ignore audio context errors if browser blocks autoplay
  }
}

function playCelebrateSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.35);
    });
  } catch {
    // Ignore audio context errors
  }
}

// ─── Sticker & Food Items ──────────────────────────────────────────
const STICKER_PALETTE = [
  { id: "star", emoji: "⭐", name: "Star", color: "#FBBF24" },
  { id: "heart", emoji: "💖", name: "Heart", color: "#EF4444" },
  { id: "flower", emoji: "🌸", name: "Flower", color: "#F472B6" },
  { id: "paw", emoji: "🐾", name: "Paw", color: "#4776B9" },
  { id: "donut", emoji: "🍩", name: "Donut", color: "#fb923c" },
  { id: "sparkle", emoji: "✨", name: "Sparkle", color: "#A78BFA" },
  { id: "ribbon", emoji: "🎀", name: "Ribbon", color: "#F472B6" },
  { id: "butterfly", emoji: "🦋", name: "Butterfly", color: "#60A5FA" },
];

const FOOD_ITEMS = [
  { id: "fish", emoji: "🐟", name: "Fish", love: 20, soundFreq: 523 },
  { id: "milk", emoji: "🥛", name: "Milk", love: 15, soundFreq: 587 },
  { id: "donut", emoji: "🍩", name: "Donut", love: 25, soundFreq: 659 },
  { id: "toy", emoji: "🎾", name: "Toy Ball", love: 30, soundFreq: 783 },
];

interface PlacedSticker {
  id: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
}

export default function PlaygroundPage() {
  const [catState, setCatState] = useState<"idle" | "happy" | "sleepy" | "spin" | "eating">("idle");
  const [love, setLove] = useState(30);
  const [level, setLevel] = useState(1);
  const [activeSticker, setActiveSticker] = useState(STICKER_PALETTE[0]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([
    { id: "1", emoji: "⭐", color: "#FBBF24", x: 80, y: 120, rotation: -12 },
    { id: "2", emoji: "💖", color: "#EF4444", x: 620, y: 100, rotation: 15 },
    { id: "3", emoji: "🌸", color: "#F472B6", x: 120, y: 380, rotation: 8 },
  ]);
  const [floatingFloatingText, setFloatingText] = useState<{ id: string; text: string; x: number; y: number }[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);

  // ── Mascot Interaction ──
  const handleCatClick = () => {
    playPopSound(700, 0.12);
    const newLove = Math.min(100, love + 10);
    setLove(newLove);
    checkLevelUp(newLove);

    setCatState("happy");
    setTimeout(() => setCatState("idle"), 1200);
  };

  const handleFeed = (food: typeof FOOD_ITEMS[0]) => {
    playPopSound(food.soundFreq, 0.15);
    const newLove = Math.min(100, love + food.love);
    setLove(newLove);
    checkLevelUp(newLove);

    setCatState("eating");

    // Add floating text feedback
    const textId = Math.random().toString();
    setFloatingText((prev) => [
      ...prev,
      { id: textId, text: `+${food.love} Love! ${food.emoji}`, x: window.innerWidth / 2, y: 200 },
    ]);
    setTimeout(() => {
      setFloatingText((prev) => prev.filter((t) => t.id !== textId));
    }, 1500);

    setTimeout(() => setCatState("happy"), 800);
    setTimeout(() => setCatState("idle"), 2000);
  };

  const checkLevelUp = (currentLove: number) => {
    if (currentLove >= 100) {
      playCelebrateSound();
      setLevel((l) => l + 1);
      setCatState("spin");
      setTimeout(() => {
        setLove(20);
        setCatState("idle");
      }, 2000);
    }
  };

  // ── Stamp Sticker on Board ──
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only stamp if clicked directly on the background, not on interactive items
    const target = e.target as HTMLElement;
    if (target.closest(".interactive-item") || target.closest(".no-stamp")) return;

    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;

    playPopSound(500 + Math.random() * 200, 0.1);

    const newSticker: PlacedSticker = {
      id: Date.now().toString(),
      emoji: activeSticker.emoji,
      color: activeSticker.color,
      x,
      y,
      rotation: Math.floor(Math.random() * 40) - 20,
    };

    setPlacedStickers((prev) => [...prev, newSticker]);
  };

  const removeSticker = (id: string) => {
    playPopSound(300, 0.08);
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const clearBoard = () => {
    playPopSound(250, 0.1);
    setPlacedStickers([]);
  };

  const catVariants = {
    idle: { rotate: 0, scale: 1, y: 0 },
    happy: { rotate: 0, scale: 1.15, y: -20, transition: { type: "spring" as const, stiffness: 300 } },
    eating: { rotate: [-5, 5, -5, 0], scale: 1.1, y: -5 },
    sleepy: { rotate: 15, scale: 0.9, y: 10, transition: { duration: 0.5 } },
    spin: { rotate: 360, scale: 1.2, y: -15, transition: { duration: 0.8 } },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen relative flex flex-col gap-8">
      {/* Header & Score */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-6xl text-brand-blue mb-1">
            Doodaily Playground ✨
          </h1>
          <p className="text-foreground/70 font-medium">
            Feed the cat, stamp stickers, and build your cute interactive world!
          </p>
        </div>

        {/* Level & Love Bar */}
        <div className="bg-white rounded-3xl p-4 border-2 border-brand-blue-light shadow-sm flex items-center gap-6 shrink-0 no-stamp">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-orange text-white font-display text-xl flex items-center justify-center">
              L{level}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground/50 uppercase">Mascot Level</p>
              <p className="font-bold text-sm text-brand-blue flex items-center gap-1">
                <Trophy className="w-4 h-4 text-brand-orange" /> Level {level}
              </p>
            </div>
          </div>

          <div className="w-36 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-pink-500 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500" /> Love
              </span>
              <span>{love}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-brand-orange transition-all duration-300 rounded-full"
                style={{ width: `${love}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Board */}
      <div
        ref={boardRef}
        onClick={handleBoardClick}
        className="flex-grow bg-white/70 backdrop-blur-md rounded-[3rem] border-4 border-brand-blue-light border-dashed relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[500px] cursor-crosshair shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] select-none"
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e0eaf5_2px,transparent_2px)] [background-size:28px_28px] opacity-60 pointer-events-none"></div>

        {/* Top Floating Hints */}
        <div className="absolute top-6 left-8 text-brand-blue/50 font-display text-lg rotate-[-6deg] pointer-events-none hidden md:block">
          👇 Click anywhere to stamp stiker!
        </div>
        <div className="absolute top-6 right-8 text-brand-orange/50 font-display text-lg rotate-[6deg] pointer-events-none hidden md:block">
          🐱 Poke or feed the cat!
        </div>

        {/* ── Mascot (Virtual Pet) ── */}
        <motion.div
          className="relative cursor-pointer z-30 interactive-item"
          onClick={handleCatClick}
          variants={catVariants}
          animate={catState}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-48 h-48 md:w-64 md:h-64 relative">
            <Image
              src="/logo.jpg"
              alt="Doodaily Mascot"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Reaction Animations */}
          <AnimatePresence>
            {catState === "happy" && (
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-pink-100 border-2 border-pink-400 text-pink-600 px-4 py-1.5 rounded-full font-bold text-sm shadow-md whitespace-nowrap"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -10, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                Purrr! So happy! 💖
              </motion.div>
            )}
            {catState === "eating" && (
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-100 border-2 border-brand-orange text-brand-orange px-4 py-1.5 rounded-full font-bold text-sm shadow-md whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -10 }}
                exit={{ opacity: 0 }}
              >
                Nom nom nom! 😋
              </motion.div>
            )}
            {catState === "spin" && (
              <motion.div
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-orange text-white px-5 py-2 rounded-full font-display text-lg shadow-lg whitespace-nowrap"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0 }}
              >
                🎉 LEVEL UP! 🎉
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Text Effects */}
        {floatingFloatingText.map((t) => (
          <motion.div
            key={t.id}
            className="absolute z-40 font-display text-2xl text-pink-500 drop-shadow-md pointer-events-none"
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -60, scale: 1.2 }}
            transition={{ duration: 1.2 }}
          >
            {t.text}
          </motion.div>
        ))}

        {/* ── Stamped Draggable Stickers ── */}
        {placedStickers.map((sticker) => (
          <motion.div
            key={sticker.id}
            drag
            dragConstraints={boardRef}
            dragElastic={0.1}
            whileDrag={{ scale: 1.2, zIndex: 50 }}
            whileHover={{ scale: 1.1 }}
            className="absolute cursor-grab active:cursor-grabbing z-20 group interactive-item"
            style={{
              left: `${sticker.x}px`,
              top: `${sticker.y}px`,
              rotate: `${sticker.rotation}deg`,
            }}
          >
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border-4 flex items-center justify-center text-3xl md:text-4xl shadow-md hover:shadow-xl transition-shadow relative"
              style={{ borderColor: sticker.color }}
            >
              {sticker.emoji}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSticker(sticker.id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                title="Remove sticker"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Toolbars & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-stamp">
        {/* Tray 1: Sticker Tray */}
        <div className="bg-white rounded-3xl p-5 border-2 border-brand-blue-light shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-brand-blue flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-orange" /> Pick Sticker to Stamp
            </h3>
            <span className="text-xs font-bold text-foreground/50">
              Active: {activeSticker.emoji}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STICKER_PALETTE.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  playPopSound(550, 0.08);
                  setActiveSticker(st);
                }}
                className={cn(
                  "w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl transition-all shrink-0 bg-white",
                  activeSticker.id === st.id
                    ? "border-brand-orange scale-110 shadow-md bg-brand-orange-light/30"
                    : "border-gray-200 hover:border-brand-blue"
                )}
                title={st.name}
              >
                {st.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Tray 2: Feed Mascot */}
        <div className="bg-white rounded-3xl p-5 border-2 border-brand-blue-light shadow-sm flex flex-col gap-3">
          <h3 className="font-display text-xl text-brand-orange flex items-center gap-2">
            <Heart className="w-5 h-5 fill-pink-500 text-pink-500" /> Feed Mascot
          </h3>

          <div className="grid grid-cols-4 gap-2">
            {FOOD_ITEMS.map((food) => (
              <button
                key={food.id}
                onClick={() => handleFeed(food)}
                className="p-2.5 rounded-2xl border-2 border-brand-blue-light hover:border-brand-orange bg-[#FFFBF2] hover:bg-brand-orange-light/30 transition-all flex flex-col items-center gap-1 group"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">
                  {food.emoji}
                </span>
                <span className="text-[10px] font-bold text-foreground/70">
                  +{food.love} Love
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tray 3: Board Actions */}
        <div className="bg-white rounded-3xl p-5 border-2 border-brand-blue-light shadow-sm flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-display text-xl text-brand-blue mb-1">Board Actions</h3>
            <p className="text-xs text-foreground/60 font-medium">
              Stickers placed: {placedStickers.length}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={clearBoard}
              variant="outline"
              className="flex-1 rounded-2xl gap-2 font-bold text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Clear Board
            </Button>
            <Button
              onClick={() => {
                playCelebrateSound();
                handleCatClick();
              }}
              className="flex-1 rounded-2xl gap-2 font-bold"
            >
              <Sparkles className="w-4 h-4" /> Party Mode
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
