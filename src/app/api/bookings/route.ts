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

const createBookingSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  packageId: z.string().min(1, "Package is required"),
  scheduleId: z.string().min(1, "Schedule is required"),
  roomType: z.enum(["QUAD", "TRIPLE", "DOUBLE", "TWIN", "SINGLE"]),
  pax: z.number().min(1).default(1),
  addOns: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
      }),
    )
    .optional(),
  notes: z.string().optional(),
  agentId: z.string().optional(),
  salesId: z.string().optional(),
  voucherId: z.string().optional(),
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
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const roomType = searchParams.get("roomType") || "";
    const scheduleId = searchParams.get("scheduleId") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where = {
      isDeleted: false,
      ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      ...(search && {
        OR: [
          { bookingCode: { contains: search, mode: "insensitive" as const } },
          {
            customer: {
              fullName: { contains: search, mode: "insensitive" as const },
            },
          },
          { customer: { phone: { contains: search } } },
        ],
      }),
      ...(status && {
        status: status as
          | "PENDING"
          | "CONFIRMED"
          | "PROCESSING"
          | "READY"
          | "DEPARTED"
          | "COMPLETED"
          | "CANCELLED",
      }),
      ...(paymentStatus && {
        paymentStatus: paymentStatus as
          | "UNPAID"
          | "PARTIAL"
          | "PAID"
          | "REFUNDED",
      }),
      ...(roomType && {
        roomType: roomType as "QUAD" | "TRIPLE" | "DOUBLE" | "TWIN" | "SINGLE",
      }),
      ...(scheduleId && { scheduleId }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              code: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },
          package: {
            select: { id: true, code: true, name: true, type: true },
          },
          schedule: {
            select: { id: true, departureDate: true, returnDate: true },
          },
          _count: {
            select: { payments: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(bookings, page, pageSize, total);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return errorResponse("Failed to fetch bookings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 422);
    }

    const data = validation.data;
    const tenantId = session.user.tenantId || "default";

    // Get schedule with package pricing
    const schedule = await prisma.schedule.findFirst({
      where: { id: data.scheduleId, isDeleted: false },
      include: {
        package: {
          select: {
            id: true,
            type: true,
            priceQuad: true,
            priceTriple: true,
            priceDouble: true,
            priceSingle: true,
            tenantId: true,
          },
        },
      },
    });

    if (!schedule) {
      return errorResponse("Schedule not found", 404);
    }

    if (schedule.availableQuota < data.pax) {
      return errorResponse("Not enough quota available", 400);
    }

    // Calculate price
    const priceOverride = schedule.priceOverride as Record<
      string,
      number
    > | null;
    let basePrice = 0;

    switch (data.roomType) {
      case "QUAD":
        basePrice = Number(
          priceOverride?.priceQuad || schedule.package.priceQuad,
        );
        break;
      case "TRIPLE":
        basePrice = Number(
          priceOverride?.priceTriple || schedule.package.priceTriple,
        );
        break;
      case "DOUBLE":
      case "TWIN":
        basePrice = Number(
          priceOverride?.priceDouble || schedule.package.priceDouble,
        );
        break;
      case "SINGLE":
        basePrice = Number(
          priceOverride?.priceSingle ||
            schedule.package.priceSingle ||
            schedule.package.priceDouble,
        );
        break;
    }

    const totalBasePrice = basePrice * data.pax;

    // Calculate add-ons
    let addOnsTotal = 0;
    if (data.addOns) {
      addOnsTotal = data.addOns.reduce(
        (sum, addon) => sum + addon.price * addon.quantity,
        0,
      );
    }

    // Apply voucher discount (simplified)
    let discount = 0;
    if (data.voucherId) {
      const voucher = await prisma.voucher.findFirst({
        where: { id: data.voucherId, isActive: true, isDeleted: false },
      });
      if (voucher && voucher.used < (voucher.quota || Infinity)) {
        if (voucher.type === "PERCENTAGE") {
          discount = totalBasePrice * (Number(voucher.value) / 100);
          if (voucher.maxDiscount) {
            discount = Math.min(discount, Number(voucher.maxDiscount));
          }
        } else {
          discount = Number(voucher.value);
        }
      }
    }

    const totalPrice = totalBasePrice + addOnsTotal - discount;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        tenantId,
        bookingCode: generateCode("BK", 8),
        customerId: data.customerId,
        packageId: data.packageId,
        scheduleId: data.scheduleId,
        businessType: schedule.package.type,
        roomType: data.roomType,
        pax: data.pax,
        basePrice: totalBasePrice,
        discount,
        additionalFees: addOnsTotal,
        totalPrice,
        currency: "IDR",
        status: "PENDING",
        paymentStatus: "UNPAID",
        addOns: data.addOns,
        notes: data.notes,
        agentId: data.agentId,
        salesId: data.salesId,
        voucherId: data.voucherId,
        source: "online",
      },
      include: {
        customer: { select: { fullName: true, phone: true } },
        package: { select: { name: true, type: true } },
        schedule: { select: { departureDate: true, returnDate: true } },
      },
    });

    // Update schedule quota
    await prisma.schedule.update({
      where: { id: data.scheduleId },
      data: {
        availableQuota: { decrement: data.pax },
        status:
          schedule.availableQuota - data.pax <= 5
            ? "ALMOST_FULL"
            : schedule.availableQuota - data.pax <= 0
              ? "FULL"
              : "OPEN",
      },
    });

    // Update customer type to CLIENT
    await prisma.customer.update({
      where: { id: data.customerId },
      data: { customerType: "CLIENT" },
    });

    // Update voucher usage
    if (data.voucherId && discount > 0) {
      await prisma.voucher.update({
        where: { id: data.voucherId },
        data: { used: { increment: 1 } },
      });
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "booking",
        entityId: booking.id,
        newValue: booking,
      },
    });

    return successResponse(booking, "Booking created successfully");
  } catch (error) {
    console.error("Error creating booking:", error);
    return errorResponse("Failed to create booking", 500);
  }
}
