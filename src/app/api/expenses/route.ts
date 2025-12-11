import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List expenses with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { isDeleted: false };

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { vendor: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) where.category = category;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          schedule: {
            include: {
              package: true,
            },
          },
          approvedByUser: {
            select: { id: true, name: true },
          },
        },
        orderBy: { expenseDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get expenses error:", error);
    return errorResponse("Failed to fetch expenses", 500);
  }
}

// POST - Create expense
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      description,
      amount,
      category,
      vendor,
      reference,
      expenseDate,
      scheduleId,
      notes,
    } = body;

    if (!description || !amount || !category) {
      return errorResponse(
        "Description, amount, and category are required",
        400,
      );
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category,
        vendor,
        reference,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        scheduleId: scheduleId || null,
        notes,
        status: "PENDING",
        tenantId: session.user.tenantId || "",
      },
    });

    return successResponse(expense, "Expense created successfully");
  } catch (error) {
    console.error("Create expense error:", error);
    return errorResponse("Failed to create expense", 500);
  }
}

// PUT - Update expense
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, status, ...updateData } = body;

    if (!id) {
      return errorResponse("Expense ID is required", 400);
    }

    const approvalData: Record<string, unknown> = {};
    if (status === "APPROVED" || status === "REJECTED") {
      approvalData.approvedBy = session.user.id;
      approvalData.approvedAt = new Date();
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...updateData,
        ...(status && { status }),
        ...approvalData,
        ...(updateData.amount && { amount: parseFloat(updateData.amount) }),
        ...(updateData.expenseDate && {
          expenseDate: new Date(updateData.expenseDate),
        }),
      },
    });

    return successResponse(expense, "Expense updated successfully");
  } catch (error) {
    console.error("Update expense error:", error);
    return errorResponse("Failed to update expense", 500);
  }
}

// DELETE - Soft delete expense
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Expense ID is required", 400);
    }

    await prisma.expense.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return successResponse(null, "Expense deleted successfully");
  } catch (error) {
    console.error("Delete expense error:", error);
    return errorResponse("Failed to delete expense", 500);
  }
}
