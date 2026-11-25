/** Tipe & helper untuk fitur QR Keychain (tanpa akses database). */

export type QrMode = "none" | "per_unit" | "per_order";

export const QR_ITEM_PRICE = 15000;
export const MAX_QR_TAGS_PER_ORDER = 50;

export interface KeychainTag {
  id: number;
  token: string;
  order_id: string;
  user_id: number | null;
  item_name: string;
  display_title: string;
  owner_message: string;
  contact_info: string;
  show_contact: boolean;
  is_lost: boolean;
  created_at: string;
  updated_at: string;
}

export interface KeychainReport {
  id: number;
  tag_id: number;
  finder_name: string;
  finder_contact: string;
  found_location: string;
  notes: string;
  is_read: boolean;
  created_at: string;
}

export interface KeychainTagWithReports extends KeychainTag {
  reports: KeychainReport[];
}

export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Susun daftar label awal tag QR dari item pesanan sesuai mode yang dipilih pembeli. */
export function buildTagLabels(
  items: Array<{ name?: unknown; quantity?: unknown }>,
  mode: QrMode,
  orderId: string
): string[] {
  if (mode === "none") return [];
  if (mode === "per_order") {
    return [`Pesanan ${orderId}`];
  }

  const labels: string[] = [];
  for (const raw of items) {
    const baseName = cleanText(raw.name, 80) || "Keychain";
    const qty = Math.max(1, Math.floor(Number(raw.quantity) || 1));
    for (let i = 1; i <= qty; i += 1) {
      if (labels.length >= MAX_QR_TAGS_PER_ORDER) return labels;
      labels.push(qty > 1 ? `${baseName} #${i}` : baseName);
    }
  }

  return labels.length > 0 ? labels : [`Pesanan ${orderId}`];
}
