"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CHAT_POLL_INTERVAL_MS,
  type AdminThreadSummary,
  type ChatMessage,
  type ChatThread,
} from "@/lib/chat-types";

export type AdminKindFilter = "all" | "general" | "cart" | "order";

interface UseAdminChatResult {
  threads: AdminThreadSummary[];
  thread: ChatThread | null;
  messages: ChatMessage[];
  loadingThreads: boolean;
  loadingMessages: boolean;
  error: string | null;
  filter: AdminKindFilter;
  setFilter: (filter: AdminKindFilter) => void;
  selectThread: (threadId: number) => Promise<void>;
  send: (body: string) => Promise<void>;
  setStatus: (status: "open" | "closed") => Promise<void>;
  reloadThreads: () => Promise<void>;
}

/**
 * Mengelola panel chat admin: daftar percakapan, percakapan aktif,
 * polling pesan baru, membalas, dan menutup percakapan.
 */
export function useAdminChat(): UseAdminChatResult {
  const [threads, setThreads] = useState<AdminThreadSummary[]>([]);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AdminKindFilter>("all");

  const threadIdRef = useRef<number | null>(null);
  const lastIdRef = useRef<number | undefined>(undefined);

  /** Muat daftar percakapan. */
  const reloadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const query = filter === "all" ? "" : `?kind=${filter}`;
      const res = await fetch(`/api/chat/admin/threads${query}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { threads?: AdminThreadSummary[] };
      setThreads(data.threads ?? []);
    } catch {
      /* diamkan */
    } finally {
      setLoadingThreads(false);
    }
  }, [filter]);

  useEffect(() => {
    // Ditunda agar setState di dalam reloadThreads tidak berjalan sinkron
    // langsung di dalam effect (menghindari cascading render).
    const id = setTimeout(() => void reloadThreads(), 0);
    return () => clearTimeout(id);
  }, [reloadThreads]);

  const applyMessages = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const merged = new Map(prev.map((m) => [m.id, m]));
      for (const message of incoming) merged.set(message.id, message);
      const list = [...merged.values()].sort((a, b) => a.id - b.id);
      lastIdRef.current = list.length > 0 ? list[list.length - 1].id : undefined;
      return list;
    });
  }, []);

  /** Buka satu percakapan dan tandai sudah dibaca. */
  const selectThread = useCallback(async (threadId: number) => {
    setLoadingMessages(true);
    setError(null);
    threadIdRef.current = threadId;

    try {
      const res = await fetch(`/api/chat/admin/threads/${threadId}`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { thread?: ChatThread; messages?: ChatMessage[]; message?: string }
        | null;

      if (!res.ok || !data?.thread) {
        setError(data?.message || "Percakapan tidak dapat dibuka.");
        return;
      }

      setThread(data.thread);
      const list = (data.messages ?? []).sort((a, b) => a.id - b.id);
      setMessages(list);
      lastIdRef.current = list.length > 0 ? list[list.length - 1].id : undefined;

      // Tandai dibaca → badge di daftar ikut berkurang.
      await fetch(`/api/chat/admin/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }).catch(() => {});

      setThreads((prev) =>
        prev.map((item) => (item.id === threadId ? { ...item, unread_for_admin: 0 } : item))
      );
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  /** Polling pesan baru pada percakapan aktif. */
  const poll = useCallback(async () => {
    const threadId = threadIdRef.current;
    if (threadId === null) return;

    try {
      const after = lastIdRef.current;
      const url =
        after !== undefined
          ? `/api/chat/admin/threads/${threadId}?after=${after}`
          : `/api/chat/admin/threads/${threadId}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;

      const data = (await res.json()) as { messages?: ChatMessage[] };
      const incoming = data.messages ?? [];
      applyMessages(incoming);

      if (incoming.length > 0) {
        await fetch(`/api/chat/admin/threads/${threadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        }).catch(() => {});
      }
    } catch {
      /* coba lagi di polling berikutnya */
    }
  }, [applyMessages]);

  useEffect(() => {
    if (!thread) return;
    const id = setInterval(() => void poll(), CHAT_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [thread, poll]);

  /** Balas sebagai admin. */
  const send = useCallback(
    async (body: string) => {
      const threadId = threadIdRef.current;
      if (threadId === null) return;

      setError(null);
      try {
        const res = await fetch(`/api/chat/admin/threads/${threadId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });

        const data = (await res.json().catch(() => null)) as
          | { message?: ChatMessage | string }
          | null;

        if (!res.ok) {
          setError(typeof data?.message === "string" ? data.message : "Pesan gagal dikirim.");
          return;
        }

        if (data?.message && typeof data.message === "object") {
          applyMessages([data.message]);
          await reloadThreads();
        }
      } catch {
        setError("Tidak dapat mengirim pesan.");
      }
    },
    [applyMessages, reloadThreads]
  );

  /** Tutup / buka kembali percakapan. */
  const setStatus = useCallback(
    async (status: "open" | "closed") => {
      const threadId = threadIdRef.current;
      if (threadId === null) return;

      try {
        await fetch(`/api/chat/admin/threads/${threadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        setThread((prev) => (prev ? { ...prev, status } : prev));
        await reloadThreads();
      } catch {
        setError("Gagal mengubah status percakapan.");
      }
    },
    [reloadThreads]
  );

  return {
    threads,
    thread,
    messages,
    loadingThreads,
    loadingMessages,
    error,
    filter,
    setFilter,
    selectThread,
    send,
    setStatus,
    reloadThreads,
  };
}
