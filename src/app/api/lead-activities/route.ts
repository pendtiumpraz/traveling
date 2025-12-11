import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List lead activities
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const customerId = searchParams.get("customerId") || "";
    const type = searchParams.get("type") || "";

    const where: Record<string, unknown> = {};

    if (customerId) where.customerId = customerId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      prisma.leadActivity.findMany({
        where,
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.leadActivity.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get lead activities error:", error);
    return errorResponse("Failed to fetch lead activities", 500);
  }
}

// POST - Create lead activity
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { customerId, type, subject, description, dueDate, completedAt } =
      body;

    if (!customerId || !type || !subject) {
      return errorResponse("Customer ID, type, and subject are required", 400);
    }

    const activity = await prisma.leadActivity.create({
      data: {
        customerId,
        type,
        subject,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
        createdBy: session.user.id,
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    return successResponse(activity, "Activity created successfully");
  } catch (error) {
    console.error("Create lead activity error:", error);
    return errorResponse("Failed to create activity", 500);
  }
}

// PUT - Update lead activity
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse("Activity ID is required", 400);
    }

    const activity = await prisma.leadActivity.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.dueDate && {
          dueDate: new Date(updateData.dueDate),
        }),
        ...(updateData.completedAt && {
          completedAt: new Date(updateData.completedAt),
        }),
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    return successResponse(activity, "Activity updated successfully");
  } catch (error) {
    console.error("Update lead activity error:", error);
    return errorResponse("Failed to update activity", 500);
  }
}

// DELETE - Delete lead activity
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Activity ID is required", 400);
    }

    await prisma.leadActivity.delete({
      where: { id },
    });

    return successResponse(null, "Activity deleted successfully");
  } catch (error) {
    console.error("Delete lead activity error:", error);
    return errorResponse("Failed to delete activity", 500);
  }
}
