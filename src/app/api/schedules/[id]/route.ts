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

const updateScheduleSchema = z.object({
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  quota: z.number().min(1).optional(),
  status: z
    .enum(["OPEN", "ALMOST_FULL", "FULL", "CLOSED", "DEPARTED", "COMPLETED"])
    .optional(),
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

    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        isDeleted: false,
      },
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
            tenantId: true,
          },
        },
        bookings: {
          where: { isDeleted: false },
          select: {
            id: true,
            bookingCode: true,
            customer: {
              select: { fullName: true, phone: true },
            },
            roomType: true,
            pax: true,
            status: true,
            paymentStatus: true,
          },
          orderBy: { createdAt: "desc" },
        },
        manifests: {
          where: { isDeleted: false },
          select: {
            id: true,
            code: true,
            status: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!schedule) {
      return notFoundResponse("Schedule");
    }

    // Check tenant access
    if (
      session.user.tenantId &&
      schedule.package.tenantId !== session.user.tenantId
    ) {
      return notFoundResponse("Schedule");
    }

    return successResponse(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return errorResponse("Failed to fetch schedule", 500);
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
    const validation = updateScheduleSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const existing = await prisma.schedule.findFirst({
      where: { id, isDeleted: false },
      include: { package: { select: { tenantId: true } } },
    });

    if (!existing) {
      return notFoundResponse("Schedule");
    }

    if (
      session.user.tenantId &&
      existing.package.tenantId !== session.user.tenantId
    ) {
      return notFoundResponse("Schedule");
    }

    const data = validation.data;

    // Calculate new available quota if quota changed
    let availableQuota = existing.availableQuota;
    if (data.quota && data.quota !== existing.quota) {
      const diff = data.quota - existing.quota;
      availableQuota = existing.availableQuota + diff;
      if (availableQuota < 0) availableQuota = 0;
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        ...(data.departureDate && {
          departureDate: new Date(data.departureDate),
        }),
        ...(data.returnDate && { returnDate: new Date(data.returnDate) }),
        ...(data.quota && { quota: data.quota, availableQuota }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.priceOverride && { priceOverride: data.priceOverride }),
      },
      include: {
        package: { select: { code: true, name: true, type: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: existing.package.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "schedule",
        entityId: schedule.id,
        oldValue: existing,
        newValue: schedule,
      },
    });

    return successResponse(schedule, "Schedule updated successfully");
  } catch (error) {
    console.error("Error updating schedule:", error);
    return errorResponse("Failed to update schedule", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const existing = await prisma.schedule.findFirst({
      where: { id, isDeleted: false },
      include: {
        package: { select: { tenantId: true } },
        _count: { select: { bookings: true } },
      },
    });

    if (!existing) {
      return notFoundResponse("Schedule");
    }

    if (
      session.user.tenantId &&
      existing.package.tenantId !== session.user.tenantId
    ) {
      return notFoundResponse("Schedule");
    }

    // Check if has bookings
    if (existing._count.bookings > 0) {
      return errorResponse(
        "Cannot delete schedule with existing bookings",
        400,
      );
    }

    await softDelete(prisma.schedule, id, session.user.id);

    await prisma.auditLog.create({
      data: {
        tenantId: existing.package.tenantId,
        userId: session.user.id,
        action: "DELETE",
        entity: "schedule",
        entityId: id,
        oldValue: existing,
      },
    });

    return successResponse(null, "Schedule deleted successfully");
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return errorResponse("Failed to delete schedule", 500);
  }
}
