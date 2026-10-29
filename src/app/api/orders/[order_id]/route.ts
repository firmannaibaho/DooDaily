import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { orderQueries } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const data = await request.json();
  const { order_id, status, result_image, admin_notes } = data;

  if (!order_id) {
    return NextResponse.json({ message: "Missing order_id" }, { status: 400 });
  }

  // Update status jika dikirim
  if (status) {
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "done", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    await orderQueries.updateStatus(status, order_id);
  }

  // Update foto hasil custom / catatan admin jika ada
  if (result_image !== undefined || admin_notes !== undefined) {
    await orderQueries.updateResult(order_id, result_image || "", admin_notes || "");
  }

  return NextResponse.json({
    message: "Pesanan berhasil diperbarui",
    order_id,
    status,
    result_image,
    admin_notes,
  });
}
