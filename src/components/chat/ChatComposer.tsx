"use client";

import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { MAX_CHAT_BODY_LENGTH, sanitizeChatBody } from "@/lib/chat-types";

interface ChatComposerProps {
  onSend: (body: string) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Input pesan chat. Enter mengirim, Shift+Enter membuat baris baru.
 * Validasi panjang memakai aturan yang sama dengan API (sanitizeChatBody),
 * jadi user tidak bisa mengirim pesan yang pasti ditolak server.
 */
export function ChatComposer({
  onSend,
  disabled = false,
  placeholder = "Tulis pesan…",
  className,
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const canSend = !disabled && !sending && sanitizeChatBody(value).length > 0;

  const submit = async () => {
    const body = sanitizeChatBody(value);
    if (!body || sending || disabled) return;

    setSending(true);
    try {
      await onSend(body);
      setValue("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className={cn("flex items-end gap-2 border-t border-line pt-3", className)}>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        maxLength={MAX_CHAT_BODY_LENGTH}
        disabled={disabled || sending}
        aria-label="Tulis pesan"
        className="flex-1 resize-none max-h-28 min-h-11 rounded-2xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-foreground/35 focus:border-brand-blue focus:outline-none disabled:opacity-60"
      />
      <Button
        type="button"
        size="icon"
        onClick={() => void submit()}
        disabled={!canSend}
        aria-label="Kirim pesan"
        className="shrink-0 h-11 w-11 rounded-full"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </div>
  );
}
