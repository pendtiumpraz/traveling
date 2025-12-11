import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// Supported models for bulk operations
const ALLOWED_MODELS = [
  "customer",
  "booking",
  "package",
  "schedule",
  "payment",
  "invoice",
  "manifest",
  "flight",
  "hotel",
  "airline",
  "bank",
  "supplier",
  "product",
  "voucher",
  "promotion",
  "campaign",
  "ticket",
  "lead",
  "employee",
  "agent",
  "expense",
  "device",
] as const;

type AllowedModel = (typeof ALLOWED_MODELS)[number];

// POST - Bulk Delete (soft delete)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { model, ids, action } = await request.json();

    if (!model || !ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse("Model and ids array are required", 400);
    }

    if (!ALLOWED_MODELS.includes(model as AllowedModel)) {
      return errorResponse(
        `Model '${model}' is not supported for bulk operations`,
        400,
      );
    }

    if (action !== "delete") {
      return errorResponse("Only 'delete' action is supported", 400);
    }

    // Check permissions based on model
    const tenantId = (session.user as { tenantId?: string }).tenantId;

    // Perform soft delete
    const result = await performBulkDelete(
      model as AllowedModel,
      ids,
      tenantId,
      session.user.id,
    );

    return successResponse(
      {
        deletedCount: result.count,
        model,
        action: "delete",
      },
      `Successfully deleted ${result.count} ${model}(s)`,
    );
  } catch (error) {
    console.error("Bulk operation error:", error);
    return errorResponse("Failed to perform bulk operation", 500);
  }
}

async function performBulkDelete(
  model: AllowedModel,
  ids: string[],
  tenantId: string | undefined,
  userId: string,
): Promise<{ count: number }> {
  const now = new Date();
  const softDeleteData = {
    isDeleted: true,
    deletedAt: now,
    deletedBy: userId,
  };

  // Build where clause with tenant filter where applicable
  const whereClause: Record<string, unknown> = {
    id: { in: ids },
    isDeleted: false,
  };

  // Add tenant filter for tenant-scoped models
  const tenantScopedModels = [
    "customer",
    "booking",
    "package",
    "voucher",
    "promotion",
    "campaign",
    "lead",
    "employee",
    "agent",
    "expense",
    "device",
  ];

  if (tenantScopedModels.includes(model) && tenantId) {
    whereClause.tenantId = tenantId;
  }

  // Perform soft delete based on model
  switch (model) {
    case "customer":
      return prisma.customer.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "booking":
      return prisma.booking.updateMany({
        where: whereClause,
        data: {
          ...softDeleteData,
          cancelledAt: now,
          cancelReason: "Bulk deleted",
        },
      });

    case "package":
      return prisma.package.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "schedule":
      return prisma.schedule.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "payment":
      return prisma.payment.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "invoice":
      return prisma.invoice.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "manifest":
      return prisma.manifest.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "flight":
      return prisma.flight.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "hotel":
      return prisma.hotel.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "airline":
      return prisma.airline.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "bank":
      return prisma.bank.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "supplier":
      return prisma.supplier.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "product":
      return prisma.product.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "voucher":
      return prisma.voucher.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "promotion":
      return prisma.promotion.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "campaign":
      return prisma.campaign.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "ticket":
      return prisma.ticket.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "lead":
      return prisma.lead.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "employee":
      return prisma.employee.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "agent":
      return prisma.agent.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "expense":
      return prisma.expense.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    case "device":
      return prisma.device.updateMany({
        where: whereClause,
        data: softDeleteData,
      });

    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}
