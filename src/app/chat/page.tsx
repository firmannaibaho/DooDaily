"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CHAT_KIND_META, type ChatThread } from "@/lib/chat-types";
import { ChatShell } from "@/components/chat/ChatShell";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useChat, type ChatContext } from "@/components/chat/useChat";

/**
 * Halaman chat layar penuh untuk user.
 * Dibuka dari tombol "perbesar" di ChatWidget (tidak ada di Navbar).
 */
export default function ChatPage() {
  const { status } = useSession();
  const router = useRouter();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [context, setContext] = useState<ChatContext>({ kind: "general" });

  const { thread, messages, loading, error, open, send } = useChat();

  // Belum login → arahkan ke halaman login.
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/threads", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { threads?: ChatThread[] };
      setThreads(data.threads ?? []);
    } catch {
      /* diamkan */
    }
  }, []);

  const openContext = useCallback(
    (next: ChatContext) => {
      setContext(next);
      void open(next).then(loadThreads);
    },
    [open, loadThreads]
  );

  // Buka percakapan umum saat pertama kali.
  useEffect(() => {
    if (status !== "authenticated") return;
    void open({ kind: "general" }).then(loadThreads);
  }, [status, open, loadThreads]);

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  const orderThreads = threads.filter((t) => t.kind === "order");

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Kembali">
          <ArrowLeft className="w-5 h-5 text-brand-blue" />
        </Button>
        <h1 className="font-display text-2xl text-brand-blue">Percakapan Saya</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-[15rem_1fr] h-[70vh]">
        {/* Sidebar konteks */}
        <aside className="bg-white rounded-[1.5rem] border border-line p-2 overflow-y-auto">
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground/40">
            Umum
          </p>
          {(["general", "cart"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => openContext({ kind })}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors",
                context.kind === kind
                  ? "bg-brand-blue text-white"
                  : "text-foreground/70 hover:bg-brand-blue-light hover:text-brand-blue"
              )}
            >
              {CHAT_KIND_META[kind].icon} {CHAT_KIND_META[kind].title}
            </button>
          ))}

          <p className="px-3 py-2 mt-2 text-[11px] font-bold uppercase tracking-wider text-foreground/40">
            Pesanan
          </p>
          {orderThreads.length === 0 ? (
            <p className="px-3 py-2 text-xs font-medium text-foreground/35">Belum ada</p>
          ) : (
            orderThreads.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  item.order_id && openContext({ kind: "order", orderId: item.order_id })
                }
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors truncate",
                  context.kind === "order" &&
                    context.orderId === item.order_id &&
                    "bg-brand-blue text-white"
                )}
              >
                {CHAT_KIND_META.order.icon} {item.order_id}
              </button>
            ))
          )}
        </aside>

        {/* Panel percakapan */}
        <ChatShell
          fullscreen
          title={thread?.subject || CHAT_KIND_META[context.kind].title}
          subtitle={thread ? `Percakapan #${thread.id}` : undefined}
          badge={<span aria-hidden>{CHAT_KIND_META[context.kind].icon}</span>}
          onClose={() => router.push("/")}
          footer={
            <div>
              {error && (
                <p className="mb-2 text-xs font-bold text-red-600 leading-snug">{error}</p>
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
            className="flex-1 min-h-0"
            emptyText="Belum ada pesan. Tanya apa saja soal produk atau pesananmu."
          />
        </ChatShell>
      </div>
    </div>
  );
}
