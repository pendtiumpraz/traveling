import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const accelerateUrl = process.env.PRISMA_DATABASE_URL;

  return new PrismaClient({
    ...(accelerateUrl && { accelerateUrl }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// List of models with soft delete support
export const SOFT_DELETE_MODELS = [
  "tenant",
  "user",
  "role",
  "branch",
  "hotel",
  "airline",
  "bank",
  "supplier",
  "package",
  "schedule",
  "customer",
  "document",
  "visaApplication",
  "booking",
  "payment",
  "invoice",
  "manifest",
  "flight",
  "employee",
  "leave",
  "payroll",
  "warehouse",
  "product",
  "purchaseOrder",
  "campaign",
  "voucher",
  "landingPage",
  "lead",
  "device",
  "beacon",
  "geofence",
  "page",
  "article",
  "media",
  "ticket",
  "commission",
  "agent",
  "sales",
];

// Prisma model delegate type
type PrismaModelDelegate = {
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<unknown>;
  findMany: (args: { where?: Record<string, unknown> }) => Promise<unknown[]>;
};

// Soft delete helper functions
export async function softDelete<T>(
  model: PrismaModelDelegate,
  id: string,
  deletedBy: string,
): Promise<T> {
  return model.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
  }) as Promise<T>;
}

export async function restore<T>(
  model: PrismaModelDelegate,
  id: string,
): Promise<T> {
  return model.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    },
  }) as Promise<T>;
}

// Find including deleted records
export async function findWithDeleted<T>(
  model: PrismaModelDelegate,
  where: Record<string, unknown>,
): Promise<T[]> {
  return model.findMany({
    where: {
      ...where,
    },
  }) as Promise<T[]>;
}

// Find only deleted records
export async function findDeleted<T>(model: PrismaModelDelegate): Promise<T[]> {
  return model.findMany({
    where: { isDeleted: true },
  }) as Promise<T[]>;
}

export default prisma;
