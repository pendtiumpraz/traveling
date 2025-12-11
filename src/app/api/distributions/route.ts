import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List item distributions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const manifestId = searchParams.get("manifestId") || "";
    const productId = searchParams.get("productId") || "";
    const customerId = searchParams.get("customerId") || "";

    const where: Record<string, unknown> = {};

    if (manifestId) where.manifestId = manifestId;
    if (productId) where.productId = productId;
    if (customerId) where.customerId = customerId;

    const [data, total] = await Promise.all([
      prisma.itemDistribution.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, code: true, unit: true },
          },
          customer: {
            select: { id: true, fullName: true, phone: true },
          },
          manifest: {
            select: { id: true, code: true, name: true },
          },
        },
        orderBy: { distributedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.itemDistribution.count({ where }),
    ]);

    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    console.error("Get distributions error:", error);
    return errorResponse("Failed to fetch distributions", 500);
  }
}

// POST - Create distribution
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { manifestId, productId, customerId, quantity } = body;

    if (!manifestId || !productId || !customerId || !quantity) {
      return errorResponse(
        "Manifest ID, product ID, customer ID, and quantity are required",
        400,
      );
    }

    // Verify manifest exists and customer is participant
    const manifest = await prisma.manifest.findUnique({
      where: { id: manifestId, isDeleted: false },
      include: {
        participants: {
          where: { customerId },
        },
      },
    });

    if (!manifest) {
      return errorResponse("Manifest not found", 404);
    }

    if (manifest.participants.length === 0) {
      return errorResponse(
        "Customer is not a participant in this manifest",
        400,
      );
    }

    // Check if already distributed to this customer for this manifest
    const existing = await prisma.itemDistribution.findFirst({
      where: {
        manifestId,
        productId,
        customerId,
      },
    });

    if (existing) {
      return errorResponse(
        "Item already distributed to this customer for this manifest",
        400,
      );
    }

    const distribution = await prisma.itemDistribution.create({
      data: {
        manifestId,
        productId,
        customerId,
        quantity,
        distributedBy: session.user.id,
        distributedAt: new Date(),
      },
      include: {
        product: {
          select: { id: true, name: true, code: true, unit: true },
        },
        customer: {
          select: { id: true, fullName: true, phone: true },
        },
        manifest: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return successResponse(distribution, "Distribution recorded successfully");
  } catch (error) {
    console.error("Create distribution error:", error);
    return errorResponse("Failed to record distribution", 500);
  }
}

// PUT - Bulk distribution (distribute to all participants)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { manifestId, productId, quantityPerPerson } = body;

    if (!manifestId || !productId || !quantityPerPerson) {
      return errorResponse(
        "Manifest ID, product ID, and quantity per person are required",
        400,
      );
    }

    // Get manifest with participants
    const manifest = await prisma.manifest.findUnique({
      where: { id: manifestId, isDeleted: false },
      include: {
        participants: true,
      },
    });

    if (!manifest) {
      return errorResponse("Manifest not found", 404);
    }

    // Filter out customers who already received this product
    const existingDistributions = await prisma.itemDistribution.findMany({
      where: {
        manifestId,
        productId,
      },
      select: { customerId: true },
    });

    const distributedCustomerIds = existingDistributions.map(
      (d) => d.customerId,
    );
    const eligibleParticipants = manifest.participants.filter(
      (p) => !distributedCustomerIds.includes(p.customerId),
    );

    if (eligibleParticipants.length === 0) {
      return errorResponse("All participants already received this item", 400);
    }

    // Create distributions for all eligible participants
    const distributions = await prisma.itemDistribution.createMany({
      data: eligibleParticipants.map((p) => ({
        manifestId,
        productId,
        customerId: p.customerId,
        quantity: quantityPerPerson,
        distributedBy: session.user.id,
        distributedAt: new Date(),
      })),
    });

    return successResponse(
      { count: distributions.count },
      `Distributed to ${distributions.count} participants`,
    );
  } catch (error) {
    console.error("Bulk distribution error:", error);
    return errorResponse("Failed to bulk distribute", 500);
  }
}

// DELETE - Delete distribution
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Distribution ID is required", 400);
    }

    await prisma.itemDistribution.delete({
      where: { id },
    });

    return successResponse(null, "Distribution cancelled successfully");
  } catch (error) {
    console.error("Delete distribution error:", error);
    return errorResponse("Failed to cancel distribution", 500);
  }
}
