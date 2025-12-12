import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/debug/reset-passwords?key=xxx - Reset all demo user passwords
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  
  // Require secret key (use AUTH_SECRET or default)
  const secretKey = process.env.AUTH_SECRET?.slice(0, 16) || "debug123";
  if (key !== secretKey) {
    return Response.json({ error: "Invalid key. Use ?key=YOUR_AUTH_SECRET_FIRST_16_CHARS" }, { status: 403 });
  }

  const users = [
    { email: "superadmin@demo.com", password: "superadmin123" },
    { email: "admin@demo.com", password: "admin123" },
    { email: "finance@demo.com", password: "finance123" },
    { email: "operasional@demo.com", password: "operasional123" },
    { email: "marketing@demo.com", password: "marketing123" },
    { email: "hrd@demo.com", password: "hrd123" },
    { email: "inventory@demo.com", password: "inventory123" },
    { email: "tourleader@demo.com", password: "tourleader123" },
    { email: "agent@demo.com", password: "agent123" },
    { email: "sales@demo.com", password: "sales123" },
    { email: "customer@demo.com", password: "customer123" },
  ];

  const results = [];

  for (const u of users) {
    try {
      const hashed = await bcrypt.hash(u.password, 12);
      const result = await prisma.user.updateMany({
        where: { email: u.email },
        data: { password: hashed },
      });
      results.push({ email: u.email, updated: result.count > 0 });
    } catch (error) {
      results.push({ email: u.email, error: String(error) });
    }
  }

  return Response.json({
    message: "Password reset complete",
    results,
    hint: "Try login with superadmin@demo.com / superadmin123",
  });
}
