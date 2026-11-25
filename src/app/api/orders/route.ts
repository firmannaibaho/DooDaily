import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { keychainQueries, orderQueries } from "@/lib/db";
import type { QrMode } from "@/lib/keychain-types";

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DDL-${ts}-${rand}`;
}

/**
 * GET: Return orders.
 *   Admin → all orders.
 *   User → their orders.
 *   Not logged in → 401.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  if (session.user.role === "admin") {
    const orders = await orderQueries.findAll();
    return NextResponse.json({ orders });
  }

  const orders = await orderQueries.findByUserId(Number(session.user.id));
  return NextResponse.json({ orders });
}

/**
 * POST: Create a new order.
 *
 * WAJIB LOGIN. Guest checkout sudah dihapus sejak fitur "checkout butuh akun"
 * agar setiap pesanan punya pemilik yang jelas dan bisa dilacak di /my-orders.
 * Pengecekan di sini tidak bisa dilewati dari UI karena berjalan di server.
 */
export async function POST(request: Request) {
  const session = await auth();

  // Belum login → tolak. Jangan lanjut dengan user_id null.
  if (!session?.user) {
    return NextResponse.json(
      { message: "Silakan login atau daftar dulu sebelum checkout." },
      { status: 401 }
    );
  }

  // Cegah role admin membuat transaksi / checkout
  if (session.user.role === "admin") {
    return NextResponse.json(
      { message: "Akun admin tidak diperkenankan melakukan transaksi checkout." },
      { status: 403 }
    );
  }

  const data = await request.json();

  const {
    customer_name,
    email,
    phone,
    address,
    city,
    notes,
    payment_method,
    items_json,
    subtotal,
    shipping,
    total,
    qr_mode,
  } = data;

  const qrMode: QrMode =
    qr_mode === "per_unit" || qr_mode === "per_order" ? qr_mode : "none";

  if (!customer_name || !email || !phone || !address || !city || !payment_method || !items_json) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const order_id = generateOrderId();
  /**
   * user_id selalu terisi karena guest sudah ditolak di atas.
   * Nilai 0 / NaN menandakan sesi rusak (token tanpa id) → tolak, jangan
   * menyimpan pesanan tanpa pemilik.
   */
  const user_id = Number(session.user.id);
  if (!Number.isFinite(user_id) || user_id <= 0) {
    return NextResponse.json(
      { message: "Sesi tidak valid. Silakan login ulang." },
      { status: 401 }
    );
  }


  try {
    const itemsStr = typeof items_json === "string" ? items_json : JSON.stringify(items_json);
    await orderQueries.create(
      order_id,
      user_id,
      customer_name,
      email,
      phone,
      address,
      city,
      notes ?? "",
      payment_method,
      itemsStr,
      Number(subtotal),
      Number(shipping),
      Number(total)
    );
    // Buat tag QR hanya jika pembeli memilih opsi pakai QR.
    if (qrMode !== "none") {
      try {
        await keychainQueries.createTagsForOrder(order_id, user_id, itemsStr, qrMode);
      } catch (qrErr) {
        console.error("Create keychain QR tags error:", qrErr);
      }
    }
    return NextResponse.json({ order_id }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
