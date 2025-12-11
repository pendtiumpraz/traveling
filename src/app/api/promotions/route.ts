import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-response";
import { z } from "zod";
import { Promotion } from "@prisma/client";

const promotionSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  type: z.enum([
    "EARLY_BIRD",
    "LAST_MINUTE",
    "FLASH_SALE",
    "SEASONAL",
    "PACKAGE_DEAL",
    "GROUP_DISCOUNT",
    "REFERRAL",
    "LOYALTY",
  ]),
  description: z.string().optional(),
  content: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).default("PERCENTAGE"),
  discountValue: z.number().min(0),
  maxDiscount: z.number().optional(),
  minPurchase: z.number().optional(),
  packageIds: z.array(z.string()).optional(),
  businessTypes: z.array(z.string()).optional(),
  startDate: z.string(),
  endDate: z.string(),
  quota: z.number().optional(),
  thumbnail: z.string().optional(),
  banner: z.string().optional(),
  images: z.array(z.string()).optional(),
  badgeText: z.string().optional(),
  badgeColor: z.string().optional(),
  priority: z.number().default(0),
  showOnHome: z.boolean().default(false),
  showOnListing: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  terms: z.string().optional(),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// GET - List promotions (public or admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const isPublic = searchParams.get("public") === "true";
    const featured = searchParams.get("featured") === "true";
    const home = searchParams.get("home") === "true";

    const skip = (page - 1) * limit;
    const now = new Date();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isDeleted: false };

    // For public requests, only show active promotions within date range
    if (isPublic) {
      where.isActive = true;
      where.startDate = { lte: now };
      where.endDate = { gte: now };
      where.showOnListing = true;
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (home) {
      where.showOnHome = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      }),
      prisma.promotion.count({ where }),
    ]);

    // Transform for response
    const transformedPromos = promotions.map((promo: Promotion) => ({
      ...promo,
      discountValue: Number(promo.discountValue),
      maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
      minPurchase: promo.minPurchase ? Number(promo.minPurchase) : null,
      remainingQuota: promo.quota ? promo.quota - promo.used : null,
      isExpiringSoon:
        new Date(promo.endDate).getTime() - now.getTime() <
        7 * 24 * 60 * 60 * 1000,
      daysLeft: Math.ceil(
        (new Date(promo.endDate).getTime() - now.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
    }));

    return NextResponse.json(
      paginatedResponse(transformedPromos, total, page, limit),
    );
  } catch (error) {
    console.error("Failed to fetch promotions:", error);
    return NextResponse.json(errorResponse("Gagal mengambil data promosi"), {
      status: 500,
    });
  }
}

// POST - Create promotion (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const validatedData = promotionSchema.parse(body);

    // Check if slug already exists
    const existingPromo = await prisma.promotion.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingPromo) {
      return NextResponse.json(errorResponse("Slug sudah digunakan"), {
        status: 400,
      });
    }

    const promotion = await prisma.promotion.create({
      data: {
        tenantId: session.user.tenantId,
        title: validatedData.title,
        slug: validatedData.slug,
        type: validatedData.type,
        description: validatedData.description,
        content: validatedData.content,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        maxDiscount: validatedData.maxDiscount,
        minPurchase: validatedData.minPurchase,
        packageIds: validatedData.packageIds,
        businessTypes: validatedData.businessTypes,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        quota: validatedData.quota,
        thumbnail: validatedData.thumbnail,
        banner: validatedData.banner,
        images: validatedData.images,
        badgeText: validatedData.badgeText,
        badgeColor: validatedData.badgeColor,
        priority: validatedData.priority,
        showOnHome: validatedData.showOnHome,
        showOnListing: validatedData.showOnListing,
        isFeatured: validatedData.isFeatured,
        terms: validatedData.terms,
        isActive: validatedData.isActive,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
      },
    });

    return NextResponse.json(
      successResponse(promotion, "Promosi berhasil dibuat"),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse(error.issues[0].message), {
        status: 400,
      });
    }
    console.error("Failed to create promotion:", error);
    return NextResponse.json(errorResponse("Gagal membuat promosi"), {
      status: 500,
    });
  }
}

// PUT - Update promotion
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.tenantId) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(errorResponse("ID promosi wajib diisi"), {
        status: 400,
      });
    }

    const validatedData = promotionSchema.partial().parse(data);

    // Check slug uniqueness if changed
    if (validatedData.slug) {
      const existingPromo = await prisma.promotion.findFirst({
        where: { slug: validatedData.slug, NOT: { id } },
      });
      if (existingPromo) {
        return NextResponse.json(errorResponse("Slug sudah digunakan"), {
          status: 400,
        });
      }
    }

    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.startDate)
      updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate)
      updateData.endDate = new Date(validatedData.endDate);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      successResponse(promotion, "Promosi berhasil diperbarui"),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse(error.issues[0].message), {
        status: 400,
      });
    }
    console.error("Failed to update promotion:", error);
    return NextResponse.json(errorResponse("Gagal memperbarui promosi"), {
      status: 500,
    });
  }
}

// DELETE - Soft delete promotion
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(errorResponse("ID promosi wajib diisi"), {
        status: 400,
      });
    }

    await prisma.promotion.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      },
    });

    return NextResponse.json(successResponse(null, "Promosi berhasil dihapus"));
  } catch (error) {
    console.error("Failed to delete promotion:", error);
    return NextResponse.json(errorResponse("Gagal menghapus promosi"), {
      status: 500,
    });
  }
}
