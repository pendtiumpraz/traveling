import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// Load .env file
config();

const accelerateUrl = process.env.PRISMA_DATABASE_URL;
if (!accelerateUrl) {
  console.error("❌ PRISMA_DATABASE_URL not found in .env");
  process.exit(1);
}

const prisma = new PrismaClient({
  accelerateUrl,
});

async function main() {
  console.log("🌱 Starting seed...");

  const tenantId = process.env.DEFAULT_TENANT_ID || "default";

  // 1. Create Tenant
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
    console.log("✅ Tenant created");
  } else {
    console.log("✅ Tenant exists");
  }

  // 2. Create Roles
  const rolesData = [
    {
      name: "SUPER_ADMIN",
      displayName: { id: "Super Admin", en: "Super Admin" },
      permissions: ["*"],
      isSystem: true,
    },
    {
      name: "ADMIN",
      displayName: { id: "Administrator", en: "Administrator" },
      permissions: [
        "dashboard:*",
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
        "support:*",
      ],
      isSystem: true,
    },
    {
      name: "FINANCE",
      displayName: { id: "Keuangan", en: "Finance" },
      permissions: [
        "dashboard:view",
        "payment:*",
        "invoice:*",
        "commission:*",
        "report:finance",
        "customer:read",
        "booking:read",
      ],
      isSystem: true,
    },
    {
      name: "OPERASIONAL",
      displayName: { id: "Operasional", en: "Operations" },
      permissions: [
        "dashboard:view",
        "manifest:*",
        "schedule:*",
        "rooming:*",
        "flight:*",
        "tracking:*",
        "customer:read",
        "booking:read",
      ],
      isSystem: true,
    },
    {
      name: "MARKETING",
      displayName: { id: "Marketing", en: "Marketing" },
      permissions: [
        "dashboard:view",
        "customer:*",
        "voucher:*",
        "campaign:*",
        "report:marketing",
        "booking:read",
      ],
      isSystem: true,
    },
    {
      name: "HRD",
      displayName: { id: "HRD", en: "Human Resources" },
      permissions: [
        "dashboard:view",
        "employee:*",
        "attendance:*",
        "payroll:*",
        "leave:*",
      ],
      isSystem: true,
    },
    {
      name: "INVENTORY",
      displayName: { id: "Inventory", en: "Inventory" },
      permissions: [
        "dashboard:view",
        "product:*",
        "stock:*",
        "warehouse:*",
        "distribution:*",
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
        "tracking:*",
        "attendance:*",
        "participant:read",
        "schedule:read",
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
        "customer:update:own",
        "booking:create",
        "booking:read:own",
        "commission:read:own",
        "package:read",
        "schedule:read",
      ],
      isSystem: true,
    },
    {
      name: "SALES",
      displayName: { id: "Sales", en: "Sales" },
      permissions: [
        "dashboard:view",
        "customer:*",
        "booking:*",
        "payment:create",
        "payment:read",
        "package:read",
        "schedule:read",
        "voucher:read",
        "report:sales",
      ],
      isSystem: true,
    },
    {
      name: "CUSTOMER",
      displayName: { id: "Pelanggan", en: "Customer" },
      permissions: [
        "portal:access",
        "package:read",
        "schedule:read",
        "booking:create",
        "booking:read:own",
        "payment:create",
        "payment:read:own",
        "document:upload",
        "document:read:own",
        "profile:read",
        "profile:update",
        "tracking:read:own",
        "ticket:create",
        "ticket:read:own",
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
        data: { tenantId, ...roleData },
      });
      createdRoles[roleData.name] = role.id;
      console.log(`✅ Role ${roleData.name} created`);
    } else {
      createdRoles[roleData.name] = existing.id;
      console.log(`✅ Role ${roleData.name} exists`);
    }
  }

  // 3. Create Demo Users
  const demoUsers = [
    {
      email: "superadmin@demo.com",
      password: "superadmin123",
      name: "Super Admin",
      role: "SUPER_ADMIN",
    },
    {
      email: "admin@demo.com",
      password: "admin123",
      name: "Admin Demo",
      role: "ADMIN",
    },
    {
      email: "finance@demo.com",
      password: "finance123",
      name: "Finance Demo",
      role: "FINANCE",
    },
    {
      email: "operasional@demo.com",
      password: "operasional123",
      name: "Operasional Demo",
      role: "OPERASIONAL",
    },
    {
      email: "marketing@demo.com",
      password: "marketing123",
      name: "Marketing Demo",
      role: "MARKETING",
    },
    {
      email: "hrd@demo.com",
      password: "hrd123",
      name: "HRD Demo",
      role: "HRD",
    },
    {
      email: "inventory@demo.com",
      password: "inventory123",
      name: "Inventory Demo",
      role: "INVENTORY",
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
      email: "sales@demo.com",
      password: "sales123",
      name: "Sales Demo",
      role: "SALES",
    },
    {
      email: "customer@demo.com",
      password: "customer123",
      name: "Ahmad Jamaah",
      role: "CUSTOMER",
    },
  ];

  for (const demoUser of demoUsers) {
    const existing = await prisma.user.findFirst({
      where: { email: demoUser.email, isDeleted: false },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);

      const user = await prisma.user.create({
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

      // Create customer for CUSTOMER role
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

      // Create employee for staff roles
      if (
        [
          "ADMIN",
          "FINANCE",
          "OPERASIONAL",
          "MARKETING",
          "HRD",
          "INVENTORY",
          "TOUR_LEADER",
          "SALES",
        ].includes(demoUser.role)
      ) {
        const deptMap: Record<string, string> = {
          ADMIN: "Administration",
          FINANCE: "Finance",
          OPERASIONAL: "Operations",
          MARKETING: "Marketing",
          HRD: "Human Resources",
          INVENTORY: "Warehouse",
          TOUR_LEADER: "Operations",
          SALES: "Sales",
        };
        await prisma.employee.create({
          data: {
            tenantId,
            nip: `EMP-${Date.now().toString().slice(-6)}`,
            name: demoUser.name,
            email: demoUser.email,
            position: demoUser.role.replace("_", " "),
            department: deptMap[demoUser.role] || "General",
            status: "ACTIVE",
            isTourLeader: demoUser.role === "TOUR_LEADER",
            userId: user.id,
            joinDate: new Date(),
            baseSalary: 5000000,
          },
        });
      }

      // Create agent for AGENT role
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

      console.log(
        `✅ User ${demoUser.email} created with role ${demoUser.role}`,
      );
    } else {
      console.log(`✅ User ${demoUser.email} exists`);
    }
  }

  console.log("\n============================================================");
  console.log("                DEMO LOGIN CREDENTIALS");
  console.log("============================================================\n");
  console.log("| Role         | Email                  | Password        |");
  console.log("|--------------|------------------------|-----------------|");
  console.log("| SUPER_ADMIN  | superadmin@demo.com    | superadmin123   |");
  console.log("| ADMIN        | admin@demo.com         | admin123        |");
  console.log("| FINANCE      | finance@demo.com       | finance123      |");
  console.log("| OPERASIONAL  | operasional@demo.com   | operasional123  |");
  console.log("| MARKETING    | marketing@demo.com     | marketing123    |");
  console.log("| HRD          | hrd@demo.com           | hrd123          |");
  console.log("| INVENTORY    | inventory@demo.com     | inventory123    |");
  console.log("| TOUR_LEADER  | tourleader@demo.com    | tourleader123   |");
  console.log("| AGENT        | agent@demo.com         | agent123        |");
  console.log("| SALES        | sales@demo.com         | sales123        |");
  console.log("| CUSTOMER     | customer@demo.com      | customer123     |");
  console.log("\n============================================================");
  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
