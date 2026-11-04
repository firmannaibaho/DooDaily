"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, LockOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CHAT_KIND_META, type AdminThreadSummary } from "@/lib/chat-types";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useAdminChat, type AdminKindFilter } from "@/components/chat/useAdminChat";

const FILTERS: { id: AdminKindFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "general", label: "🟢 Umum" },
  { id: "cart", label: "🛒 Keranjang" },
  { id: "order", label: "📦 Pesanan" },
];

/** Waktu relatif singkat, mis. "5 mnt lalu". */
function relativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return `${Math.floor(diffHour / 24)} hari lalu`;
}

export default function AdminChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-blue border-t-transparent" />
        </div>
      }
    >
      <AdminChatContent />
    </Suspense>
  );
}

function AdminChatContent() {
  const {
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
  } = useAdminChat();

  const [showListOnMobile, setShowListOnMobile] = useState(true);
  const searchParams = useSearchParams();
  const orderFromQuery = searchParams.get("order");

  // Buka percakapan pertama otomatis (desktop).
  useEffect(() => {
    if (thread || threads.length === 0) return;
    const id = setTimeout(() => void selectThread(threads[0].id), 0);
    return () => clearTimeout(id);
  }, [thread, threads, selectThread]);

  // Datang dari /admin/orders?order=DDL-xxx → lompat ke percakapan itu.
  useEffect(() => {
    if (!orderFromQuery || threads.length === 0 || thread) return;
    const match = threads.find((item) => item.order_id === orderFromQuery);
    if (!match) return;

    // Ditunda agar tidak memicu cascading render langsung di dalam effect.
    const id = setTimeout(() => {
      setShowListOnMobile(false);
      void selectThread(match.id);
    }, 0);
    return () => clearTimeout(id);
  }, [orderFromQuery, threads, thread, selectThread]);

  const openThread = (item: AdminThreadSummary) => {
    setShowListOnMobile(false);
    void selectThread(item.id);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="icon" aria-label="Kembali ke dashboard">
            <ArrowLeft className="w-5 h-5 text-brand-blue" />
          </Button>
        </Link>
        <h1 className="font-display text-2xl text-brand-blue">Pesan Masuk</h1>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 ml-auto"
          onClick={() => void reloadThreads()}
        >
          <RefreshCw className={cn("w-4 h-4", loadingThreads && "animate-spin")} />
          Muat ulang
        </Button>
      </div>

      {/* Filter konteks */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border",
              filter === item.id
                ? "bg-brand-blue text-white border-brand-blue"
                : "bg-white text-foreground/60 border-line hover:bg-brand-blue-light hover:text-brand-blue"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[18rem_1fr] h-[72vh]">
        {/* Daftar percakapan */}
        <aside
          className={cn(
            "bg-white rounded-[1.5rem] border border-line overflow-y-auto",
            !showListOnMobile && "hidden md:block"
          )}
        >
          {loadingThreads ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-blue border-t-transparent" />
            </div>
          ) : threads.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm font-medium text-foreground/40">
              Belum ada pesan masuk.
            </p>
          ) : (
            threads.map((item) => {
              const meta = CHAT_KIND_META[item.kind];
              const isActive = thread?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openThread(item)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-line/60 transition-colors",
                    isActive ? "bg-brand-blue-light/60" : "hover:bg-[#FFFBF2]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {(item.user_name || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{item.user_name}</p>
                      <p className="text-[11px] font-medium text-foreground/45 truncate">
                        {meta.icon} {item.subject || meta.title}
                      </p>
                    </div>
                    {item.unread_for_admin > 0 && (
                      <span className="bg-brand-orange text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shrink-0">
                        {item.unread_for_admin}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-foreground/55 truncate flex-1">
                      {item.last_message_preview || "Belum ada pesan"}
                    </p>
                    <span className="text-[10px] font-bold text-foreground/35 shrink-0">
                      {relativeTime(item.last_message_at)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </aside>

        {/* Panel percakapan */}
        <section
          className={cn(
            "bg-[#FFFBF2] rounded-[1.5rem] border border-line flex flex-col overflow-hidden",
            showListOnMobile && "hidden md:flex"
          )}
        >
          {!thread ? (
            <div className="flex-1 flex items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-foreground/40">
                Pilih percakapan di sebelah kiri.
              </p>
            </div>
          ) : (
            <>
              {/* Header percakapan */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-white">
                <button
                  type="button"
                  className="md:hidden text-brand-blue font-bold text-lg leading-none"
                  onClick={() => setShowListOnMobile(true)}
                  aria-label="Kembali ke daftar"
                >
                  ‹
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">
                    {CHAT_KIND_META[thread.kind].icon} {thread.subject || "Percakapan"}
                  </p>
                  <p className="text-[11px] font-medium text-foreground/45 truncate">
                    {thread.order_id ? `Pesanan ${thread.order_id}` : `Thread #${thread.id}`}
                    {" · "}
                    {thread.status === "open" ? "Terbuka" : "Ditutup"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => void setStatus(thread.status === "open" ? "closed" : "open")}
                >
                  {thread.status === "open" ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Tutup
                    </>
                  ) : (
                    <>
                      <LockOpen className="w-3.5 h-3.5" /> Buka
                    </>
                  )}
                </Button>
              </div>

              <ChatMessageList
                messages={messages}
                ownRole="admin"
                loading={loadingMessages}
                className="flex-1 min-h-0"
                emptyText="Belum ada pesan pada percakapan ini."
              />

              <div className="px-3 pb-3">
                {error && (
                  <p className="mb-2 text-[11px] font-bold text-red-600 leading-snug">{error}</p>
                )}
                {thread.status === "closed" ? (
                  <p className="text-center text-xs font-bold text-foreground/40 py-2">
                    Percakapan sudah ditutup. Buka kembali untuk membalas.
                  </p>
                ) : (
                  <ChatComposer onSend={send} placeholder="Balas sebagai admin…" />
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
