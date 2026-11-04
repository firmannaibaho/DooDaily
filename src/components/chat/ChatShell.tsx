"use client";

import React, { ReactNode } from "react";
import { X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatShellProps {
  title: string;
  subtitle?: string;
  /** Badge kecil di header, mis. ikon konteks. */
  badge?: ReactNode;
  onClose: () => void;
  /** Bila diisi, tombol "perbesar" ditampilkan. */
  onExpand?: () => void;
  /** Bar di bawah header, mis. tab konteks. */
  toolbar?: ReactNode;
  /** Isi utama (daftar pesan). */
  children: ReactNode;
  /** Bagian bawah (composer). */
  footer?: ReactNode;
  className?: string;
  /** true → tampilan layar penuh (halaman /chat). */
  fullscreen?: boolean;
}

/**
 * Kerangka panel chat: header + toolbar + isi + footer.
 * Murni presentational; semua data & aksi diberikan lewat props.
 */
export function ChatShell({
  title,
  subtitle,
  badge,
  onClose,
  onExpand,
  toolbar,
  children,
  footer,
  className,
  fullscreen = false,
}: ChatShellProps) {
  return (
    <div
      role="dialog"
      aria-label={title}
      className={cn(
        "flex flex-col bg-[#FFFBF2] border border-line overflow-hidden",
        fullscreen
          ? "w-full h-full rounded-[1.5rem]"
          : "w-[calc(100vw-2rem)] max-w-[22rem] sm:max-w-[24rem] h-[min(32rem,calc(100vh-6rem))] rounded-[1.5rem]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 bg-brand-blue text-white px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {badge}
            <h2 className="font-display text-base leading-tight truncate">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-[11px] font-medium text-white/70 truncate mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              aria-label="Perbesar percakapan"
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup percakapan"
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar (tab konteks) */}
      {toolbar && <div className="border-b border-line bg-white/60 px-2 py-1.5">{toolbar}</div>}

      {/* Isi */}
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>

      {/* Footer */}
      {footer && <div className="px-3 pb-3">{footer}</div>}
    </div>
  );
}
