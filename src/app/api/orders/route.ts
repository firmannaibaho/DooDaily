import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderQueries } from "@/lib/db";

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

  if ((session.user as any).role === "admin") {
    const orders = await orderQueries.findAll();
    return NextResponse.json({ orders });
  }

  const orders = await orderQueries.findByUserId(
    Number((session.user as any).id)
  );
  return NextResponse.json({ orders });
}

/**
 * POST: Create a new order.
 *   If user is logged in, link order to user; otherwise user_id is null (guest).
 */
export async function POST(request: Request) {
  const session = await auth();

  // Cegah role admin membuat transaksi / checkout
  if ((session?.user as any)?.role === "admin") {
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
  } = data;

  if (!customer_name || !email || !phone || !address || !city || !payment_method || !items_json) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  const order_id = generateOrderId();
  const user_id = session?.user ? Number((session.user as any).id) : null;

  try {
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
      typeof items_json === "string" ? items_json : JSON.stringify(items_json),
      Number(subtotal),
      Number(shipping),
      Number(total)
    );
    return NextResponse.json({ order_id }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
