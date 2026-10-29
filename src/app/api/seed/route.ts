import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { userQueries } from "@/lib/db";

/**
 * GET /api/seed — Creates the default admin user if it doesn't exist.
 * Visit this URL once to seed the database.
 */
export async function GET() {
  try {
    const adminEmail = "admin@doodaily.com";
    const existing = await userQueries.findByEmail(adminEmail);

    if (existing) {
      return NextResponse.json({
        message: "Admin sudah ada",
        email: adminEmail,
      });
    }

    const hashed = await bcrypt.hash("doodaily123", 10);
    await userQueries.create("Admin Doodaily", adminEmail, hashed, "admin");

    return NextResponse.json({
      message: "Admin berhasil dibuat!",
      email: adminEmail,
      password: "doodaily123",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { message: "Error seeding database", error: String(error) },
      { status: 500 }
    );
  }
}
