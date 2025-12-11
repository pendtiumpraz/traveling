import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateCode } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get("paymentStatus");

    // Get customer by userId
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, isDeleted: false },
    });

    if (!customer) {
      return successResponse([], "No bookings found");
    }

    const where: Record<string, unknown> = {
      customerId: customer.id,
      isDeleted: false,
    };

    if (paymentStatus) {
      where.paymentStatus = { in: paymentStatus.split(",") };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        schedule: {
          include: {
            package: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform for frontend
    const transformed = bookings.map((b) => ({
      id: b.id,
      code: b.bookingCode,
      schedule: b.schedule,
      roomType: b.roomType,
      paxAdult: b.pax,
      paxChild: 0,
      totalPrice: Number(b.totalPrice),
      bookingStatus: b.status,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
    }));

    return successResponse(transformed);
  } catch (error) {
    console.error("Portal bookings error:", error);
    return errorResponse("Failed to fetch bookings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { scheduleId, roomType, pax, specialRequests } = body;

    if (!scheduleId || !roomType) {
      return errorResponse("scheduleId and roomType required", 400);
    }

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, isDeleted: false },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // Get schedule with package
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { package: true },
    });

    if (!schedule) {
      return errorResponse("Schedule not found", 404);
    }

    if (schedule.status !== "OPEN") {
      return errorResponse("Schedule is not available", 400);
    }

    // Get base price from package (use priceQuad as default)
    const basePrice = Number(schedule.package.priceQuad);
    const totalPax = pax || 1;
    const totalPrice = basePrice * totalPax;

    // Check quota
    if (schedule.availableQuota < totalPax) {
      return errorResponse("Not enough quota available", 400);
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        tenantId: customer.tenantId,
        bookingCode: generateCode("BK"),
        customerId: customer.id,
        packageId: schedule.packageId,
        scheduleId: schedule.id,
        businessType: schedule.package.type,
        roomType,
        pax: totalPax,
        basePrice,
        totalPrice,
        status: "PENDING",
        paymentStatus: "UNPAID",
        notes: specialRequests,
        source: "PORTAL",
      },
      include: {
        schedule: {
          include: {
            package: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Update schedule quota
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: { availableQuota: { decrement: totalPax } },
    });

    // Update customer type to CLIENT if still PROSPECT
    if (customer.customerType === "PROSPECT") {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { customerType: "CLIENT" },
      });
    }

    return successResponse(booking, "Booking created successfully");
  } catch (error) {
    console.error("Create booking error:", error);
    return errorResponse("Failed to create booking", 500);
  }
}
