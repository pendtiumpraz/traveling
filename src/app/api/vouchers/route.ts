import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { z } from "zod";

const createVoucherSchema = z.object({
  code: z.string().min(3).max(20),
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number().min(0),
  minPurchase: z.number().optional(),
  maxDiscount: z.number().optional(),
  quota: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const isActive = searchParams.get("isActive");

    const where = {
      isDeleted: false,
      ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      ...(isActive !== null &&
        isActive !== "" && { isActive: isActive === "true" }),
    };

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { bookings: true } },
        },
      }),
      prisma.voucher.count({ where }),
    ]);

    return paginatedResponse(vouchers, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch vouchers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createVoucherSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;
    const tenantId = session.user.tenantId || "default";

    // Check duplicate code
    const existing = await prisma.voucher.findFirst({
      where: { tenantId, code: data.code, isDeleted: false },
    });
    if (existing) return errorResponse("Voucher code already exists", 409);

    const voucher = await prisma.voucher.create({
      data: {
        tenantId,
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount,
        quota: data.quota,
        used: 0,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: true,
      },
    });

    return successResponse(voucher, "Voucher created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create voucher", 500);
  }
}
