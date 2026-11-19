/**
 * Tipe data pesanan untuk komponen client.
 *
 * Dipisah dari `lib/db.ts` (yang server-only) supaya bisa diimpor komponen
 * client tanpa ikut menyeret client Supabase ke bundle browser.
 */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "done"
  | "cancelled";

export interface OrderItem {
  productId?: number;
  name: string;
  price: number;
  quantity: number;
  /** URL gambar; bisa data URI hasil AI atau URL Supabase Storage. */
  image?: string;
  /** Baris keterangan, mis. "Instruksi: ...", "Gambar referensi: ...". */
  customizations?: string[];
}

/** Bentuk pesanan seperti yang dikirim GET /api/orders. */
export interface OrderRecord {
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
  shipping: number;
  total: number;
  status: OrderStatus | string;
  /** Path relatif di Supabase Storage (`bukti/xxx.jpg`) atau data lama. */
  payment_proof?: string;
  result_image?: string;
  admin_notes?: string;
  created_at: string;
}

/** Urai `items_json` dengan aman. */
export function parseOrderItems(itemsJson: string | undefined): OrderItem[] {
  if (!itemsJson) return [];
  try {
    const parsed: unknown = JSON.parse(itemsJson);
    return Array.isArray(parsed) ? (parsed as OrderItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * URL publik untuk berkas unggahan (bukti bayar / gambar referensi).
 *
 * Menerima path relatif Storage (`bukti/xxx.jpg`), nama berkas lama
 * (`xxx.jpg`), URL penuh, atau path absolut (`/uploads/...`).
 */
export function uploadPublicUrl(
  value: string | undefined,
  folder: "bukti" | "referensi" | "testimoni"
): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("/")) {
    return value;
  }
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const bucket = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || "uploads";
  const path = value.includes("/")
    ? value
    : `${folder}/${value.split("/").pop() ?? value}`;
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : `/uploads/${path}`;
}
