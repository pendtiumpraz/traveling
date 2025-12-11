import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-response";
import { auth } from "@/lib/auth";

/**
 * GET /api/commissions
 * Get commission records
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const agentId = searchParams.get("agentId");
    const salesId = searchParams.get("salesId");
    const status = searchParams.get("status");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (agentId) where.agentId = agentId;
    if (salesId) where.salesId = salesId;
    if (status) where.status = status;

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [total, data] = await Promise.all([
      prisma.commission.count({ where }),
      prisma.commission.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              code: true,
              name: true,
              tier: true,
              commissionRate: true,
            },
          },
          sales: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              bookingCode: true,
              totalPrice: true,
              customer: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get commissions error:", error);
    return errorResponse("Failed to fetch commissions", 500);
  }
}

/**
 * POST /api/commissions
 * Calculate and create commission for a booking
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return errorResponse("bookingId is required", 400);
    }

    // Get booking with agent info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, isDeleted: false },
      include: {
        agent: true,
        sales: true,
        customer: true,
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    if (!booking.agentId && !booking.salesId) {
      return errorResponse("Booking has no agent or sales", 400);
    }

    // Check if commission already exists
    const existing = await prisma.commission.findFirst({
      where: {
        bookingId,
        isDeleted: false,
      },
    });

    if (existing) {
      return errorResponse("Commission already exists for this booking", 400);
    }

    // Calculate commission rate
    let commissionRate = 5; // Default rate
    if (booking.agent) {
      commissionRate = Number(booking.agent.commissionRate);
    }

    const baseAmount = Number(booking.totalPrice);
    const commissionAmount = (baseAmount * commissionRate) / 100;

    const commission = await prisma.commission.create({
      data: {
        bookingId,
        agentId: booking.agentId,
        salesId: booking.salesId,
        amount: commissionAmount,
        rate: commissionRate,
        status: "PENDING",
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingCode: true,
          },
        },
      },
    });

    return successResponse(commission, "Commission calculated successfully");
  } catch (error) {
    console.error("Create commission error:", error);
    return errorResponse("Failed to create commission", 500);
  }
}

/**
 * PUT /api/commissions
 * Update commission status (mark as paid)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { id, ids, status, paidAt } = body;

    // Bulk update
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const result = await prisma.commission.updateMany({
        where: {
          id: { in: ids },
          isDeleted: false,
        },
        data: {
          status: status || "PAID",
          paidAt: paidAt ? new Date(paidAt) : new Date(),
          paidBy: session.user.id,
        },
      });

      return successResponse(
        { updated: result.count },
        `${result.count} commissions updated`,
      );
    }

    // Single update
    if (!id) {
      return errorResponse("Commission ID is required", 400);
    }

    const commission = await prisma.commission.update({
      where: { id, isDeleted: false },
      data: {
        status: status || "PAID",
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        paidBy: session.user.id,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(commission, "Commission updated successfully");
  } catch (error) {
    console.error("Update commission error:", error);
    return errorResponse("Failed to update commission", 500);
  }
}
