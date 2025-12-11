import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-response";
import { auth } from "@/lib/auth";

/**
 * GET /api/leaves
 * Get leave requests with optional filters
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
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (session.user.tenantId) {
      where.employee = { tenantId: session.user.tenantId };
    }

    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (type) where.type = type;

    if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      where.startDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [total, data] = await Promise.all([
      prisma.leave.count({ where }),
      prisma.leave.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              nip: true,
              name: true,
              department: true,
              position: true,
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
    console.error("Get leaves error:", error);
    return errorResponse("Failed to fetch leave requests", 500);
  }
}

/**
 * POST /api/leaves
 * Submit leave request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { employeeId, type, startDate, endDate, reason } = body;

    if (!employeeId || !type || !startDate || !endDate || !reason) {
      return errorResponse(
        "employeeId, type, startDate, endDate, and reason are required",
        400,
      );
    }

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping leave requests
    const overlapping = await prisma.leave.findFirst({
      where: {
        employeeId,
        isDeleted: false,
        status: { not: "REJECTED" },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlapping) {
      return errorResponse("Leave request overlaps with existing request", 400);
    }

    // Check leave balance (for ANNUAL leave)
    if (type === "ANNUAL") {
      // Calculate used annual leave this year
      const currentYear = new Date().getFullYear();
      const usedLeave = await prisma.leave.aggregate({
        where: {
          employeeId,
          type: "ANNUAL",
          status: "APPROVED",
          isDeleted: false,
          startDate: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31),
          },
        },
        _sum: {
          days: true,
        },
      });

      const annualQuota = 12; // Default annual leave quota
      const remainingDays = annualQuota - (usedLeave._sum.days || 0);

      if (days > remainingDays) {
        return errorResponse(
          `Insufficient leave balance. Remaining: ${remainingDays} days`,
          400,
        );
      }
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId,
        type,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: "PENDING",
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nip: true,
            department: true,
          },
        },
      },
    });

    return successResponse(leave, "Leave request submitted successfully");
  } catch (error) {
    console.error("Create leave error:", error);
    return errorResponse("Failed to submit leave request", 500);
  }
}

/**
 * PUT /api/leaves
 * Approve/Reject leave request
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { id, status, rejectedReason } = body;

    if (!id || !status) {
      return errorResponse("Leave ID and status are required", 400);
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return errorResponse("Status must be APPROVED or REJECTED", 400);
    }

    const existing = await prisma.leave.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Leave request not found", 404);
    }

    if (existing.status !== "PENDING") {
      return errorResponse("Only pending requests can be processed", 400);
    }

    const leave = await prisma.leave.update({
      where: { id },
      data: {
        status,
        rejectedReason: status === "REJECTED" ? rejectedReason : null,
        approvedBy: session.user.id,
        approvedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nip: true,
            department: true,
          },
        },
      },
    });

    return successResponse(
      leave,
      `Leave request ${status.toLowerCase()} successfully`,
    );
  } catch (error) {
    console.error("Update leave error:", error);
    return errorResponse("Failed to process leave request", 500);
  }
}

/**
 * DELETE /api/leaves
 * Cancel leave request (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Leave ID is required", 400);
    }

    const existing = await prisma.leave.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Leave request not found", 404);
    }

    if (existing.status !== "PENDING") {
      return errorResponse("Only pending requests can be cancelled", 400);
    }

    await prisma.leave.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return successResponse(null, "Leave request cancelled successfully");
  } catch (error) {
    console.error("Delete leave error:", error);
    return errorResponse("Failed to cancel leave request", 500);
  }
}
