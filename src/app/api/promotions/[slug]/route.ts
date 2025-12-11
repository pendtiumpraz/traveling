import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET - Get promotion by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const now = new Date();

    const promotion = await prisma.promotion.findFirst({
      where: {
        slug,
        isDeleted: false,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!promotion) {
      return NextResponse.json(errorResponse("Promosi tidak ditemukan"), {
        status: 404,
      });
    }

    // Get related packages if specified
    let packages = null;
    if (
      promotion.packageIds &&
      Array.isArray(promotion.packageIds) &&
      promotion.packageIds.length > 0
    ) {
      packages = await prisma.package.findMany({
        where: {
          id: { in: promotion.packageIds as string[] },
          isDeleted: false,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          thumbnail: true,
          duration: true,
          type: true,
        },
      });
    }

    // Transform response
    const response = {
      ...promotion,
      discountValue: Number(promotion.discountValue),
      maxDiscount: promotion.maxDiscount ? Number(promotion.maxDiscount) : null,
      minPurchase: promotion.minPurchase ? Number(promotion.minPurchase) : null,
      remainingQuota: promotion.quota ? promotion.quota - promotion.used : null,
      daysLeft: Math.ceil(
        (new Date(promotion.endDate).getTime() - now.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
      packages,
    };

    return NextResponse.json(successResponse(response));
  } catch (error) {
    console.error("Failed to fetch promotion:", error);
    return NextResponse.json(errorResponse("Gagal mengambil data promosi"), {
      status: 500,
    });
  }
}
