"use client";

/**
 * Jembatan sederhana antara tombol "Tanya Admin" dan ChatWidget.
 *
 * Tombol dan widget berada di pohon komponen berbeda (tombol di dalam
 * halaman, widget di layout), jadi tidak bisa berbagi props. Event bus
 * di jendela browser menghindari menambah Context provider global.
 */

export type ChatContextKind = "general" | "cart" | "order";

export interface ChatOpenDetail {
  kind: ChatContextKind;
  orderId?: string;
}

const EVENT_NAME = "doodaily:open-chat";

/** Minta widget chat terbuka pada konteks tertentu. */
export function openChatWidget(detail: ChatOpenDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ChatOpenDetail>(EVENT_NAME, { detail }));
}

/** Berlangganan permintaan membuka chat. Mengembalikan fungsi unsubscribe. */
export function onOpenChat(handler: (detail: ChatOpenDetail) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) => {
    const custom = event as CustomEvent<ChatOpenDetail>;
    if (custom.detail) handler(custom.detail);
  };

  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
