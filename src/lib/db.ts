import { supabase, SUPABASE_NOT_CONFIGURED_MESSAGE } from "./supabase";
import type {
  ChatMessage,
  ChatSenderRole,
  ChatThread,
  ChatThreadStatus,
  AdminThreadSummary,
  ChatKind,
} from "./chat-types";
import { buildPreview, STAFF_ROLES } from "./chat-types";

export interface DbUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  created_at: string;
}

export interface DbOrder {
  id: number;
  order_id: string;
  user_id: number | null;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  payment_method: string;
  items_json: string;
  subtotal: number;
  /** Ongkir TIDAK dihitung di aplikasi — lihat keterangan ongkir terpisah. */
  shipping: number;
  /** `total` = subtotal (harga keychain saja), tanpa ongkir. */
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "done" | "cancelled";
  /** Nama berkas bukti pembayaran di public/uploads/bukti/. */
  payment_proof?: string;
  result_image?: string;
  admin_notes?: string;
  created_at: string;
}

export interface DbTestimonial {
  id: number;
  customer_name: string;
  product_name: string;
  /** Opsional — sering kali gambar sudah memuat isi percakapan. */
  message: string;
  /** Nama berkas gambar testimoni di public/testimoni/, mis. "testimoni-1700000000-abc.jpg". */
  image_path: string;
  is_published: boolean;
  sort_order: number;
  created_by: number | null;
  created_at: string;
}

// ─── Helper ─────────────────────────────────────────────────────────────────

/**
 * Kembalikan client Supabase, atau lempar error yang mudah dibaca bila
 * kredensial belum diisi. Dipakai di semua query supaya tipe tetap sempit
 * (bukan `null`) dan pemanggil tidak perlu cek berulang.
 */
function requireClient() {
  if (!supabase) throw new Error(SUPABASE_NOT_CONFIGURED_MESSAGE);
  return supabase;
}

// ─── User Queries (Supabase Cloud) ──────────────────────────────────────────

export const userQueries = {
  findByEmail: async (email: string): Promise<DbUser | undefined> => {
    if (!supabase) return undefined;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("userQueries.findByEmail error:", error);
      return undefined;
    }
    return (data as DbUser) || undefined;
  },

  findById: async (id: number): Promise<DbUser | undefined> => {
    if (!supabase) return undefined;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("userQueries.findById error:", error);
      return undefined;
    }
    return (data as DbUser) || undefined;
  },

  create: async (
    name: string,
    email: string,
    password: string,
    role: string = "user"
  ): Promise<number> => {
    const { data, error } = await requireClient()
      .from("users")
      .insert([{ name, email, password, role }])
      .select("id")
      .single();


    if (error) {
      console.error("userQueries.create error:", error);
      throw error;
    }
    return Number(data.id);
  },
};

// ─── Order Queries (Supabase Cloud) ─────────────────────────────────────────

export const orderQueries = {
  create: async (
    order_id: string,
    user_id: number | null,
    customer_name: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    notes: string,
    payment_method: string,
    items_json: string,
    subtotal: number,
    shipping: number,
    total: number
  ): Promise<number> => {
    const { data, error } = await requireClient()
      .from("orders")
      .insert([
        {
          order_id,
          user_id,
          customer_name,
          email,
          phone,
          address,
          city,
          notes: notes || "",
          payment_method,
          items_json,
          subtotal,
          shipping,
          total,
          status: "pending",
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("orderQueries.create error:", error);
      throw error;
    }
    return Number(data.id);
  },

  /** Simpan nama berkas bukti pembayaran untuk satu pesanan. */
  updatePaymentProof: async (orderId: string, paymentProof: string): Promise<void> => {
    const { error } = await requireClient()
      .from("orders")
      .update({ payment_proof: paymentProof })
      .eq("order_id", orderId);

    if (error) {
      console.error("orderQueries.updatePaymentProof error:", error);
      throw error;
    }
  },

  findAll: async (): Promise<DbOrder[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("orderQueries.findAll error:", error);
      return [];
    }
    return (data as DbOrder[]) || [];
  },

  findByUserId: async (uid: number): Promise<DbOrder[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("orderQueries.findByUserId error:", error);
      return [];
    }
    return (data as DbOrder[]) || [];
  },

  findByOrderId: async (oid: string): Promise<DbOrder | undefined> => {
    if (!supabase) return undefined;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", oid)
      .maybeSingle();

    if (error) {
      console.error("orderQueries.findByOrderId error:", error);
      return undefined;
    }
    return (data as DbOrder) || undefined;
  },

  updateStatus: async (status: string, order_id: string): Promise<void> => {
    const { error } = await requireClient()
      .from("orders")
      .update({ status })
      .eq("order_id", order_id);

    if (error) {
      console.error("orderQueries.updateStatus error:", error);
      throw error;
    }
  },

  updateResult: async (
    order_id: string,
    result_image: string,
    admin_notes: string = ""
  ): Promise<void> => {
    const { error } = await requireClient()
      .from("orders")
      .update({ result_image, admin_notes })
      .eq("order_id", order_id);

    if (error) {
      console.error("orderQueries.updateResult error:", error);
      throw error;
    }
  },

  delete: async (order_id: string): Promise<void> => {
    const { error } = await requireClient()
      .from("orders")
      .delete()
      .eq("order_id", order_id);

    if (error) {
      console.error("orderQueries.delete error:", error);
      throw error;
    }
  },
};

// ─── Chat Queries ───────────────────────────────────────────────────────────
// Model: satu sistem, tiga konteks percakapan (general / cart / order).
// Tabel & constraint-nya didefinisikan di docs/RENCANA-CHAT-ADMIN.md bagian 4.

/**
 * Catatan: Supabase menyimpulkan tipe kolom dari string literal `select`.
 * Karena daftar kolom disimpan di konstanta, tipenya menjadi tidak pasti —
 * semua hasil dibaca lewat `as unknown as ChatThread`. Pemetaan kolom tetap
 * eksplisit di bawah supaya respons API tidak membawa field tak terduga.
 */
const THREAD_SELECT = "*";

export const chatQueries = {
  /* ── Pembuatan / pengambilan thread ──────────────────────────── */

  /**
   * Ambil thread `general` atau `cart` milik user; buat bila belum ada.
   * Keunikan dijamin partial unique index per (user_id, kind).
   */
  getOrCreateThread: async (
    userId: number,
    kind: Extract<ChatKind, "general" | "cart">
  ): Promise<ChatThread> => {
    const client = requireClient();

    const existing = await client
      .from("chat_threads")
      .select(THREAD_SELECT)
      .eq("user_id", userId)
      .eq("kind", kind)
      .maybeSingle();

    if (existing.error) {
      console.error("chatQueries.getOrCreateThread(read) error:", existing.error);
      throw existing.error;
    }
    if (existing.data) return existing.data as unknown as ChatThread;

    const created = await client
      .from("chat_threads")
      .insert([{ user_id: userId, kind, subject: kind === "cart" ? "Keranjang" : "Chat Umum" }])
      .select(THREAD_SELECT)
      .single();

    if (created.error) {
      // Bisa terjadi balapan: thread dibuat request lain → baca ulang.
      const retry = await client
        .from("chat_threads")
        .select(THREAD_SELECT)
        .eq("user_id", userId)
        .eq("kind", kind)
        .maybeSingle();
      if (retry.data) return retry.data as unknown as ChatThread;

      console.error("chatQueries.getOrCreateThread(insert) error:", created.error);
      throw created.error;
    }

    return created.data as unknown as ChatThread;
  },

  /**
   * Ambil thread untuk satu pesanan; buat bila belum ada.
   *
   * KENAPA `user_id` DIPAKSA BENAR:
   * Thread pesanan harus selalu menempel pada PEMILIK pesanan. Bila baris lama
   * (mis. dibuat saat alur masih memakai id lain) memuat `user_id` yang berbeda,
   * percakapan akan terbuka atas nama orang lain — admin membalas ke pembeli
   * yang salah. Baris seperti itu diperbaiki di sini, bukan dibiarkan.
   */
  getOrCreateOrderThread: async (userId: number, orderId: string): Promise<ChatThread> => {
    const client = requireClient();

    const existing = await client
      .from("chat_threads")
      .select(THREAD_SELECT)
      .eq("kind", "order")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing.error) {
      console.error("chatQueries.getOrCreateOrderThread(read) error:", existing.error);
      throw existing.error;
    }

    if (existing.data) {
      const thread = existing.data as unknown as ChatThread;

      // Perbaiki kepemilikan yang salah agar pesan masuk ke pembeli yang benar.
      if (Number(thread.user_id) !== Number(userId)) {
        console.warn(
          `chatQueries.getOrCreateOrderThread: thread #${thread.id} milik user ${thread.user_id}, ` +
            `seharusnya ${userId} (pesanan ${orderId}) — diperbaiki.`
        );
        const fixed = await client
          .from("chat_threads")
          .update({ user_id: userId, subject: `Pesanan ${orderId}` })
          .eq("id", thread.id)
          .select(THREAD_SELECT)
          .single();

        if (!fixed.error && fixed.data) return fixed.data as unknown as ChatThread;
        if (fixed.error) {
          console.error("chatQueries.getOrCreateOrderThread(fix owner) error:", fixed.error);
        }
      }

      return thread;
    }

    const created = await client
      .from("chat_threads")
      .insert([
        { user_id: userId, kind: "order", order_id: orderId, subject: `Pesanan ${orderId}` },
      ])
      .select(THREAD_SELECT)
      .single();

    if (created.error) {
      const retry = await client
        .from("chat_threads")
        .select(THREAD_SELECT)
        .eq("kind", "order")
        .eq("order_id", orderId)
        .maybeSingle();
      if (retry.data) return retry.data as unknown as ChatThread;

      console.error("chatQueries.getOrCreateOrderThread(insert) error:", created.error);
      throw created.error;
    }

    return created.data as unknown as ChatThread;
  },

  /** Ambil satu thread berdasarkan id (null bila tidak ada). */
  findThreadById: async (threadId: number): Promise<ChatThread | null> => {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("chat_threads")
      .select(THREAD_SELECT)
      .eq("id", threadId)
      .maybeSingle();

    if (error) {
      console.error("chatQueries.findThreadById error:", error);
      return null;
    }
    return (data as unknown as ChatThread) ?? null;
  },

  /** Semua thread milik user (terbaru di atas). */
  listThreadsForUser: async (userId: number): Promise<ChatThread[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("chat_threads")
      .select(THREAD_SELECT)
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.error("chatQueries.listThreadsForUser error:", error);
      return [];
    }
    return (data as unknown as ChatThread[]) ?? [];
  },

  /** Admin: semua thread + identitas user, bisa difilter. */
  listThreadsForAdmin: async (filter?: {
    kind?: ChatKind;
    status?: ChatThreadStatus;
  }): Promise<AdminThreadSummary[]> => {
    if (!supabase) return [];

    let query = supabase
      .from("chat_threads")
      .select(THREAD_SELECT)
      .order("last_message_at", { ascending: false })
      .limit(200);

    if (filter?.kind) query = query.eq("kind", filter.kind);
    if (filter?.status) query = query.eq("status", filter.status);

    const { data, error } = await query;

    if (error) {
      console.error("chatQueries.listThreadsForAdmin error:", error);
      return [];
    }

    const threads = (data as unknown as ChatThread[]) ?? [];
    if (threads.length === 0) return [];

    // Nama & email user diambil terpisah (bukan embedded join) supaya tidak
    // bergantung pada nama constraint FK yang dibuat otomatis oleh Postgres.
    const userIds = [...new Set(threads.map((t) => t.user_id))];
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", userIds);

    if (usersError) {
      console.error("chatQueries.listThreadsForAdmin(users) error:", usersError);
    }

    const byId = new Map(
      ((users as { id: number; name?: string | null; email?: string | null }[]) ?? []).map((u) => [
        Number(u.id),
        u,
      ])
    );

    return threads.map((thread) => {
      const owner = byId.get(Number(thread.user_id));
      return {
        ...thread,
        user_name: owner?.name ?? "Pengguna",
        user_email: owner?.email ?? "",
      } satisfies AdminThreadSummary;
    });
  },

  /** Tutup / buka kembali percakapan (admin). */
  setThreadStatus: async (threadId: number, status: ChatThreadStatus): Promise<void> => {
    const { error } = await requireClient()
      .from("chat_threads")
      .update({ status })
      .eq("id", threadId);

    if (error) {
      console.error("chatQueries.setThreadStatus error:", error);
      throw error;
    }
  },

  /** Atur apakah bot dijeda di thread ini (true = admin mengambil alih, false = bot aktif). */
  setBotPaused: async (threadId: number, paused: boolean): Promise<void> => {
    const { error } = await requireClient()
      .from("chat_threads")
      .update({ bot_paused: paused })
      .eq("id", threadId);

    if (error) {
      console.error("chatQueries.setBotPaused error:", error);
    }
  },

  /* ── Pesan ───────────────────────────────────────────────────── */

  /**
   * Riwayat pesan, urut lama → baru.
   * `afterId` dipakai polling untuk mengambil pesan baru saja.
   */
  listMessages: async (
    threadId: number,
    options?: { limit?: number; afterId?: number }
  ): Promise<ChatMessage[]> => {
    if (!supabase) return [];

    let query = supabase
      .from("chat_messages")
      .select("id, thread_id, sender_id, sender_role, body, read_at, created_at")
      .eq("thread_id", threadId)
      .order("id", { ascending: true })
      .limit(options?.limit ?? 100);

    if (options?.afterId !== undefined) query = query.gt("id", options.afterId);

    const { data, error } = await query;

    if (error) {
      console.error("chatQueries.listMessages error:", error);
      return [];
    }
    return (data as unknown as ChatMessage[]) ?? [];
  },

  /**
   * Simpan pesan baru.
   * Efek samping: perbarui last_message_at, preview, dan counter unread
   * milik penerima.
   */
  sendMessage: async (
    threadId: number,
    senderId: number | null,
    senderRole: ChatSenderRole,
    body: string
  ): Promise<ChatMessage> => {
    const client = requireClient();

    const inserted = await client
      .from("chat_messages")
      .insert([{ thread_id: threadId, sender_id: senderId, sender_role: senderRole, body }])
      .select("id, thread_id, sender_id, sender_role, body, read_at, created_at")
      .single();

    if (inserted.error) {
      console.error("chatQueries.sendMessage error:", inserted.error);
      throw inserted.error;
    }

    // Perbarui ringkasan thread. Counter penerima dihitung ulang dari tabel
    // (bukan read-modify-write) agar dua pesan yang hampir bersamaan tidak
    // saling menimpa nilai counter.
    //
    // CATATAN: yang dihitung adalah pesan dari LAWAN BICARA yang belum dibaca
    // oleh PENERIMA. Saat user mengirim → pesan user belum dibaca admin.
    // Saat admin/bot mengirim → pesan sisi toko belum dibaca user.
    const unread = await client
      .from("chat_messages")
      .select("id")
      .eq("thread_id", threadId)
      .in("sender_role", senderRole === "user" ? ["user"] : STAFF_ROLES)
      .filter("read_at", "is", null);

    if (unread.error) {
      console.error("chatQueries.sendMessage(counter count) error:", unread.error);
    }

    const unreadCount = Array.isArray(unread.data) ? unread.data.length : 0;

    const patch =
      senderRole === "user"
        ? {
            last_message_at: new Date().toISOString(),
            last_message_preview: buildPreview(body),
            unread_for_admin: unreadCount,
          }
        : {
            last_message_at: new Date().toISOString(),
            last_message_preview: buildPreview(body),
            unread_for_user: unreadCount,
          };

    const updated = await client.from("chat_threads").update(patch).eq("id", threadId);
    if (updated.error) {
      console.error("chatQueries.sendMessage(counter update) error:", updated.error);
    }

    return inserted.data as unknown as ChatMessage;
  },

  /** Tandai pesan lawan bicara sudah dibaca & reset counter. */
  markRead: async (threadId: number, readerRole: ChatSenderRole): Promise<void> => {
    const client = requireClient();
    const otherRoles: ChatSenderRole[] = readerRole === "user" ? STAFF_ROLES : ["user"];

    // Sama seperti di sendMessage: pakai `.filter("...", "is", null)` karena
    // `.is()` pada client ini tidak menyaring baris dengan benar.
    const messages = await client
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("thread_id", threadId)
      .in("sender_role", otherRoles)
      .filter("read_at", "is", null);

    if (messages.error) {
      console.error("chatQueries.markRead(messages) error:", messages.error);
    }

    const thread = await client
      .from("chat_threads")
      .update(readerRole === "admin" ? { unread_for_admin: 0 } : { unread_for_user: 0 })
      .eq("id", threadId);

    if (thread.error) {
      console.error("chatQueries.markRead(thread) error:", thread.error);
      throw thread.error;
    }
  },

  /* ── Badge unread ────────────────────────────────────────────── */

  /** Total pesan belum dibaca untuk user (semua thread). */
  getUnreadForUser: async (userId: number): Promise<number> => {
    if (!supabase) return 0;

    const { data, error } = await supabase
      .from("chat_threads")
      .select("unread_for_user")
      .eq("user_id", userId);

    if (error) {
      console.error("chatQueries.getUnreadForUser error:", error);
      return 0;
    }

    return ((data as { unread_for_user: number }[]) ?? []).reduce(
      (sum, row) => sum + (row.unread_for_user ?? 0),
      0
    );
  },

  /** Total pesan belum dibaca untuk admin (semua thread). */
  getUnreadForAdmin: async (): Promise<number> => {
    if (!supabase) return 0;

    const { data, error } = await supabase
      .from("chat_threads")
      .select("unread_for_admin")
      .gt("unread_for_admin", 0);

    if (error) {
      console.error("chatQueries.getUnreadForAdmin error:", error);
      return 0;
    }

    return ((data as { unread_for_admin: number }[]) ?? []).reduce(
      (sum, row) => sum + (row.unread_for_admin ?? 0),
      0
    );
  },
};

// ─── Testimonial Queries ────────────────────────────────────────────────────

/** Data yang boleh diisi saat menambah / mengubah testimoni. */
export interface TestimonialInput {
  customer_name: string;
  product_name?: string;
  /** Opsional — screenshot/foto biasanya sudah mewakili cerita pembeli. */
  message?: string;
  /**
   * Nama berkas gambar testimoni di `public/testimoni/`.
   * Wajib diisi saat menambah (lihat POST /api/testimonials).
   */
  image_path?: string;
  is_published?: boolean;
  sort_order?: number;
}

export const testimonialQueries = {
  /**
   * Daftar testimoni untuk halaman publik.
   * Hanya yang `is_published = true`, diurutkan: sort_order terbesar dulu,
   * lalu yang terbaru.
   */
  findPublished: async (): Promise<DbTestimonial[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("testimonialQueries.findPublished error:", error);
      return [];
    }
    return (data as DbTestimonial[]) || [];
  },

  /** Daftar seluruh testimoni untuk panel admin (termasuk draft). */
  findAll: async (): Promise<DbTestimonial[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("testimonialQueries.findAll error:", error);
      return [];
    }
    return (data as DbTestimonial[]) || [];
  },

  create: async (
    input: TestimonialInput,
    createdBy: number
  ): Promise<DbTestimonial> => {
    const { data, error } = await requireClient()
      .from("testimonials")
      .insert([
        {
          customer_name: input.customer_name,
          product_name: input.product_name ?? "",
          message: input.message ?? "",
          image_path: input.image_path ?? "",
          is_published: input.is_published ?? true,
          sort_order: input.sort_order ?? 0,
          created_by: createdBy,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.error("testimonialQueries.create error:", error);
      throw error;
    }
    return data as DbTestimonial;
  },

  update: async (
    id: number,
    input: Partial<TestimonialInput>
  ): Promise<DbTestimonial | undefined> => {
    const { data, error } = await requireClient()
      .from("testimonials")
      .update(input)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("testimonialQueries.update error:", error);
      throw error;
    }
    return (data as DbTestimonial) ?? undefined;
  },

  remove: async (id: number): Promise<void> => {
    const { error } = await requireClient().from("testimonials").delete().eq("id", id);

    if (error) {
      console.error("testimonialQueries.remove error:", error);
      throw error;
    }
  },
};

