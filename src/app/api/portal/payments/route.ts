import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Get customer by userId
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, isDeleted: false },
    });

    if (!customer) {
      return successResponse([], "No payments found");
    }

    // Get bookings for this customer
    const bookings = await prisma.booking.findMany({
      where: { customerId: customer.id, isDeleted: false },
      select: { id: true },
    });

    const bookingIds = bookings.map((b) => b.id);

    // Get payments for these bookings
    const payments = await prisma.payment.findMany({
      where: {
        bookingId: { in: bookingIds },
        isDeleted: false,
      },
      include: {
        booking: {
          select: {
            bookingCode: true,
            schedule: {
              select: {
                package: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform for frontend
    const transformed = payments.map((p) => ({
      id: p.id,
      booking: {
        code: p.booking.bookingCode,
        schedule: p.booking.schedule,
      },
      amount: Number(p.amount),
      paymentMethod: p.method,
      status: p.status,
      proofUrl: p.proofUrl,
      verifiedAt: p.verifiedAt,
      createdAt: p.createdAt,
    }));

    return successResponse(transformed);
  } catch (error) {
    console.error("Portal payments error:", error);
    return errorResponse("Failed to fetch payments", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { bookingId, amount, paymentMethod, proofUrl } = body;

    if (!bookingId || !amount) {
      return errorResponse("bookingId and amount required", 400);
    }

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, isDeleted: false },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // Verify booking belongs to customer
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: customer.id,
        isDeleted: false,
      },
    });

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        paymentCode: `PAY-${Date.now()}`,
        bookingId,
        amount,
        amountInBase: amount,
        method: paymentMethod || "BANK_TRANSFER",
        status: "PENDING",
        proofUrl,
      },
    });

    return successResponse(payment, "Payment submitted for verification");
  } catch (error) {
    console.error("Create payment error:", error);
    return errorResponse("Failed to submit payment", 500);
  }
}
