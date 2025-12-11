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

const createScheduleSchema = z.object({
  packageId: z.string().min(1, "Package is required"),
  departureDate: z.string(),
  returnDate: z.string(),
  quota: z.number().min(1, "Quota must be at least 1"),
  notes: z.string().optional(),
  priceOverride: z
    .object({
      priceQuad: z.number().optional(),
      priceTriple: z.number().optional(),
      priceDouble: z.number().optional(),
      priceSingle: z.number().optional(),
    })
    .optional(),
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
    const packageId = searchParams.get("packageId") || "";
    const status = searchParams.get("status") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const sortBy = searchParams.get("sortBy") || "departureDate";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const where = {
      isDeleted: false,
      package: {
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
        isDeleted: false,
      },
      ...(packageId && { packageId }),
      ...(status && {
        status: status as
          | "OPEN"
          | "ALMOST_FULL"
          | "FULL"
          | "CLOSED"
          | "DEPARTED"
          | "COMPLETED",
      }),
      ...(fromDate && { departureDate: { gte: new Date(fromDate) } }),
      ...(toDate && { departureDate: { lte: new Date(toDate) } }),
    };

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          package: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              duration: true,
              nights: true,
              priceQuad: true,
              priceTriple: true,
              priceDouble: true,
              priceSingle: true,
              destinations: true,
              inclusions: true,
              itinerary: {
                orderBy: { day: "asc" },
              },
            },
          },
          _count: {
            select: { bookings: true, manifests: true },
          },
        },
      }),
      prisma.schedule.count({ where }),
    ]);

    return paginatedResponse(schedules, page, pageSize, total);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return errorResponse("Failed to fetch schedules", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = createScheduleSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const data = validation.data;

    // Verify package exists
    const pkg = await prisma.package.findFirst({
      where: {
        id: data.packageId,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    });

    if (!pkg) {
      return errorResponse("Package not found", 404);
    }

    const schedule = await prisma.schedule.create({
      data: {
        packageId: data.packageId,
        departureDate: new Date(data.departureDate),
        returnDate: new Date(data.returnDate),
        quota: data.quota,
        availableQuota: data.quota,
        status: "OPEN",
        notes: data.notes,
        priceOverride: data.priceOverride,
      },
      include: {
        package: {
          select: { code: true, name: true, type: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: pkg.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "schedule",
        entityId: schedule.id,
        newValue: schedule,
      },
    });

    return successResponse(schedule, "Schedule created successfully");
  } catch (error) {
    console.error("Error creating schedule:", error);
    return errorResponse("Failed to create schedule", 500);
  }
}
