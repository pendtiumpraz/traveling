import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import bcrypt from "bcryptjs";

/**
 * POST /api/seed
 * Seed initial data: tenant, roles, admin user
 *
 * IMPORTANT: Remove or protect this endpoint in production!
 */
export async function POST(request: NextRequest) {
  try {
    const { adminEmail, adminPassword, adminName } = await request.json();

    if (!adminEmail || !adminPassword) {
      return errorResponse("adminEmail and adminPassword required", 400);
    }

    const tenantId = process.env.DEFAULT_TENANT_ID || "default";

    // 1. Create/Get Tenant
    let tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          id: tenantId,
          name: "Default Travel Agency",
          subdomain: "default",
          businessTypes: ["UMROH", "HAJI", "OUTBOUND"],
        },
      });
    }

    // 2. Create System Roles
    const rolesData = [
      {
        name: "SUPER_ADMIN",
        displayName: { id: "Super Admin", en: "Super Admin" },
        permissions: ["*"], // All permissions
        isSystem: true,
      },
      {
        name: "ADMIN",
        displayName: { id: "Administrator", en: "Administrator" },
        permissions: [
          "dashboard:view",
          "customer:*",
          "booking:*",
          "package:*",
          "schedule:*",
          "payment:*",
          "invoice:*",
          "manifest:*",
          "employee:*",
          "agent:*",
          "voucher:*",
          "product:*",
          "report:*",
          "setting:*",
        ],
        isSystem: true,
      },
      {
        name: "MANAGER",
        displayName: { id: "Manajer", en: "Manager" },
        permissions: [
          "dashboard:view",
          "customer:*",
          "booking:*",
          "package:read",
          "schedule:*",
          "payment:*",
          "invoice:*",
          "manifest:*",
          "report:view",
        ],
        isSystem: true,
      },
      {
        name: "STAFF",
        displayName: { id: "Staff", en: "Staff" },
        permissions: [
          "dashboard:view",
          "customer:read",
          "customer:create",
          "customer:update",
          "booking:read",
          "booking:create",
          "booking:update",
          "payment:read",
          "payment:create",
          "manifest:read",
        ],
        isSystem: true,
      },
      {
        name: "TOUR_LEADER",
        displayName: { id: "Tour Leader", en: "Tour Leader" },
        permissions: [
          "dashboard:view",
          "manifest:read",
          "customer:read",
          "tracking:view",
          "attendance:*",
        ],
        isSystem: true,
      },
      {
        name: "AGENT",
        displayName: { id: "Agen", en: "Agent" },
        permissions: [
          "dashboard:view",
          "customer:create",
          "customer:read:own",
          "booking:create",
          "booking:read:own",
          "commission:read:own",
        ],
        isSystem: true,
      },
      {
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
    ];

    const createdRoles: Record<string, string> = {};

    for (const roleData of rolesData) {
      const existing = await prisma.role.findFirst({
        where: { tenantId, name: roleData.name },
      });

      if (!existing) {
        const role = await prisma.role.create({
          data: {
            tenantId,
            ...roleData,
          },
        });
        createdRoles[roleData.name] = role.id;
      } else {
        createdRoles[roleData.name] = existing.id;
      }
    }

    // 3. Create Admin User
    const existingAdmin = await prisma.user.findFirst({
      where: { email: adminEmail, isDeleted: false },
    });

    let adminUser;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      adminUser = await prisma.user.create({
        data: {
          tenantId,
          email: adminEmail,
          password: hashedPassword,
          name: adminName || "Administrator",
          provider: "credentials",
          isActive: true,
          emailVerified: new Date(),
        },
      });

      // Assign SUPER_ADMIN role
      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: createdRoles["SUPER_ADMIN"],
        },
      });
    } else {
      adminUser = existingAdmin;

      // Ensure admin has SUPER_ADMIN role
      const hasRole = await prisma.userRole.findFirst({
        where: {
          userId: adminUser.id,
          roleId: createdRoles["SUPER_ADMIN"],
        },
      });

      if (!hasRole) {
        await prisma.userRole.create({
          data: {
            userId: adminUser.id,
            roleId: createdRoles["SUPER_ADMIN"],
          },
        });
      }
    }

    return successResponse(
      {
        tenant: { id: tenant.id, name: tenant.name },
        roles: Object.keys(createdRoles),
        admin: { id: adminUser.id, email: adminUser.email },
      },
      "Seed completed successfully",
    );
  } catch (error) {
    console.error("Seed error:", error);
    return errorResponse("Seed failed: " + (error as Error).message, 500);
  }
}

/**
 * GET /api/seed
 * Check seed status
 */
export async function GET() {
  try {
    const tenantId = process.env.DEFAULT_TENANT_ID || "default";

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    const roles = await prisma.role.findMany({
      where: { tenantId },
      select: { name: true },
    });

    const adminCount = await prisma.userRole.count({
      where: {
        role: { name: "SUPER_ADMIN" },
      },
    });

    return successResponse({
      seeded: !!tenant && roles.length > 0 && adminCount > 0,
      tenant: tenant ? { id: tenant.id, name: tenant.name } : null,
      roles: roles.map((r) => r.name),
      adminCount,
    });
  } catch (error) {
    return errorResponse("Check failed", 500);
  }
}
