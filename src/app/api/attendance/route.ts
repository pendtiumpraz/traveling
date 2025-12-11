import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-response";
import { auth } from "@/lib/auth";

/**
 * GET /api/attendance
 * Get employee attendance records
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
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    if (session.user.tenantId) {
      where.employee = { tenantId: session.user.tenantId };
    }

    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    if (date) {
      where.date = new Date(date);
    } else if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [total, data] = await Promise.all([
      prisma.employeeAttendance.count({ where }),
      prisma.employeeAttendance.findMany({
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
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get attendance error:", error);
    return errorResponse("Failed to fetch attendance records", 500);
  }
}

/**
 * POST /api/attendance
 * Create attendance record (clock in)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const {
      employeeId,
      date,
      clockIn,
      clockOut,
      status = "PRESENT",
      notes,
      clockInLat,
      clockInLng,
    } = body;

    if (!employeeId || !date) {
      return errorResponse("employeeId and date are required", 400);
    }

    // Check if attendance already exists for this date
    const existingAttendance = await prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
    });

    if (existingAttendance) {
      return errorResponse("Attendance already recorded for this date", 400);
    }

    // Calculate work hours if clock out provided
    let workHours = null;
    if (clockIn && clockOut) {
      const inTime = new Date(clockIn);
      const outTime = new Date(clockOut);
      const diffMs = outTime.getTime() - inTime.getTime();
      workHours = diffMs / (1000 * 60 * 60);
    }

    const attendance = await prisma.employeeAttendance.create({
      data: {
        employeeId,
        date: new Date(date),
        clockIn: clockIn ? new Date(clockIn) : null,
        clockOut: clockOut ? new Date(clockOut) : null,
        status,
        workHours,
        notes,
        clockInLat,
        clockInLng,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
      },
    });

    return successResponse(attendance, "Attendance recorded successfully");
  } catch (error) {
    console.error("Create attendance error:", error);
    return errorResponse("Failed to create attendance record", 500);
  }
}

/**
 * PUT /api/attendance
 * Update attendance record (clock out or correction)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { id, clockOut, status, notes, clockOutLat, clockOutLng } = body;

    if (!id) {
      return errorResponse("Attendance ID is required", 400);
    }

    const existing = await prisma.employeeAttendance.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Attendance record not found", 404);
    }

    // Calculate work hours if updating clock out
    let workHours = existing.workHours;
    if (clockOut && existing.clockIn) {
      const inTime = new Date(existing.clockIn);
      const outTime = new Date(clockOut);
      const diffMs = outTime.getTime() - inTime.getTime();
      workHours = diffMs / (1000 * 60 * 60);
    }

    const attendance = await prisma.employeeAttendance.update({
      where: { id },
      data: {
        clockOut: clockOut ? new Date(clockOut) : existing.clockOut,
        status: status || existing.status,
        notes: notes !== undefined ? notes : existing.notes,
        workHours,
        clockOutLat,
        clockOutLng,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nip: true,
          },
        },
      },
    });

    return successResponse(attendance, "Attendance updated successfully");
  } catch (error) {
    console.error("Update attendance error:", error);
    return errorResponse("Failed to update attendance record", 500);
  }
}
