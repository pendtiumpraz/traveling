import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List payroll records
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const employeeId = searchParams.get("employeeId") || "";
    const period = searchParams.get("period") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { isDeleted: false };

    if (employeeId) where.employeeId = employeeId;
    if (period) where.period = period;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              nip: true,
              department: true,
              position: true,
            },
          },
        },
        orderBy: { period: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payroll.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get payroll error:", error);
    return errorResponse("Failed to fetch payroll records", 500);
  }
}

// POST - Create payroll
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      employeeId,
      period, // YYYY-MM format
      baseSalary,
      allowances,
      overtime,
      deductions,
      details,
    } = body;

    if (!employeeId || !period) {
      return errorResponse("Employee ID and period are required", 400);
    }

    // Get employee data
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, isDeleted: false },
    });

    if (!employee) {
      return errorResponse("Employee not found", 404);
    }

    // Check if payroll already exists
    const existing = await prisma.payroll.findFirst({
      where: { employeeId, period, isDeleted: false },
    });

    if (existing) {
      return errorResponse("Payroll for this period already exists", 400);
    }

    const salary = baseSalary || Number(employee.baseSalary) || 0;
    const allow = allowances || 0;
    const ot = overtime || 0;
    const ded = deductions || 0;
    const netSalary = salary + allow + ot - ded;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        period,
        baseSalary: salary,
        allowances: allow,
        overtime: ot,
        deductions: ded,
        netSalary,
        details,
        status: "DRAFT",
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nip: true,
            department: true,
            position: true,
          },
        },
      },
    });

    return successResponse(payroll, "Payroll created successfully");
  } catch (error) {
    console.error("Create payroll error:", error);
    return errorResponse("Failed to create payroll", 500);
  }
}

// PUT - Update payroll
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, status, ...updateData } = body;

    if (!id) {
      return errorResponse("Payroll ID is required", 400);
    }

    const existing = await prisma.payroll.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Payroll not found", 404);
    }

    // Recalculate net salary if components changed
    let netSalaryCalc: number | undefined;
    if (
      updateData.baseSalary ||
      updateData.allowances ||
      updateData.overtime ||
      updateData.deductions
    ) {
      const base = updateData.baseSalary ?? Number(existing.baseSalary);
      const allow = updateData.allowances ?? Number(existing.allowances);
      const ot = updateData.overtime ?? Number(existing.overtime);
      const ded = updateData.deductions ?? Number(existing.deductions);
      netSalaryCalc = base + allow + ot - ded;
    }

    const payroll = await prisma.payroll.update({
      where: { id },
      data: {
        ...updateData,
        ...(netSalaryCalc !== undefined && { netSalary: netSalaryCalc }),
        ...(status && { status }),
        ...(status === "PAID" && { paidAt: new Date() }),
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nip: true,
            department: true,
            position: true,
          },
        },
      },
    });

    return successResponse(payroll, "Payroll updated successfully");
  } catch (error) {
    console.error("Update payroll error:", error);
    return errorResponse("Failed to update payroll", 500);
  }
}

// DELETE - Soft delete payroll
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Payroll ID is required", 400);
    }

    const existing = await prisma.payroll.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Payroll not found", 404);
    }

    if (existing.status === "PAID") {
      return errorResponse("Cannot delete paid payroll", 400);
    }

    await prisma.payroll.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return successResponse(null, "Payroll deleted successfully");
  } catch (error) {
    console.error("Delete payroll error:", error);
    return errorResponse("Failed to delete payroll", 500);
  }
}
