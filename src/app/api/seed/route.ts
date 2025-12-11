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

    // 3. Create Demo Users for Each Role
    const demoUsers = [
      {
        email: adminEmail,
        password: adminPassword,
        name: adminName || "Super Admin",
        role: "SUPER_ADMIN",
      },
      {
        email: "admin@demo.com",
        password: "admin123",
        name: "Admin Demo",
        role: "ADMIN",
      },
      {
        email: "manager@demo.com",
        password: "manager123",
        name: "Manager Demo",
        role: "MANAGER",
      },
      {
        email: "staff@demo.com",
        password: "staff123",
        name: "Staff Demo",
        role: "STAFF",
      },
      {
        email: "tourleader@demo.com",
        password: "tourleader123",
        name: "Tour Leader Demo",
        role: "TOUR_LEADER",
      },
      {
        email: "agent@demo.com",
        password: "agent123",
        name: "Agent Demo",
        role: "AGENT",
      },
      {
        email: "customer@demo.com",
        password: "customer123",
        name: "Customer Demo",
        role: "CUSTOMER",
      },
    ];

    const createdUsers: Array<{
      email: string;
      password: string;
      role: string;
    }> = [];

    for (const demoUser of demoUsers) {
      const existing = await prisma.user.findFirst({
        where: { email: demoUser.email, isDeleted: false },
      });

      let user;
      if (!existing) {
        const hashedPassword = await bcrypt.hash(demoUser.password, 12);

        user = await prisma.user.create({
          data: {
            tenantId,
            email: demoUser.email,
            password: hashedPassword,
            name: demoUser.name,
            provider: "credentials",
            isActive: true,
            emailVerified: new Date(),
          },
        });

        // Assign role
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: createdRoles[demoUser.role],
          },
        });

        // Create customer record for CUSTOMER role
        if (demoUser.role === "CUSTOMER") {
          await prisma.customer.create({
            data: {
              tenantId,
              code: `CUST-${Date.now()}`,
              fullName: demoUser.name,
              phone: "081234567890",
              email: demoUser.email,
              customerType: "PROSPECT",
              userId: user.id,
              source: "WEBSITE",
            },
          });
        }

        // Create employee record for staff roles
        if (
          ["ADMIN", "MANAGER", "STAFF", "TOUR_LEADER"].includes(demoUser.role)
        ) {
          const existingEmployee = await prisma.employee.findFirst({
            where: { userId: user.id },
          });

          if (!existingEmployee) {
            await prisma.employee.create({
              data: {
                tenantId,
                nip: `EMP-${Date.now().toString().slice(-6)}`,
                name: demoUser.name,
                email: demoUser.email,
                position:
                  demoUser.role === "TOUR_LEADER"
                    ? "Tour Leader"
                    : demoUser.role,
                department:
                  demoUser.role === "TOUR_LEADER"
                    ? "Operations"
                    : "Administration",
                status: "ACTIVE",
                isTourLeader: demoUser.role === "TOUR_LEADER",
                userId: user.id,
                joinDate: new Date(),
                baseSalary: 5000000,
              },
            });
          }
        }

        // Create agent record for AGENT role
        if (demoUser.role === "AGENT") {
          await prisma.agent.create({
            data: {
              tenantId,
              code: `AGT-${Date.now().toString().slice(-6)}`,
              name: demoUser.name,
              phone: "081234567891",
              email: demoUser.email,
              tier: "SILVER",
              commissionRate: 5,
              isActive: true,
              userId: user.id,
            },
          });
        }

        createdUsers.push({
          email: demoUser.email,
          password: demoUser.password,
          role: demoUser.role,
        });
      } else {
        // Ensure user has the correct role
        const hasRole = await prisma.userRole.findFirst({
          where: {
            userId: existing.id,
            roleId: createdRoles[demoUser.role],
          },
        });

        if (!hasRole) {
          await prisma.userRole.create({
            data: {
              userId: existing.id,
              roleId: createdRoles[demoUser.role],
            },
          });
        }

        createdUsers.push({
          email: demoUser.email,
          password: demoUser.password,
          role: demoUser.role,
        });
      }
    }

    return successResponse(
      {
        tenant: { id: tenant.id, name: tenant.name },
        roles: Object.keys(createdRoles),
        users: createdUsers,
        loginInfo: `
===========================================
        DEMO LOGIN CREDENTIALS
===========================================

| Role         | Email                | Password      |
|--------------|----------------------|---------------|
| SUPER_ADMIN  | ${adminEmail}        | ${adminPassword} |
| ADMIN        | admin@demo.com       | admin123      |
| MANAGER      | manager@demo.com     | manager123    |
| STAFF        | staff@demo.com       | staff123      |
| TOUR_LEADER  | tourleader@demo.com  | tourleader123 |
| AGENT        | agent@demo.com       | agent123      |
| CUSTOMER     | customer@demo.com    | customer123   |

===========================================
        `,
      },
      "Seed completed successfully with demo users",
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
