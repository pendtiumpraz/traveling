import { NextRequest } from "next/server";
import { prisma, softDelete } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { z } from "zod";

const updatePackageSchema = z.object({
  name: z.string().min(2).optional(),
  type: z
    .enum([
      "UMROH",
      "HAJI",
      "OUTBOUND",
      "INBOUND",
      "DOMESTIC",
      "MICE",
      "CRUISE",
      "CUSTOM",
    ])
    .optional(),
  description: z.string().optional(),
  destinations: z.array(z.string()).optional(),
  duration: z.number().min(1).optional(),
  nights: z.number().min(0).optional(),
  priceQuad: z.number().min(0).optional(),
  priceTriple: z.number().min(0).optional(),
  priceDouble: z.number().min(0).optional(),
  priceSingle: z.number().optional(),
  childPrice: z.number().optional(),
  infantPrice: z.number().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  minPax: z.number().optional(),
  maxPax: z.number().optional(),
  thumbnail: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const pkg = await prisma.package.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
      include: {
        hotels: {
          include: {
            hotel: true,
          },
        },
        itinerary: {
          orderBy: { day: "asc" },
        },
        schedules: {
          where: { isDeleted: false },
          orderBy: { departureDate: "asc" },
          take: 10,
        },
        _count: {
          select: { bookings: true, schedules: true },
        },
      },
    });

    if (!pkg) {
      return notFoundResponse("Package");
    }

    return successResponse(pkg);
  } catch (error) {
    console.error("Error fetching package:", error);
    return errorResponse("Failed to fetch package", 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updatePackageSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const existing = await prisma.package.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    });

    if (!existing) {
      return notFoundResponse("Package");
    }

    const data = validation.data;

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        ...(data.name && { name: { en: data.name, id: data.name } }),
        ...(data.description && {
          description: { en: data.description, id: data.description },
        }),
        ...(data.type && { type: data.type }),
        ...(data.destinations && { destinations: data.destinations }),
        ...(data.duration && { duration: data.duration }),
        ...(data.nights !== undefined && { nights: data.nights }),
        ...(data.priceQuad && { priceQuad: data.priceQuad }),
        ...(data.priceTriple && { priceTriple: data.priceTriple }),
        ...(data.priceDouble && { priceDouble: data.priceDouble }),
        ...(data.priceSingle !== undefined && {
          priceSingle: data.priceSingle,
        }),
        ...(data.childPrice !== undefined && { childPrice: data.childPrice }),
        ...(data.infantPrice !== undefined && {
          infantPrice: data.infantPrice,
        }),
        ...(data.inclusions && {
          inclusions: { en: data.inclusions, id: data.inclusions },
        }),
        ...(data.exclusions && {
          exclusions: { en: data.exclusions, id: data.exclusions },
        }),
        ...(data.minPax && { minPax: data.minPax }),
        ...(data.maxPax !== undefined && { maxPax: data.maxPax }),
        ...(data.thumbnail && { thumbnail: data.thumbnail }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: existing.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "package",
        entityId: pkg.id,
        oldValue: existing,
        newValue: pkg,
      },
    });

    return successResponse(pkg, "Package updated successfully");
  } catch (error) {
    console.error("Error updating package:", error);
    return errorResponse("Failed to update package", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const existing = await prisma.package.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    });

    if (!existing) {
      return notFoundResponse("Package");
    }

    await softDelete(prisma.package, id, session.user.id);

    await prisma.auditLog.create({
      data: {
        tenantId: existing.tenantId,
        userId: session.user.id,
        action: "DELETE",
        entity: "package",
        entityId: id,
        oldValue: existing,
      },
    });

    return successResponse(null, "Package deleted successfully");
  } catch (error) {
    console.error("Error deleting package:", error);
    return errorResponse("Failed to delete package", 500);
  }
}
