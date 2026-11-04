"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAT_UNREAD_POLL_INTERVAL_MS, CHAT_KIND_META } from "@/lib/chat-types";
import { ChatShell } from "./ChatShell";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposer } from "./ChatComposer";
import { useChat, type ChatContext } from "./useChat";
import { onOpenChat } from "./chat-bus";

/**
 * Widget chat mengambang untuk user biasa.
 * Tidak ada menu "Chat" di Navbar — akses masuk lewat tombol bubble ini,
 * dan halaman penuh /chat dibuka dari tombol perbesar di dalam widget.
 */
export function ChatWidget() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [context, setContext] = useState<ChatContext>({ kind: "general" });

  const { thread, messages, loading, error, open, send } = useChat();

  const isLoggedIn = status === "authenticated";

  // Saat belum login, badge tidak ditampilkan (unread dari sesi sebelumnya diabaikan).
  const unreadCount = isLoggedIn ? unread : 0;

  // Muat unread berkala untuk badge.
  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/chat/unread", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled) setUnread(data.count ?? 0);
      } catch {
        /* diamkan */
      }
    };

    void load();
    const id = setInterval(() => void load(), CHAT_UNREAD_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isLoggedIn]);

  // Buka percakapan ketika panel dibuka / konteks berubah.
  const openContext = useCallback(
    (next: ChatContext) => {
      setContext(next);
      void open(next);
    },
    [open]
  );

  // Dengarkan permintaan dari tombol "Tanya Admin" (cart / pesanan).
  useEffect(() => {
    return onOpenChat((detail) => {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }
      setIsOpen(true);
      openContext(
        detail.kind === "order" && detail.orderId
          ? { kind: "order", orderId: detail.orderId }
          : { kind: detail.kind === "cart" ? "cart" : "general" }
      );
    });
  }, [isLoggedIn, openContext, router]);

  const handleToggle = () => {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) openContext({ kind: "general" });
  };

  // Sembunyikan di halaman admin (admin memakai /admin/chat).
  if (pathname.startsWith("/admin")) return null;

  const activeMeta = CHAT_KIND_META[context.kind];
  const subtitle =
    context.kind === "order" && thread?.order_id
      ? thread.subject
      : "Admin Doodaily biasanya membalas cepat";

  return (
    <>
      {/* Panel */}
      {isOpen && isLoggedIn && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <ChatShell
            title="Chat Admin"
            subtitle={subtitle}
            badge={<span aria-hidden>{activeMeta.icon}</span>}
            onClose={() => setIsOpen(false)}
            onExpand={() => {
              setIsOpen(false);
              router.push("/chat");
            }}
            toolbar={
              <div className="flex gap-1">
                {(["general", "cart"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => openContext({ kind })}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-bold transition-colors",
                      context.kind === kind
                        ? "bg-brand-blue text-white"
                        : "text-foreground/60 hover:bg-brand-blue-light hover:text-brand-blue"
                    )}
                  >
                    {CHAT_KIND_META[kind].icon} {CHAT_KIND_META[kind].label}
                  </button>
                ))}
                {context.kind === "order" && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-orange text-white">
                    {CHAT_KIND_META.order.icon} {thread?.order_id ?? "Pesanan"}
                  </span>
                )}
              </div>
            }
            footer={
              <div>
                {error && (
                  <p className="mb-2 text-[11px] font-bold text-red-600 leading-snug">{error}</p>
                )}
                <ChatComposer
                  onSend={send}
                  disabled={loading || !thread}
                  placeholder={loading ? "Memuat percakapan…" : "Tulis pesan…"}
                />
              </div>
            }
          >
            <ChatMessageList
              messages={messages}
              loading={loading}
              emptyText="Belum ada pesan. Tanya apa saja soal produk atau pesananmu."
              className="flex-1 min-h-0"
            />
          </ChatShell>
        </div>
      )}

      {/* Tombol bubble */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? "Tutup chat" : "Chat admin"}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-[0_6px_0_0_#2B4C7E]",
          "bg-brand-blue text-white flex items-center justify-center",
          "transition-all hover:shadow-[0_3px_0_0_#2B4C7E] hover:translate-y-[3px] active:shadow-none"
        )}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
