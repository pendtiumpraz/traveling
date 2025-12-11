import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET - List referrals
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const referrerId = searchParams.get("referrerId") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { isDeleted: false };

    if (referrerId) where.referrerId = referrerId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        include: {
          referrer: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          referred: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          booking: {
            select: { id: true, bookingCode: true, totalPrice: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.referral.count({ where }),
    ]);

    // Calculate totals
    const totals = await prisma.referral.aggregate({
      where: { ...where, status: "REWARDED" },
      _sum: { rewardAmount: true },
      _count: true,
    });

    return paginatedResponse(data, page, limit, total);
  } catch (error) {
    console.error("Get referrals error:", error);
    return errorResponse("Failed to fetch referrals", 500);
  }
}

// POST - Create referral
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      referrerId,
      referredId,
      referredEmail,
      referredPhone,
      referredName,
      rewardType,
      rewardValue,
      notes,
    } = body;

    if (!referrerId) {
      return errorResponse("Referrer ID is required", 400);
    }

    if (!referredId && !referredEmail && !referredPhone) {
      return errorResponse(
        "Referred customer ID, email, or phone is required",
        400,
      );
    }

    // Check if referrer exists
    const referrer = await prisma.customer.findUnique({
      where: { id: referrerId, isDeleted: false },
    });

    if (!referrer) {
      return errorResponse("Referrer not found", 404);
    }

    // Generate referral code
    const count = await prisma.referral.count({ where: { referrerId } });
    const code = `REF-${referrer.id.slice(-6).toUpperCase()}-${String(count + 1).padStart(3, "0")}`;

    // Check for existing referral with same referred
    if (referredId) {
      const existing = await prisma.referral.findFirst({
        where: {
          referrerId,
          referredId,
          isDeleted: false,
        },
      });

      if (existing) {
        return errorResponse("Referral already exists for this customer", 400);
      }
    }

    const referral = await prisma.referral.create({
      data: {
        code,
        referrerId,
        referredId: referredId || null,
        referredEmail,
        referredPhone,
        referredName,
        rewardType: rewardType || "FIXED",
        rewardValue: rewardValue || 100000,
        status: referredId ? "REGISTERED" : "PENDING",
        tenantId: session.user.tenantId || "",
        notes,
      },
      include: {
        referrer: { select: { id: true, fullName: true, email: true } },
        referred: { select: { id: true, fullName: true, email: true } },
      },
    });

    return successResponse(referral, "Referral created successfully");
  } catch (error) {
    console.error("Create referral error:", error);
    return errorResponse("Failed to create referral", 500);
  }
}

// PUT - Update referral (process reward)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { id, status, bookingId, rewardAmount, ...updateData } = body;

    if (!id) {
      return errorResponse("Referral ID is required", 400);
    }

    const existing = await prisma.referral.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Referral not found", 404);
    }

    // Prepare update data
    const data: Record<string, unknown> = { ...updateData };

    if (status) data.status = status;
    if (bookingId) data.bookingId = bookingId;

    // If converting to CONVERTED (booking made) or REWARDED
    if (status === "CONVERTED" && bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (booking) {
        // Calculate reward based on type
        let calculatedReward = 0;
        if (existing.rewardType === "PERCENTAGE") {
          calculatedReward =
            Number(booking.totalPrice) * (Number(existing.rewardValue) / 100);
        } else if (existing.rewardType === "FIXED") {
          calculatedReward = Number(existing.rewardValue);
        } else if (existing.rewardType === "POINTS") {
          calculatedReward = Number(existing.rewardValue);
        }
        data.rewardAmount = rewardAmount || calculatedReward;
        data.convertedAt = new Date();
      }
    }

    if (status === "REWARDED") {
      data.rewardedAt = new Date();
    }

    const referral = await prisma.referral.update({
      where: { id },
      data,
      include: {
        referrer: { select: { id: true, fullName: true, email: true } },
        referred: { select: { id: true, fullName: true, email: true } },
        booking: { select: { id: true, bookingCode: true, totalPrice: true } },
      },
    });

    return successResponse(referral, "Referral updated successfully");
  } catch (error) {
    console.error("Update referral error:", error);
    return errorResponse("Failed to update referral", 500);
  }
}

// DELETE - Soft delete referral
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Referral ID is required", 400);
    }

    const existing = await prisma.referral.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return errorResponse("Referral not found", 404);
    }

    if (existing.status === "REWARDED") {
      return errorResponse("Cannot delete rewarded referral", 400);
    }

    await prisma.referral.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return successResponse(null, "Referral deleted successfully");
  } catch (error) {
    console.error("Delete referral error:", error);
    return errorResponse("Failed to delete referral", 500);
  }
}
