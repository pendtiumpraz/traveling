import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { generateCode } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const { name, email, phone, password } = validation.data;

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
      },
    });

    if (existingUser) {
      return errorResponse("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const tenantId = process.env.DEFAULT_TENANT_ID || "default";

    // Ensure default tenant exists
    let tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          id: tenantId,
          name: "Default Travel Agency",
          subdomain: "default",
        },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        tenantId,
        provider: "credentials",
        isActive: true,
      },
    });

    // Create customer as PROSPECT
    await prisma.customer.create({
      data: {
        tenantId,
        code: generateCode("CUST", 8),
        fullName: name,
        phone,
        email,
        customerType: "PROSPECT",
        userId: user.id,
        source: "WEBSITE",
      },
    });

    // Assign default role (CUSTOMER)
    let customerRole = await prisma.role.findFirst({
      where: { tenantId, name: "CUSTOMER" },
    });

    if (!customerRole) {
      customerRole = await prisma.role.create({
        data: {
          tenantId,
          name: "CUSTOMER",
          displayName: { id: "Pelanggan", en: "Customer" },
          permissions: [
            "booking:create",
            "booking:read:own",
            "payment:create",
            "profile:update",
          ],
          isSystem: true,
        },
      });
    }

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: customerRole.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: "REGISTER",
        entity: "user",
        entityId: user.id,
      },
    });

    return successResponse(
      { id: user.id, email: user.email, name: user.name },
      "Registration successful",
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("Registration failed", 500);
  }
}
