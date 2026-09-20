"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Star, Sparkle, CatPaw, DoodleArrow } from "@/components/stickers/Decorations";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";

const STICKER_ITEMS = [
  { id: 1, emoji: "⭐", label: "Star", color: "#FBBF24" },
  { id: 2, emoji: "❤️", label: "Heart", color: "#EF4444" },
  { id: 3, emoji: "🌸", label: "Flower", color: "#F472B6" },
  { id: 4, emoji: "🐱", label: "Cat", color: "#4776B9" },
  { id: 5, emoji: "🎨", label: "Palette", color: "#A78BFA" },
  { id: 6, emoji: "🦋", label: "Butterfly", color: "#60A5FA" },
];

export default function PlaygroundPage() {
  const [catState, setCatState] = useState<"idle" | "happy" | "sleepy" | "spin">("idle");
  const [clicks, setClicks] = useState(0);
  const constraintsRef = useRef(null);

  const handleCatClick = () => {
    const next = clicks + 1;
    setClicks(next);
    if (next % 5 === 0) {
      setCatState("spin");
      setTimeout(() => setCatState("idle"), 1500);
    } else if (next % 3 === 0) {
      setCatState("sleepy");
      setTimeout(() => setCatState("idle"), 2000);
    } else {
      setCatState("happy");
      setTimeout(() => setCatState("idle"), 1000);
    }
  };

  const catVariants = {
    idle: { rotate: 0, scale: 1, y: 0 },
    happy: { rotate: 0, scale: 1.15, y: -20, transition: { type: "spring" as const, stiffness: 300 } },
    sleepy: { rotate: 15, scale: 0.9, y: 10, transition: { duration: 0.5 } },
    spin: { rotate: 360, scale: 1, y: -10, transition: { duration: 0.8 } },
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-screen relative overflow-hidden flex flex-col">
      <div className="text-center mb-12 relative z-10">
        <h1 className="font-display text-5xl md:text-7xl text-brand-blue mb-4">
          The Playground
        </h1>
        <p className="text-xl text-foreground/70 font-medium">
          Click, drag, and play with the Doodaily world!
        </p>
      </div>

      {/* Main Interactive Area */}
      <div
        ref={constraintsRef}
        className="flex-grow bg-white/50 backdrop-blur-sm rounded-[3rem] border-4 border-brand-blue-light border-dashed relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[60vh]"
      >
        <p className="absolute top-8 left-8 text-brand-blue/40 font-display text-xl rotate-[-10deg]">
          Poke the cat!
        </p>
        <div className="absolute top-12 left-36 hidden md:block">
          <DoodleArrow className="w-14 h-14 text-brand-orange rotate-[160deg] opacity-50" />
        </div>

        <p className="absolute top-8 right-8 text-brand-orange/40 font-display text-xl rotate-[8deg]">
          Drag the stickers! →
        </p>

        {/* Interactive Mascot */}
        <motion.div
          className="relative cursor-pointer z-20"
          onClick={handleCatClick}
          variants={catVariants}
          animate={catState}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-48 h-48 md:w-64 md:h-64 relative z-20">
            <Image
              src="/logo.jpg"
              alt="Interactive Mascot"
              fill
              className="object-contain drop-shadow-xl"
            />
          </div>

          {/* Reaction Particles */}
          {catState === "happy" && (
            <>
              <motion.div
                className="absolute -top-8 -right-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Star className="w-12 h-12 text-yellow-400" />
              </motion.div>
              <motion.div
                className="absolute -top-4 -left-8"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, y: -15 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Sparkle className="w-10 h-10 text-brand-orange" />
              </motion.div>
            </>
          )}
          {catState === "sleepy" && (
            <motion.div
              className="absolute -top-10 right-0 font-display text-3xl text-brand-blue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: -10 }}
            >
              Zzz...
            </motion.div>
          )}
          {catState === "spin" && (
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 font-display text-2xl text-brand-orange"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Wheee! 🎉
            </motion.div>
          )}
        </motion.div>

        <p className="mt-8 text-foreground/50 font-bold bg-white px-6 py-2 rounded-full border-2 border-brand-blue-light z-20">
          You&apos;ve poked the cat {clicks} times.
          {clicks >= 10 && " Wow, so persistent! 😂"}
        </p>

        {/* Draggable Stickers */}
        {STICKER_ITEMS.map((sticker, i) => {
          // Spread them around the edges
          const positions = [
            { top: "15%", right: "10%" },
            { top: "25%", right: "20%" },
            { bottom: "15%", right: "15%" },
            { bottom: "25%", left: "10%" },
            { top: "20%", left: "12%" },
            { bottom: "20%", left: "25%" },
          ];
          const pos = positions[i % positions.length];

          return (
            <motion.div
              key={sticker.id}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              whileDrag={{ scale: 1.2, zIndex: 50, rotate: 0 }}
              whileHover={{ scale: 1.1 }}
              className="absolute cursor-grab active:cursor-grabbing z-10"
              style={{ ...pos, rotate: `${(i - 3) * 12}deg` } as React.CSSProperties}
            >
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border-4 flex items-center justify-center text-3xl md:text-4xl shadow-lg hover:shadow-xl transition-shadow"
                style={{ borderColor: sticker.color }}
              >
                {sticker.emoji}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative background elements */}
      <FloatingElement className="top-1/4 -left-10 opacity-20 pointer-events-none">
        <CatPaw className="w-32 h-32 text-brand-orange" />
      </FloatingElement>
      <FloatingElement
        className="bottom-1/4 -right-10 opacity-20 pointer-events-none"
        delay={1}
        rotation={-45}
      >
        <CatPaw className="w-40 h-40 text-brand-blue" />
      </FloatingElement>
    </div>
  );
}
