import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetPasswords() {
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

  console.log("Resetting passwords...\n");

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 12);
    const result = await prisma.user.updateMany({
      where: { email: u.email },
      data: { password: hashed },
    });
    console.log(`✅ ${u.email} - ${result.count > 0 ? "updated" : "not found"}`);
  }

  console.log("\n🎉 Done! Try login now with credentials from LOGIN_CREDENTIALS.md");
  await prisma.$disconnect();
}

resetPasswords().catch(console.error);
