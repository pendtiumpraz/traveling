import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// Models that support soft delete
const RESTORABLE_MODELS: Record<string, string> = {
  customer: "customer",
  booking: "booking",
  package: "package",
  schedule: "schedule",
  payment: "payment",
  invoice: "invoice",
  manifest: "manifest",
  employee: "employee",
  agent: "agent",
  voucher: "voucher",
  product: "product",
  hotel: "hotel",
  airline: "airline",
  ticket: "ticket",
  promotion: "promotion",
  campaign: "campaign",
  lead: "lead",
};

// GET - List deleted items for a model
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Only admin roles can view trash
    const userRoles = session.user.roles || [];
    const canViewTrash = userRoles.some((role: string) =>
      ["super_admin", "admin"].includes(role),
    );
    if (!canViewTrash) {
      return errorResponse("Not authorized to view deleted items", 403);
    }

    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model") || "";
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    if (!model || !RESTORABLE_MODELS[model]) {
      return errorResponse(
        `Invalid model. Available: ${Object.keys(RESTORABLE_MODELS).join(", ")}`,
        400,
      );
    }

    const prismaModel = (prisma as unknown as Record<string, unknown>)[
      RESTORABLE_MODELS[model]
    ] as {
      findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
      count: (args: Record<string, unknown>) => Promise<number>;
    };

    // Build where clause based on model
    const baseWhere: Record<string, unknown> = {
      isDeleted: true,
      ...(session.user.tenantId && { tenantId: session.user.tenantId }),
    };

    // Add search based on model
    if (search) {
      switch (model) {
        case "customer":
          baseWhere.OR = [
            { fullName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ];
          break;
        case "booking":
          baseWhere.OR = [
            { bookingCode: { contains: search, mode: "insensitive" } },
          ];
          break;
        case "package":
          baseWhere.OR = [
            { code: { contains: search, mode: "insensitive" } },
          ];
          break;
        case "employee":
          baseWhere.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { nip: { contains: search, mode: "insensitive" } },
          ];
          break;
        case "agent":
          baseWhere.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ];
          break;
        case "product":
          baseWhere.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
          ];
          break;
        default:
          if (search) {
            baseWhere.OR = [
              { code: { contains: search, mode: "insensitive" } },
            ];
          }
      }
    }

    const [items, total] = await Promise.all([
      prismaModel.findMany({
        where: baseWhere,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { deletedAt: "desc" },
      }),
      prismaModel.count({ where: baseWhere }),
    ]);

    return successResponse({
      data: items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching deleted items:", error);
    return errorResponse("Failed to fetch deleted items", 500);
  }
}

// POST - Restore deleted items
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Only admin roles can restore
    const userRoles = session.user.roles || [];
    const canRestore = userRoles.some((role: string) =>
      ["super_admin", "admin"].includes(role),
    );
    if (!canRestore) {
      return errorResponse("Not authorized to restore items", 403);
    }

    const body = await request.json();
    const { model, ids } = body;

    if (!model || !RESTORABLE_MODELS[model]) {
      return errorResponse("Invalid model", 400);
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse("No items selected for restore", 400);
    }

    const prismaModel = (prisma as unknown as Record<string, unknown>)[
      RESTORABLE_MODELS[model]
    ] as {
      updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
    };

    const result = await prismaModel.updateMany({
      where: {
        id: { in: ids },
        isDeleted: true,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId || "default",
        userId: session.user.id,
        action: "RESTORE",
        entity: model,
        entityId: ids.join(","),
        newValue: { restored: ids.length, model },
      },
    });

    return successResponse(
      { restored: result.count },
      `${result.count} item(s) restored successfully`,
    );
  } catch (error) {
    console.error("Error restoring items:", error);
    return errorResponse("Failed to restore items", 500);
  }
}

// DELETE - Permanent delete
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Only super_admin can permanently delete
    const userRoles = session.user.roles || [];
    if (!userRoles.includes("super_admin")) {
      return errorResponse("Only super admin can permanently delete items", 403);
    }

    const body = await request.json();
    const { model, ids } = body;

    if (!model || !RESTORABLE_MODELS[model]) {
      return errorResponse("Invalid model", 400);
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse("No items selected for deletion", 400);
    }

    const prismaModel = (prisma as unknown as Record<string, unknown>)[
      RESTORABLE_MODELS[model]
    ] as {
      deleteMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
    };

    const result = await prismaModel.deleteMany({
      where: {
        id: { in: ids },
        isDeleted: true,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    });

    return successResponse(
      { deleted: result.count },
      `${result.count} item(s) permanently deleted`,
    );
  } catch (error) {
    console.error("Error permanently deleting items:", error);
    return errorResponse("Failed to permanently delete items", 500);
  }
}
