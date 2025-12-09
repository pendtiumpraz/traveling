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

const createPaymentSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().min(1),
  method: z.enum([
    "BANK_TRANSFER",
    "VIRTUAL_ACCOUNT",
    "CREDIT_CARD",
    "QRIS",
    "E_WALLET",
    "PAYPAL",
    "CASH",
  ]),
  bankId: z.string().optional(),
  transferDate: z.string().optional(),
  proofUrl: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const bookingId = searchParams.get("bookingId") || "";
    const status = searchParams.get("status") || "";

    const where = {
      isDeleted: false,
      ...(bookingId && { bookingId }),
      ...(status && {
        status: status as
          | "PENDING"
          | "PROCESSING"
          | "SUCCESS"
          | "FAILED"
          | "EXPIRED"
          | "REFUNDED",
      }),
      booking: {
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            select: {
              bookingCode: true,
              customer: { select: { fullName: true, phone: true } },
              totalPrice: true,
            },
          },
          bank: { select: { name: true, accountNo: true } },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return paginatedResponse(payments, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch payments", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;

    const booking = await prisma.booking.findFirst({
      where: { id: data.bookingId, isDeleted: false },
      include: { payments: { where: { status: "SUCCESS", isDeleted: false } } },
    });

    if (!booking) return errorResponse("Booking not found", 404);

    const totalPaid = booking.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const remaining = Number(booking.totalPrice) - totalPaid;

    if (data.amount > remaining) {
      return errorResponse(
        `Amount exceeds remaining balance (${remaining})`,
        400,
      );
    }

    const payment = await prisma.payment.create({
      data: {
        paymentCode: generateCode("PAY", 8),
        bookingId: data.bookingId,
        amount: data.amount,
        amountInBase: data.amount,
        currency: "IDR",
        exchangeRate: 1,
        method: data.method,
        status: data.method === "CASH" ? "SUCCESS" : "PENDING",
        bankId: data.bankId,
        transferDate: data.transferDate ? new Date(data.transferDate) : null,
        proofUrl: data.proofUrl,
        notes: data.notes,
      },
    });

    // Update booking payment status
    const newTotalPaid = totalPaid + data.amount;
    const bookingTotal = Number(booking.totalPrice);

    await prisma.booking.update({
      where: { id: data.bookingId },
      data: {
        paymentStatus:
          newTotalPaid >= bookingTotal
            ? "PAID"
            : newTotalPaid > 0
              ? "PARTIAL"
              : "UNPAID",
      },
    });

    return successResponse(payment, "Payment created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create payment", 500);
  }
}
