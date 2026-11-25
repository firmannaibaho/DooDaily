import { NextResponse } from "next/server";
import { HttpError, requireUser, userIdOf, withErrorHandling } from "@/lib/api-guard";
import { keychainQueries, orderQueries } from "@/lib/db";

/**
 * GET /api/keychains?orderId=...
 * - Admin: semua tag pada orderId tersebut (wajib ?orderId=).
 * - User: semua tag miliknya, atau tag pada orderId miliknya.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const user = await requireUser();
  const orderId = new URL(request.url).searchParams.get("orderId")?.trim() || "";

  if (user.role === "admin") {
    if (!orderId) throw new HttpError(400, "orderId wajib diisi.");
    const tags = await keychainQueries.listByOrder(orderId);
    return NextResponse.json({ tags });
  }

  const uid = userIdOf(user);
  if (orderId) {
    const order = await orderQueries.findByOrderId(orderId);
    if (!order || Number(order.user_id) !== uid) {
      throw new HttpError(403, "Anda tidak punya akses ke pesanan ini.");
    }
    const tags = await keychainQueries.listByOrder(orderId);
    return NextResponse.json({ tags });
  }

  const tags = await keychainQueries.listByUser(uid);
  return NextResponse.json({ tags });
});
