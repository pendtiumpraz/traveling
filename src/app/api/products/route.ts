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
import { generateCode } from "@/lib/utils";

const createProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().min(1),
  buyPrice: z.number().min(0),
  sellPrice: z.number().optional(),
  minStock: z.number().default(0),
  image: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where = {
      isDeleted: false,
      ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(category && { category }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
        include: {
          stocks: {
            select: { quantity: true, warehouse: { select: { name: true } } },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return paginatedResponse(products, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch products", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createProductSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;
    const tenantId = session.user.tenantId || "default";

    const product = await prisma.product.create({
      data: {
        tenantId,
        code: generateCode("PRD", 6),
        name: data.name,
        category: data.category,
        description: data.description,
        unit: data.unit,
        buyPrice: data.buyPrice,
        sellPrice: data.sellPrice,
        minStock: data.minStock,
        image: data.image,
        isActive: true,
      },
    });

    return successResponse(product, "Product created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create product", 500);
  }
}
