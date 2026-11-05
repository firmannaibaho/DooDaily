"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat-types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  /** Sisi tempat bubble user berada (default: kanan). */
  ownRole?: "user" | "admin";
  /** Tampilkan status kosong. */
  emptyText?: string;
  /** Tinggi area daftar pesan. */
  className?: string;
  loading?: boolean;
}

/** Format jam singkat, mis. 14:05. */
function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Daftar bubble pesan. Murni presentational — tidak melakukan fetch.
 * Auto-scroll ke bawah setiap ada pesan baru.
 */
export function ChatMessageList({
  messages,
  ownRole = "user",
  emptyText = "Belum ada pesan. Mulai percakapan dengan admin.",
  className,
  loading = false,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-10", className)}>
        <div className="animate-spin rounded-full h-7 w-7 border-4 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center px-6 py-10 text-center", className)}>
        <p className="text-sm font-medium text-foreground/40">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2.5 overflow-y-auto px-1 py-3", className)}>
      {messages.map((message) => {
        const isOwn = message.sender_role === ownRole;

        return (
          <div
            key={message.id}
            className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2 border",
                isOwn
                  ? "bg-brand-blue text-white border-brand-blue rounded-br-md"
                  : "bg-white text-foreground border-line rounded-bl-md"
              )}
            >
              <p className="text-sm font-medium whitespace-pre-wrap break-words">{message.body}</p>
              <p
                className={cn(
                  "mt-1 text-[10px] font-bold text-right",
                  isOwn ? "text-white/60" : "text-foreground/35"
                )}
              >
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
