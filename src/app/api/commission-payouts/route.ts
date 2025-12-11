import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List commission payouts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const agentId = searchParams.get("agentId") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { isDeleted: false };

    if (agentId) where.agentId = agentId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.commissionPayout.findMany({
        where,
        include: {
          agent: {
            select: { id: true, name: true, code: true },
          },
          processedByUser: {
            select: { id: true, name: true },
          },
          commissions: {
            select: { id: true, amount: true, bookingId: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.commissionPayout.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get commission payouts error:", error);
    return errorResponse("Failed to fetch commission payouts", 500);
  }
}

// POST - Create commission payout
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      agentId,
      commissionIds,
      paymentMethod,
      bankName,
      bankAccount,
      accountName,
      notes,
    } = body;

    if (!agentId) {
      return errorResponse("Agent ID is required", 400);
    }

    if (!commissionIds || commissionIds.length === 0) {
      return errorResponse("At least one commission must be selected", 400);
    }

    // Get pending commissions for the agent
    const commissions = await prisma.commission.findMany({
      where: {
        id: { in: commissionIds },
        status: "PENDING",
        isDeleted: false,
        agentId,
      },
    });

    if (commissions.length === 0) {
      return errorResponse("No pending commissions found", 400);
    }

    // Calculate total amount
    const totalAmount = commissions.reduce(
      (sum, c) => sum + Number(c.amount),
      0,
    );

    // Generate payout code
    const count = await prisma.commissionPayout.count();
    const code = `PYT${String(count + 1).padStart(6, "0")}`;

    // Create payout
    const payout = await prisma.commissionPayout.create({
      data: {
        code,
        agentId,
        totalAmount,
        commissionCount: commissions.length,
        paymentMethod: paymentMethod || "BANK_TRANSFER",
        bankName,
        bankAccount,
        accountName,
        notes,
        status: "PENDING",
        tenantId: session.user.tenantId || "",
      },
      include: {
        agent: { select: { id: true, name: true, code: true } },
      },
    });

    // Update commission records with payout ID
    await prisma.commission.updateMany({
      where: { id: { in: commissionIds } },
      data: { payoutId: payout.id },
    });

    return successResponse(payout, "Commission payout created successfully");
  } catch (error) {
    console.error("Create commission payout error:", error);
    return errorResponse("Failed to create commission payout", 500);
  }
}

// PUT - Update/Process commission payout
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, status, payoutDate, reference, ...updateData } = body;

    if (!id) {
      return errorResponse("Payout ID is required", 400);
    }

    const existing = await prisma.commissionPayout.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Commission payout not found", 404);
    }

    // Track processing info
    const processingData: Record<string, unknown> = {};
    if (status === "PAID") {
      processingData.processedBy = session.user.id;
      processingData.processedAt = new Date();
      processingData.payoutDate = payoutDate
        ? new Date(payoutDate)
        : new Date();
    }

    // Update payout
    const payout = await prisma.commissionPayout.update({
      where: { id },
      data: {
        ...updateData,
        ...(status && { status }),
        ...(reference && { reference }),
        ...processingData,
      },
      include: {
        agent: { select: { id: true, name: true, code: true } },
        commissions: true,
        processedByUser: { select: { id: true, name: true } },
      },
    });

    // If paid, update all linked commissions to PAID
    if (status === "PAID") {
      await prisma.commission.updateMany({
        where: { payoutId: id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });
    }

    // If cancelled, revert commissions to PENDING
    if (status === "CANCELLED") {
      await prisma.commission.updateMany({
        where: { payoutId: id },
        data: {
          status: "PENDING",
          payoutId: null,
        },
      });
    }

    return successResponse(payout, "Commission payout updated successfully");
  } catch (error) {
    console.error("Update commission payout error:", error);
    return errorResponse("Failed to update commission payout", 500);
  }
}

// DELETE - Cancel/Soft delete commission payout
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Payout ID is required", 400);
    }

    const existing = await prisma.commissionPayout.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Commission payout not found", 404);
    }

    if (existing.status === "PAID") {
      return errorResponse("Cannot delete paid commission payout", 400);
    }

    // Revert commissions to PENDING
    await prisma.commission.updateMany({
      where: { payoutId: id },
      data: {
        status: "PENDING",
        payoutId: null,
      },
    });

    // Soft delete payout
    await prisma.commissionPayout.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return successResponse(null, "Commission payout deleted successfully");
  } catch (error) {
    console.error("Delete commission payout error:", error);
    return errorResponse("Failed to delete commission payout", 500);
  }
}
