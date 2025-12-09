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

const updatePaymentSchema = z.object({
  status: z
    .enum(["PENDING", "PROCESSING", "SUCCESS", "FAILED", "EXPIRED", "REFUNDED"])
    .optional(),
  notes: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id } = await params;

    const payment = await prisma.payment.findFirst({
      where: { id, isDeleted: false },
      include: {
        booking: {
          select: {
            bookingCode: true,
            customer: { select: { fullName: true, phone: true, email: true } },
            package: { select: { name: true } },
            totalPrice: true,
            status: true,
          },
        },
        bank: true,
      },
    });

    if (!payment) return notFoundResponse("Payment");
    return successResponse(payment);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch payment", 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const validation = updatePaymentSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const existing = await prisma.payment.findFirst({
      where: { id, isDeleted: false },
      include: { booking: true },
    });
    if (!existing) return notFoundResponse("Payment");

    const data = validation.data;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.status === "SUCCESS" && {
          verifiedAt: new Date(),
          verifiedBy: session.user.id,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    // Recalculate booking payment status if payment status changed
    if (data.status) {
      const allPayments = await prisma.payment.findMany({
        where: {
          bookingId: existing.bookingId,
          status: "SUCCESS",
          isDeleted: false,
        },
      });
      const totalPaid = allPayments.reduce(
        (sum: number, p: { amount: unknown }) => sum + Number(p.amount),
        0,
      );
      const bookingTotal = Number(existing.booking.totalPrice);

      await prisma.booking.update({
        where: { id: existing.bookingId },
        data: {
          paymentStatus:
            totalPaid >= bookingTotal
              ? "PAID"
              : totalPaid > 0
                ? "PARTIAL"
                : "UNPAID",
        },
      });
    }

    return successResponse(payment, "Payment updated");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to update payment", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { id } = await params;
    const existing = await prisma.payment.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) return notFoundResponse("Payment");

    if (existing.status === "SUCCESS") {
      return errorResponse("Cannot delete verified payment", 400);
    }

    await softDelete(prisma.payment, id, session.user.id);
    return successResponse(null, "Payment deleted");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to delete payment", 500);
  }
}
