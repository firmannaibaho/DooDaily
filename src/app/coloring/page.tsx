"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Sparkle } from "@/components/stickers/Decorations";
import { Undo2, Redo2, Eraser, Trash2, Download, Pen } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";

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
  const [activeColor, setActiveColor] = useState(COLORS[2]);
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Draw the outline on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution
    canvas.width = 400;
    canvas.height = 420;

    // Fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the cat outline
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    CAT_PATHS.forEach((pathData) => {
      const path = new Path2D(pathData);
      ctx.stroke(path);
    });

    // Save initial state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([imageData]);
    setHistoryIndex(0);
  }, []);

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
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
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
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Re-draw the base outline
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
    link.download = "doodaily-coloring.png";
    link.href = canvas.toDataURL();
    link.click();
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
      // Restore composite operation after eraser
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
      <div className="text-center mb-8 relative">
        <h1 className="font-display text-4xl md:text-5xl text-brand-blue mb-2">
          Coloring Studio
        </h1>
        <p className="text-foreground/70 font-medium">
          Color a little. Create a lot.
        </p>
        <FloatingElement className="-top-4 right-1/4 hidden md:block">
          <Sparkle className="text-brand-orange w-8 h-8" />
        </FloatingElement>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow">
        {/* Tools Panel */}
        <div className="w-full lg:w-24 flex lg:flex-col gap-4 items-center bg-white rounded-full lg:rounded-[3rem] p-4 border-2 border-brand-blue-light shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] overflow-x-auto lg:overflow-visible">
          <button
            onClick={() => setIsEraser(false)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0",
              !isEraser
                ? "bg-brand-blue-light text-brand-blue"
                : "text-foreground/50 hover:bg-gray-100"
            )}
            title="Brush"
          >
            <Pen className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsEraser(true)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0",
              isEraser
                ? "bg-brand-orange-light text-brand-orange"
                : "text-foreground/50 hover:bg-gray-100"
            )}
            title="Eraser"
          >
            <Eraser className="w-6 h-6" />
          </button>

          <div className="w-px h-8 lg:w-8 lg:h-px bg-gray-200 shrink-0 my-1 lg:my-2"></div>

          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="w-12 h-12 rounded-full flex items-center justify-center text-foreground/50 hover:bg-gray-100 transition-colors shrink-0 disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="w-6 h-6" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="w-12 h-12 rounded-full flex items-center justify-center text-foreground/50 hover:bg-gray-100 transition-colors shrink-0 disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="w-6 h-6" />
          </button>
          <button
            onClick={clearCanvas}
            className="w-12 h-12 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
            title="Clear All"
          >
            <Trash2 className="w-6 h-6" />
          </button>

          <div className="mt-auto lg:mb-4 lg:w-full flex lg:justify-center shrink-0 ml-4 lg:ml-0">
            <button
              onClick={downloadCanvas}
              className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center hover:bg-[#3A649E] transition-colors shadow-sm"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-grow bg-[#FFFBF2] rounded-[3rem] border-4 border-brand-blue-light relative overflow-hidden flex flex-col">
          {/* The Canvas itself */}
          <div className="flex-grow flex items-center justify-center p-4 md:p-8 relative z-10">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-[300px] h-[315px] md:w-[400px] md:h-[420px] cursor-crosshair touch-none"
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

          {/* Color Palette */}
          <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 border-t-2 border-brand-blue-light flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 relative z-20">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider ml-2">
                Size: {brushSize}px
              </span>
              <input
                type="range"
                min="2"
                max="30"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full md:w-48 accent-brand-blue"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setActiveColor(c);
                    setIsEraser(false);
                  }}
                  className={cn(
                    "w-9 h-9 md:w-11 md:h-11 rounded-full border-4 transition-transform",
                    activeColor === c && !isEraser
                      ? "border-gray-400 scale-110 shadow-sm"
                      : "border-transparent hover:scale-110"
                  )}
                  style={{
                    backgroundColor: c,
                    boxShadow:
                      c === "#ffffff"
                        ? "inset 0 0 0 1px #e5e7eb"
                        : undefined,
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
