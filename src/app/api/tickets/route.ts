import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List tickets
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
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const customerId = searchParams.get("customerId") || "";

    const where: Record<string, unknown> = { isDeleted: false };

    if (search) {
      where.OR = [
        { ticketNo: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (customerId) where.customerId = customerId;

    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true, email: true },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get tickets error:", error);
    return errorResponse("Failed to fetch tickets", 500);
  }
}

// POST - Create ticket
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { customerId, subject, description, category, priority } = body;

    if (!customerId || !subject || !category) {
      return errorResponse(
        "Customer ID, subject and category are required",
        400,
      );
    }

    // Generate ticket number
    const count = await prisma.ticket.count();
    const ticketNo = `TKT${String(count + 1).padStart(6, "0")}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNo,
        customerId,
        subject,
        description: description || "",
        category,
        priority: priority || "MEDIUM",
        status: "OPEN",
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    return successResponse(ticket, "Ticket created successfully");
  } catch (error) {
    console.error("Create ticket error:", error);
    return errorResponse("Failed to create ticket", 500);
  }
}

// PUT - Update ticket
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, status, assignedTo, resolution, ...updateData } = body;

    if (!id) {
      return errorResponse("Ticket ID is required", 400);
    }

    const existing = await prisma.ticket.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Ticket not found", 404);
    }

    // Track status changes
    const statusData: Record<string, unknown> = {};
    if (status && status !== existing.status) {
      if (status === "RESOLVED" || status === "CLOSED") {
        statusData.resolvedAt = new Date();
        if (resolution) statusData.resolution = resolution;
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...updateData,
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...statusData,
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
      },
    });

    return successResponse(ticket, "Ticket updated successfully");
  } catch (error) {
    console.error("Update ticket error:", error);
    return errorResponse("Failed to update ticket", 500);
  }
}

// DELETE - Soft delete ticket
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Ticket ID is required", 400);
    }

    await prisma.ticket.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return successResponse(null, "Ticket deleted successfully");
  } catch (error) {
    console.error("Delete ticket error:", error);
    return errorResponse("Failed to delete ticket", 500);
  }
}
