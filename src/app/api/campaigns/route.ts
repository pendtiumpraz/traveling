import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List campaigns
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
    const type = searchParams.get("type") || "";

    const where: Record<string, unknown> = { isDeleted: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get campaigns error:", error);
    return errorResponse("Failed to fetch campaigns", 500);
  }
}

// POST - Create campaign
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { name, type, subject, content, template, scheduledAt } = body;

    if (!name || !type || !content) {
      return errorResponse("Name, type, and content are required", 400);
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        type,
        subject,
        content,
        template,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: "DRAFT",
        createdBy: session.user.id,
        tenantId: session.user.tenantId || "",
      },
    });

    return successResponse(campaign, "Campaign created successfully");
  } catch (error) {
    console.error("Create campaign error:", error);
    return errorResponse("Failed to create campaign", 500);
  }
}

// PUT - Update campaign
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse("Campaign ID is required", 400);
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.scheduledAt && {
          scheduledAt: new Date(updateData.scheduledAt),
        }),
      },
    });

    return successResponse(campaign, "Campaign updated successfully");
  } catch (error) {
    console.error("Update campaign error:", error);
    return errorResponse("Failed to update campaign", 500);
  }
}

// DELETE - Soft delete campaign
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Campaign ID is required", 400);
    }

    await prisma.campaign.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return successResponse(null, "Campaign deleted successfully");
  } catch (error) {
    console.error("Delete campaign error:", error);
    return errorResponse("Failed to delete campaign", 500);
  }
}
