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
import { processBookingStatusChange } from "@/lib/booking-flow";

const updateBookingSchema = z.object({
  roomType: z.enum(["QUAD", "TRIPLE", "DOUBLE", "TWIN", "SINGLE"]).optional(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "READY",
      "DEPARTED",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  paymentStatus: z.enum(["UNPAID", "PARTIAL", "PAID", "REFUNDED"]).optional(),
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
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

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            fullName: true,
            passportName: true,
            phone: true,
            email: true,
            passportNumber: true,
            passportExpiry: true,
          },
        },
        package: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            duration: true,
            nights: true,
            inclusions: true,
            exclusions: true,
          },
        },
        schedule: {
          select: {
            id: true,
            departureDate: true,
            returnDate: true,
            status: true,
          },
        },
        payments: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
        },
        agent: {
          select: { id: true, name: true, code: true },
        },
        sales: {
          select: { id: true, name: true, code: true },
        },
        voucher: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!booking) {
      return notFoundResponse("Booking");
    }

    return successResponse(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return errorResponse("Failed to fetch booking", 500);
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
    const validation = updateBookingSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const existing = await prisma.booking.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    });

    if (!existing) {
      return notFoundResponse("Booking");
    }

    const data = validation.data;

    // Handle cancellation
    if (data.status === "CANCELLED" && existing.status !== "CANCELLED") {
      // Return quota to schedule
      await prisma.schedule.update({
        where: { id: existing.scheduleId },
        data: {
          availableQuota: { increment: existing.pax },
        },
      });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(data.roomType && { roomType: data.roomType }),
        ...(data.status && { status: data.status }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status === "CANCELLED" && {
          cancelledAt: new Date(),
          cancelReason: data.cancelReason,
        }),
      },
      include: {
        customer: { select: { fullName: true, phone: true } },
        package: { select: { name: true, type: true } },
      },
    });

    // Process booking flow on status change
    if (data.status && data.status !== existing.status) {
      try {
        await processBookingStatusChange(id, existing.status, data.status);
      } catch (flowError) {
        console.error("Booking flow error:", flowError);
        // Don't fail the update, just log the error
      }
    }

    await prisma.auditLog.create({
      data: {
        tenantId: existing.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "booking",
        entityId: booking.id,
        oldValue: existing,
        newValue: booking,
      },
    });

    return successResponse(booking, "Booking updated successfully");
  } catch (error) {
    console.error("Error updating booking:", error);
    return errorResponse("Failed to update booking", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const existing = await prisma.booking.findFirst({
      where: {
        id,
        isDeleted: false,
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    });

    if (!existing) {
      return notFoundResponse("Booking");
    }

    // Only allow deletion of pending bookings
    if (existing.status !== "PENDING") {
      return errorResponse("Can only delete pending bookings", 400);
    }

    // Return quota
    await prisma.schedule.update({
      where: { id: existing.scheduleId },
      data: { availableQuota: { increment: existing.pax } },
    });

    await softDelete(prisma.booking, id, session.user.id);

    await prisma.auditLog.create({
      data: {
        tenantId: existing.tenantId,
        userId: session.user.id,
        action: "DELETE",
        entity: "booking",
        entityId: id,
        oldValue: existing,
      },
    });

    return successResponse(null, "Booking deleted successfully");
  } catch (error) {
    console.error("Error deleting booking:", error);
    return errorResponse("Failed to delete booking", 500);
  }
}
