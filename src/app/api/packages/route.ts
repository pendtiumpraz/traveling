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

const createPackageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum([
    "UMROH",
    "HAJI",
    "OUTBOUND",
    "INBOUND",
    "DOMESTIC",
    "MICE",
    "CRUISE",
    "CUSTOM",
  ]),
  description: z.string().optional(),
  destinations: z.array(z.string()).min(1, "At least one destination required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  nights: z.number().min(0),
  priceQuad: z.number().min(0),
  priceTriple: z.number().min(0),
  priceDouble: z.number().min(0),
  priceSingle: z.number().optional(),
  childPrice: z.number().optional(),
  infantPrice: z.number().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  minPax: z.number().default(1),
  maxPax: z.number().optional(),
  thumbnail: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where = {
      isDeleted: false,
      ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      ...(search && {
        OR: [{ code: { contains: search, mode: "insensitive" as const } }],
      }),
      ...(type && {
        type: type as
          | "UMROH"
          | "HAJI"
          | "OUTBOUND"
          | "INBOUND"
          | "DOMESTIC"
          | "MICE"
          | "CRUISE"
          | "CUSTOM",
      }),
      ...(isActive !== null &&
        isActive !== "" && { isActive: isActive === "true" }),
    };

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { schedules: true, bookings: true },
          },
        },
      }),
      prisma.package.count({ where }),
    ]);

    return paginatedResponse(packages, page, pageSize, total);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return errorResponse("Failed to fetch packages", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = createPackageSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const data = validation.data;
    const tenantId = session.user.tenantId || "default";

    const pkg = await prisma.package.create({
      data: {
        tenantId,
        code: generateCode("PKG", 6),
        type: data.type,
        name: { en: data.name, id: data.name },
        description: data.description
          ? { en: data.description, id: data.description }
          : undefined,
        destinations: data.destinations,
        duration: data.duration,
        nights: data.nights,
        priceQuad: data.priceQuad,
        priceTriple: data.priceTriple,
        priceDouble: data.priceDouble,
        priceSingle: data.priceSingle,
        childPrice: data.childPrice,
        infantPrice: data.infantPrice,
        inclusions: data.inclusions
          ? { en: data.inclusions, id: data.inclusions }
          : undefined,
        exclusions: data.exclusions
          ? { en: data.exclusions, id: data.exclusions }
          : undefined,
        minPax: data.minPax,
        maxPax: data.maxPax,
        thumbnail: data.thumbnail,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "package",
        entityId: pkg.id,
        newValue: pkg,
      },
    });

    return successResponse(pkg, "Package created successfully");
  } catch (error) {
    console.error("Error creating package:", error);
    return errorResponse("Failed to create package", 500);
  }
}
