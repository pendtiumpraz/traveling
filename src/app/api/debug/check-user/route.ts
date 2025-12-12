import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/debug/check-user?email=superadmin@demo.com&password=superadmin123
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email) {
    return Response.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email, isDeleted: false },
      include: {
        roles: { include: { role: true } },
        tenant: true,
      },
    });

    if (!user) {
      // Check if any users exist
      const userCount = await prisma.user.count();
      return Response.json({
        found: false,
        message: `User with email ${email} not found`,
        totalUsersInDb: userCount,
        hint: userCount === 0 ? "Database is empty. Run: npx prisma db seed" : "User doesn't exist",
      });
    }

    const result: Record<string, unknown> = {
      found: true,
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      hasPassword: !!user.password,
      tenantId: user.tenantId,
      roles: user.roles.map((r) => r.role.name),
    };

    // Check password if provided
    if (password && user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      result.passwordValid = isValid;
      if (!isValid) {
        result.hint = "Password doesn't match. Try re-seeding: npx prisma db seed";
      }
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({
      error: "Database error",
      message: error instanceof Error ? error.message : "Unknown error",
      hint: "Check database connection. Run: npx prisma db push",
    }, { status: 500 });
  }
}
