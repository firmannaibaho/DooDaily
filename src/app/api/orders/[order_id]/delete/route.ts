import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderQueries } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ order_id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { order_id } = await params;
  if (!order_id) {
    return NextResponse.json({ message: "Missing order_id" }, { status: 400 });
  }

  try {
    await orderQueries.delete(order_id);
    return NextResponse.json({ message: "Pesanan berhasil dihapus", order_id });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json({ message: "Gagal menghapus pesanan" }, { status: 500 });
  }
}
