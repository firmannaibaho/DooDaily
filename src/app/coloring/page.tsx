"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Sparkle, Star } from "@/components/stickers/Decorations";
import { Undo2, Redo2, Eraser, Trash2, Download, Pen, ShoppingBag, Loader2, Sparkles, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

// Lazy load the 3D viewer
const KeychainViewer3D = dynamic(
  () => import("@/components/3d/KeychainViewer3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center gap-4 bg-[#FFFBF2] rounded-[3rem]">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <p className="text-brand-blue font-bold text-sm">Loading 3D Keychain Preview...</p>
      </div>
    ),
  }
);

const COLORS = [
  "#1c1917",
  "#ffffff",
  "#4776B9",
  "#F5A03A",
  "#F472B6",
  "#34D399",
  "#A78BFA",
  "#FBBF24",
  "#EF4444",
  "#60A5FA",
  "#fb923c",
  "#a3e635",
];

// Simple cat outline path data for the coloring canvas
const CAT_PATHS = [
  // Head outline
  "M 200 80 Q 120 80, 100 140 Q 80 200, 100 260 Q 120 320, 200 340 Q 280 320, 300 260 Q 320 200, 300 140 Q 280 80, 200 80 Z",
  // Left ear
  "M 130 130 Q 110 60, 140 40 Q 160 50, 160 110",
  // Right ear
  "M 270 130 Q 290 60, 260 40 Q 240 50, 240 110",
  // Left eye
  "M 160 190 Q 160 170, 175 170 Q 190 170, 190 190 Q 190 210, 175 210 Q 160 210, 160 190 Z",
  // Right eye
  "M 210 190 Q 210 170, 225 170 Q 240 170, 240 190 Q 240 210, 225 210 Q 210 210, 210 190 Z",
  // Nose
  "M 195 230 Q 200 225, 205 230 Q 200 238, 195 230 Z",
  // Mouth
  "M 200 238 Q 185 255, 175 250",
  "M 200 238 Q 215 255, 225 250",
  // Whiskers left
  "M 100 220 L 155 215",
  "M 105 240 L 155 235",
  // Whiskers right
  "M 245 215 L 300 220",
  "M 245 235 L 295 240",
  // Inner ear stripes
  "M 140 70 L 145 95",
  "M 150 65 L 152 90",
  "M 255 70 L 252 90",
  "M 248 65 L 248 90",
  // Paws
  "M 140 320 Q 130 370, 160 380 Q 190 370, 180 320",
  "M 220 320 Q 210 370, 240 380 Q 270 370, 260 320",
];

export default function ColoringStudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeColor, setActiveColor] = useState(COLORS[2]);
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [textureUrl, setTextureUrl] = useState<string>("");

  const { addItem } = useCart();

  // Helper to update 3D texture state
  const update3DTexture = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    setTextureUrl(url);
  }, []);

  // Handle uploaded custom image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Fill background white
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Aspect ratio contain fit
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );

        saveState();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Draw initial outline on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 420;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    CAT_PATHS.forEach((pathData) => {
      const path = new Path2D(pathData);
      ctx.stroke(path);
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([imageData]);
    setHistoryIndex(0);

    // Initial 3D texture push
    setTimeout(() => {
      update3DTexture();
    }, 100);
  }, [update3DTexture]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);

    // Push to 3D texture
    update3DTexture();
  }, [historyIndex, update3DTexture]);

  const undo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    update3DTexture();
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    update3DTexture();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    CAT_PATHS.forEach((pathData) => {
      const path = new Path2D(pathData);
      ctx.stroke(path);
    });
    saveState();
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "doodaily-artwork.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleAddToCart = () => {
    addItem({
      productId: 5000 + Math.floor(Math.random() * 4000),
      name: "Custom Hand-Painted 3D Keychain",
      price: 60000,
      image: textureUrl || "/logo.jpg",
      customizations: ["Design: Custom Hand-Coloring Studio Artwork"],
    });
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = activeColor;
    }
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.globalCompositeOperation = "source-over";
      }
      saveState();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <h1 className="font-display text-4xl md:text-5xl text-brand-blue mb-2 flex items-center justify-center gap-3">
          Coloring Studio &amp; 3D Maker
          <Sparkles className="w-8 h-8 text-brand-orange animate-spin" />
        </h1>
        <p className="text-foreground/70 font-medium max-w-2xl mx-auto">
          Warnai karakter kamu di 2D Canvas sebelah kiri, dan lihat karya kamu langsung **ditempel otomatis pada Keychain 3D** di sebelah kanan! ✨
        </p>
        <FloatingElement className="-top-4 right-1/4 hidden md:block">
          <Sparkle className="text-brand-orange w-8 h-8" />
        </FloatingElement>
      </div>

      {/* Main Grid Layout: Left Canvas | Right 3D Keychain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ================= LEFT: 2D COLORING CANVAS ================= */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-4 border-2 border-brand-blue-light shadow-sm flex items-center justify-between">
            <h2 className="font-display text-xl text-brand-blue flex items-center gap-2">
              <Pen className="w-5 h-5 text-brand-orange" /> 1. Color Your Doodle
            </h2>
            <span className="text-xs font-bold bg-brand-orange-light text-brand-orange px-3 py-1 rounded-full">
              2D Studio
            </span>
          </div>

          <div className="bg-[#FFFBF2] rounded-[2.5rem] border-4 border-brand-blue-light p-4 md:p-6 flex flex-col gap-4 relative">
            {/* Canvas Container */}
            <div className="flex justify-center items-center relative">
              <div className="bg-white rounded-3xl shadow-md border-2 border-brand-blue-light/50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-[300px] h-[315px] md:w-[360px] md:h-[378px] cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
            </div>

            {/* Tools Bar & Undo/Redo */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-3 border-2 border-brand-blue-light">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEraser(false)}
                  className={cn(
                    "p-2.5 rounded-xl flex items-center gap-1 font-bold text-xs transition-colors",
                    !isEraser
                      ? "bg-brand-blue text-white"
                      : "text-foreground/60 hover:bg-gray-100"
                  )}
                >
                  <Pen className="w-4 h-4" /> Brush
                </button>
                <button
                  onClick={() => setIsEraser(true)}
                  className={cn(
                    "p-2.5 rounded-xl flex items-center gap-1 font-bold text-xs transition-colors",
                    isEraser
                      ? "bg-brand-orange text-white"
                      : "text-foreground/60 hover:bg-gray-100"
                  )}
                >
                  <Eraser className="w-4 h-4" /> Eraser
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-xl text-foreground/60 hover:bg-gray-100 disabled:opacity-30"
                  title="Undo"
                >
                  <Undo2 className="w-5 h-5" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-xl text-foreground/60 hover:bg-gray-100 disabled:opacity-30"
                  title="Redo"
                >
                  <Redo2 className="w-5 h-5" />
                </button>
                <button
                  onClick={clearCanvas}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500"
                  title="Clear All"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Brush Size & Palette */}
            <div className="space-y-3 bg-white rounded-2xl p-4 border-2 border-brand-blue-light">
              <div className="flex items-center justify-between text-xs font-bold text-foreground/70">
                <span>Brush Size</span>
                <span>{brushSize}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full accent-brand-blue"
              />

              <div className="grid grid-cols-6 gap-2 pt-2 border-t border-gray-100">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveColor(c);
                      setIsEraser(false);
                    }}
                    className={cn(
                      "w-full aspect-square rounded-full border-2 transition-transform",
                      activeColor === c && !isEraser
                        ? "border-foreground scale-110 shadow-sm"
                        : "border-transparent hover:scale-110"
                    )}
                    style={{
                      backgroundColor: c,
                      boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #e5e7eb" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                className="flex-1 rounded-2xl gap-2 font-bold"
              >
                <Upload className="w-4 h-4" /> Upload Image
              </Button>
              <Button
                onClick={downloadCanvas}
                variant="outline"
                className="flex-1 rounded-2xl gap-2 font-bold"
              >
                <Download className="w-4 h-4" /> Download PNG
              </Button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: REALTIME 3D KEYCHAIN PREVIEW ================= */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-3xl p-4 border-2 border-brand-blue-light shadow-sm flex items-center justify-between">
            <h2 className="font-display text-xl text-brand-blue flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-brand-orange" /> 2. Live 3D Keychain Result
            </h2>
            <span className="text-xs font-bold bg-brand-blue-light text-brand-blue px-3 py-1 rounded-full">
              3D Realtime
            </span>
          </div>

          <div className="bg-white rounded-[2.5rem] border-4 border-brand-blue-light h-[520px] relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] flex flex-col justify-between p-6">
            {/* Dotted bg */}
            <div className="absolute inset-0 bg-[radial-gradient(#e0eaf5_2px,transparent_2px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

            {/* 3D Viewer */}
            <div className="flex-grow relative z-10">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
                  </div>
                }
              >
                <KeychainViewer3D
                  color="#4776B9"
                  name=""
                  accessoryEmoji="⭐"
                  character="cat"
                  textureUrl={textureUrl}
                />
              </Suspense>
            </div>

            {/* Order Action Card */}
            <div className="relative z-20 bg-[#FFFBF2] rounded-3xl p-4 border-2 border-brand-blue-light flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div>
                <p className="text-xs font-bold text-foreground/50 uppercase">Order Your Creation</p>
                <p className="font-display text-2xl text-brand-orange">Rp 60.000</p>
                <p className="text-xs text-foreground/70 font-medium">Custom printed acrylic keychain</p>
              </div>
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full sm:w-auto rounded-full gap-2 px-6 h-14 text-base shadow-[0_4px_0_0_#2B4C7E]"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
