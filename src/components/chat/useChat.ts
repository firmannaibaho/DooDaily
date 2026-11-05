"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHAT_POLL_INTERVAL_MS,
  type ChatMessage,
  type ChatThread,
} from "@/lib/chat-types";

/** Konteks percakapan yang bisa dibuka user. */
export type ChatContext =
  | { kind: "general" }
  | { kind: "cart" }
  | { kind: "order"; orderId: string };

interface UseChatResult {
  thread: ChatThread | null;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  open: (context: ChatContext) => Promise<void>;
  send: (body: string) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/** Ambil pesan terakhir (id terbesar) untuk polling incremental. */
function lastId(messages: ChatMessage[]): number | undefined {
  return messages.length > 0 ? messages[messages.length - 1].id : undefined;
}

/**
 * Mengelola satu percakapan aktif: memuat thread, polling pesan baru,
 * mengirim pesan, dan menandai sudah dibaca.
 */
export function useChat(): UseChatResult {
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref agar interval polling selalu membaca nilai terbaru tanpa reset.
  const threadIdRef = useRef<number | null>(null);
  const lastIdRef = useRef<number | undefined>(undefined);

  const applyMessages = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const merged = new Map(prev.map((m) => [m.id, m]));
      for (const message of incoming) merged.set(message.id, message);
      const list = [...merged.values()].sort((a, b) => a.id - b.id);
      lastIdRef.current = lastId(list);
      return list;
    });
  }, []);

  const markRead = useCallback(async (threadId: number) => {
    try {
      await fetch(`/api/chat/threads/${threadId}`, { method: "PATCH" });
    } catch {
      /* diamkan: bukan aksi kritis */
    }
  }, []);

  /** Muat pesan baru saja (dipakai polling). */
  const poll = useCallback(async () => {
    const threadId = threadIdRef.current;
    if (threadId === null) return;

    try {
      const after = lastIdRef.current;
      const url =
        after !== undefined
          ? `/api/chat/threads/${threadId}?after=${after}`
          : `/api/chat/threads/${threadId}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;

      const data = (await res.json()) as { messages?: ChatMessage[] };
      applyMessages(data.messages ?? []);
      if ((data.messages ?? []).length > 0) void markRead(threadId);
    } catch {
      /* jaringan sesaat: coba lagi di polling berikutnya */
    }
  }, [applyMessages, markRead]);

  /** Buka percakapan sesuai konteks. */
  const open = useCallback(
    async (context: ChatContext) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            context.kind === "order"
              ? { kind: "order", order_id: context.orderId }
              : { kind: context.kind }
          ),
        });

        const data = (await res.json().catch(() => null)) as
          | { thread?: ChatThread; messages?: ChatMessage[]; message?: string }
          | null;

        if (!res.ok || !data?.thread) {
          setError(data?.message || "Percakapan belum bisa dibuka.");
          setThread(null);
          setMessages([]);
          threadIdRef.current = null;
          lastIdRef.current = undefined;
          return;
        }

        setThread(data.thread);
        const list = (data.messages ?? []).sort((a, b) => a.id - b.id);
        setMessages(list);
        threadIdRef.current = data.thread.id;
        lastIdRef.current = lastId(list);

        void markRead(data.thread.id);
      } catch {
        setError("Tidak dapat menghubungi server.");
      } finally {
        setLoading(false);
      }
    },
    [markRead]
  );

  /** Kirim pesan dan tambahkan ke daftar tanpa menunggu polling. */
  const send = useCallback(
    async (body: string) => {
      const threadId = threadIdRef.current;
      if (threadId === null) return;

      setSending(true);
      setError(null);

      try {
        const res = await fetch(`/api/chat/threads/${threadId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });

        const data = (await res.json().catch(() => null)) as
          | { message?: ChatMessage | string }
          | null;

        if (!res.ok) {
          setError(
            typeof data?.message === "string" ? data.message : "Pesan gagal dikirim."
          );
          return;
        }

        if (data?.message && typeof data.message === "object") {
          applyMessages([data.message]);
        }
      } catch {
        setError("Tidak dapat mengirim pesan.");
      } finally {
        setSending(false);
      }
    },
    [applyMessages]
  );

  const refresh = useCallback(async () => {
    await poll();
  }, [poll]);

  const reset = useCallback(() => {
    setThread(null);
    setMessages([]);
    setError(null);
    threadIdRef.current = null;
    lastIdRef.current = undefined;
  }, []);

  // Polling selama ada thread aktif.
  useEffect(() => {
    if (!thread) return;
    const id = setInterval(() => void poll(), CHAT_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [thread, poll]);

  return { thread, messages, loading, sending, error, open, send, refresh, reset };
}
