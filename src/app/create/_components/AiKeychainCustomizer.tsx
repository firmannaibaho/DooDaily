"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FloatingElement } from "@/components/stickers/FloatingElement";
import { Sparkle } from "@/components/stickers/Decorations";
import {
  Loader2,
  RefreshCcw,
  ShoppingBag,
  Download,
  Check,
  AlertCircle,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { OBJECT_PRESETS, DEFAULT_PRESET_ID, getPreset } from "@/lib/ai/keychain-presets";
import { MAX_DESCRIPTION_LENGTH } from "@/lib/ai/prompt-builder";

const PRICE = 10000;
/** Selaras dengan budget retry di server (5 menit). */
const MAX_WAIT_SECONDS = 5 * 60;

type ServiceStatus = "checking" | "online" | "offline";

interface GenerateError {
  code: string;
  message: string;
}

export default function CustomizePage() {
  const [description, setDescription] = useState("");
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [status, setStatus] = useState<ServiceStatus>("checking");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<GenerateError | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [attemptInfo, setAttemptInfo] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { addItem } = useCart();
  const selectedPreset = getPreset(presetId);

  /* - status layanan (cukup Online / Offline) - */
  const checkStatus = useCallback(async () => {
    setStatus("checking");
    try {
      const res = await fetch("/api/ai/status", { cache: "no-store" });
      const data = (await res.json()) as { status?: string };
      setStatus(data.status === "online" ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    // Ditunda agar tidak memicu cascading render langsung di dalam effect.
    const id = setTimeout(() => void checkStatus(), 0);
    return () => clearTimeout(id);
  }, [checkStatus]);



  /* - generate - */
  const handleGenerate = async () => {
    if (isGenerating) return;

    const trimmed = description.trim();
    if (trimmed.length < 3) {
      setError({ code: "EMPTY", message: "Tuliskan dulu objek yang ingin dibuat (minimal 3 karakter)." });
      return;
    }
    setAttemptInfo(null);

    setError(null);
    setAdded(false);
    setResult(null);
    setIsGenerating(true);
    setElapsedSec(0);

    timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);

    try {
      const res = await fetch("/api/ai/keychain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed, presetId }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        image?: string;
        code?: string;
        message?: string;
      };

      if (!data.ok || !data.image) {
        setError({
          code: data.code || "UNKNOWN",
          message: data.message || "Gagal membuat gambar. Coba lagi.",
        });
        if (data.code === "UPSTREAM_ERROR" || data.code === "NETWORK_ERROR") {
          void checkStatus();
        }
        return;
      }

      setResult(data.image);
      const tries = (data as { attempts?: number }).attempts;
      if (typeof tries === "number" && tries > 1) {
        setAttemptInfo(`Berhasil setelah ${tries} percobaan (menunggu antrean layanan).`);
      }
    } catch {
      setError({ code: "NETWORK", message: "Koneksi bermasalah. Periksa jaringan lalu coba lagi." });
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsGenerating(false);
    }
  };

  /* - pakai gambar - keranjang - */
  const handleUseImage = () => {
    if (!result) return;

    addItem({
      productId: Date.now(),
      name: `Custom AI Keychain - ${selectedPreset.label}`,
      price: PRICE,
      image: result,
      customizations: [`Gaya: ${selectedPreset.label}`, `Objek: ${description.trim()}`],
    });

    setAdded(true);
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    const ext = result.startsWith("data:image/jpeg") ? "jpg" : "png";
    link.href = result;
    link.download = `doodaily-keychain-${presetId}.${ext}`;
    link.click();
  };

  const isOnline = status === "online";
  const canGenerate = !isGenerating && description.trim().length >= 3 && isOnline;


  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* ── Header ringkas + status ─────────────────────────── */}
      <div className="relative text-center mb-8">
        <FloatingElement className="-top-6 left-[18%] hidden lg:block">
          <Sparkle className="text-brand-orange w-8 h-8" />
        </FloatingElement>

        <h1 className="font-display text-4xl md:text-5xl text-brand-blue leading-tight mb-2">
          Make It Yours!
        </h1>
        <p className="text-base text-foreground/60 font-medium max-w-xl mx-auto">
          Tulis objeknya, pilih gayanya — gantungan kunci akriliknya tetap tampil realistis.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-line text-xs font-bold">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              status === "checking" && "bg-gray-300 animate-pulse",
              isOnline && "bg-green-500",
              status === "offline" && "bg-red-500"
            )}
          />
          <span
            className={cn(
              isOnline ? "text-green-600" : status === "offline" ? "text-red-500" : "text-foreground/50"
            )}
          >
            {status === "checking" ? "Memeriksa…" : isOnline ? "Online" : "Offline"}
          </span>
          {status === "offline" && (
            <button
              type="button"
              onClick={() => void checkStatus()}
              className="text-brand-blue underline underline-offset-2"
            >
              Coba lagi
            </button>
          )}
        </div>
      </div>

      {/* ── Dua kolom sejajar: form (kiri) + hasil (kanan) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ═══ KIRI: form dalam satu kartu ════════════════════ */}
        <div className="bg-white rounded-[2rem] border border-line p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] flex flex-col">
          {/* 1. Deskripsi objek */}
          <section className="mb-6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-7 h-7 shrink-0 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="font-display text-xl text-brand-blue">Apa yang mau kamu buat?</h2>
            </div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
              rows={3}
              placeholder="Contoh: kucing hitam putih sedang memeluk ikan pink"
              className="w-full p-3.5 rounded-xl border border-line focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/15 font-medium bg-white resize-none transition-all text-sm"
            />

            <div className="flex justify-end">
              <span className="text-[11px] text-foreground/40 font-medium">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </section>

          {/* 2. Gaya objek */}
          <section className="mb-6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-7 h-7 shrink-0 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h2 className="font-display text-xl text-brand-blue">Pilih gaya objek</h2>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {OBJECT_PRESETS.map((preset) => {
                const active = preset.id === presetId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.hint}
                    onClick={() => setPresetId(preset.id)}
                    className={cn(
                      "relative px-1 py-2.5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-0.5 bg-white",
                      active
                        ? "border-brand-orange shadow-[0_0_0_3px_rgba(245,160,58,0.16)]"
                        : "border-line hover:border-line-strong"
                    )}
                  >
                    <span className="text-lg leading-none">{preset.emoji}</span>
                    <span className="text-[10px] font-bold text-foreground/75 leading-tight text-center">
                      {preset.label}
                    </span>
                    {active && (
                      <span className="absolute -top-1.5 -right-1.5 bg-brand-orange text-white rounded-full p-0.5 border-2 border-white">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Generate */}
          <section className="mt-auto pt-5 border-t border-line">
            <Button
              size="lg"
              onClick={() => void handleGenerate()}
              disabled={!canGenerate}
              className="w-full h-14 text-base gap-2.5"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Membuat… {elapsedSec}s
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Buat Gambar
                </>
              )}
            </Button>

            <p className="text-[11px] text-foreground/45 font-medium text-center mt-2.5">
              {!isOnline
                ? "Layanan AI sedang offline."
                : isGenerating
                  ? `Otomatis dicoba ulang bila ramai (maks ${MAX_WAIT_SECONDS / 60} menit).`
                  : "Sekali buat biasanya 15-30 detik."}
            </p>

            {attemptInfo && !error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-medium">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{attemptInfo}</p>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error.message}</p>
              </div>
            )}
          </section>
        </div>

        {/* ═══ KANAN: hasil ═══════════════════════════════════ */}
        <div className="bg-white rounded-[2rem] border border-line p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-display text-xl text-brand-blue">Hasil</h2>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFFBF2] text-foreground/60 border border-line whitespace-nowrap">
              {selectedPreset.emoji} {selectedPreset.label}
            </span>
          </div>

          <div className="relative aspect-square rounded-[1.5rem] bg-[#FFFBF2] border border-dashed border-line overflow-hidden flex items-center justify-center">
            {isGenerating && (
              <div className="flex flex-col items-center gap-2.5 text-brand-blue">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="font-bold text-sm">Sedang menggambar… {elapsedSec}s</p>
              </div>
            )}

            {!isGenerating && result && (
              /* eslint-disable-next-line @next/next/no-img-element -- data URI hasil AI */
              <img
                src={result}
                alt={`Keychain ${selectedPreset.label}`}
                className="absolute inset-0 w-full h-full object-contain p-3"
              />
            )}

            {!isGenerating && !result && (
              <div className="text-center px-6 text-foreground/35">
                <Sparkle className="w-9 h-9 mx-auto mb-2 text-brand-blue-light" />
                <p className="font-medium text-sm">Hasil gambarmu muncul di sini</p>
              </div>
            )}
          </div>

          {result ? (
            <div className="mt-4 space-y-2.5">
              <Button onClick={handleUseImage} disabled={added} className="w-full h-12 text-base gap-2">
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Sudah ditambahkan
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Pakai gambar ini · Rp {PRICE.toLocaleString("id-ID")}
                  </>
                )}
              </Button>

              <div className="flex gap-2.5">
                <Button variant="outline" onClick={handleDownload} className="flex-1 rounded-full gap-2 text-sm">
                  <Download className="w-4 h-4" /> Unduh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void handleGenerate()}
                  disabled={!canGenerate}
                  className="flex-1 rounded-full gap-2 text-sm"
                >
                  <RefreshCcw className="w-4 h-4" /> Buat ulang
                </Button>
              </div>

              {added && (
                <p className="text-center text-xs font-bold">
                  <Link href="/cart" className="text-brand-blue underline underline-offset-4">
                    Lihat keranjang →
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-center text-xs text-foreground/40 font-medium">
              Rp {PRICE.toLocaleString("id-ID")} · akrilik 3 mm
            </p>
          )}
        </div>
      </div>
    </div>
  );
}



