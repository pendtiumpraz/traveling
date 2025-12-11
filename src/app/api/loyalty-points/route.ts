import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List loyalty points transactions
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
      prisma.loyaltyPoint.findMany({
        where,
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.loyaltyPoint.count({ where }),
    ]);

    // Calculate total points for customer if customerId provided
    let totalPoints = 0;
    if (customerId) {
      const earned = await prisma.loyaltyPoint.aggregate({
        where: { customerId, type: "EARN" },
        _sum: { points: true },
      });
      const redeemed = await prisma.loyaltyPoint.aggregate({
        where: { customerId, type: "REDEEM" },
        _sum: { points: true },
      });
      totalPoints = (earned._sum?.points || 0) - (redeemed._sum?.points || 0);
    }

    return paginatedResponse(data, page, limit, total);
  } catch (error) {
    console.error("Get loyalty points error:", error);
    return errorResponse("Failed to fetch loyalty points", 500);
  }
}

// POST - Add/Redeem loyalty points
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { customerId, type, points, description, referenceId, expiresAt } =
      body;

    if (!customerId || !type || !points) {
      return errorResponse("Customer ID, type, and points are required", 400);
    }

    if (!["EARN", "REDEEM"].includes(type)) {
      return errorResponse("Type must be EARN or REDEEM", 400);
    }

    // If redeeming, check if customer has enough points
    if (type === "REDEEM") {
      const earned = await prisma.loyaltyPoint.aggregate({
        where: { customerId, type: "EARN" },
        _sum: { points: true },
      });
      const redeemed = await prisma.loyaltyPoint.aggregate({
        where: { customerId, type: "REDEEM" },
        _sum: { points: true },
      });
      const balance = (earned._sum?.points || 0) - (redeemed._sum?.points || 0);

      if (balance < points) {
        return errorResponse(`Insufficient points. Balance: ${balance}`, 400);
      }
    }

    const loyaltyPoint = await prisma.loyaltyPoint.create({
      data: {
        customerId,
        type,
        points,
        description: description || `${type} points`,
        referenceId: referenceId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });

    return successResponse(loyaltyPoint, "Points recorded successfully");
  } catch (error) {
    console.error("Create loyalty point error:", error);
    return errorResponse("Failed to record points", 500);
  }
}
