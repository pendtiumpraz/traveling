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

const createInvoiceSchema = z.object({
  bookingId: z.string().min(1),
  dueDate: z.string(),
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

    const where = {
      isDeleted: false,
      ...(bookingId && { bookingId }),
      booking: {
        ...(session.user.tenantId && { tenantId: session.user.tenantId }),
      },
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            select: {
              bookingCode: true,
              customer: { select: { fullName: true } },
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return paginatedResponse(invoices, page, pageSize, total);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to fetch invoices", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const validation = createInvoiceSchema.safeParse(body);
    if (!validation.success)
      return errorResponse(validation.error.issues[0].message, 422);

    const data = validation.data;

    const booking = await prisma.booking.findFirst({
      where: { id: data.bookingId, isDeleted: false },
      include: {
        customer: { select: { fullName: true } },
        package: { select: { name: true } },
        payments: { where: { status: "SUCCESS", isDeleted: false } },
      },
    });

    if (!booking) return errorResponse("Booking not found", 404);

    const totalPaid = booking.payments.reduce(
      (sum: number, p: { amount: unknown }) => sum + Number(p.amount),
      0,
    );
    const balance = Number(booking.totalPrice) - totalPaid;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: generateCode("INV", 8),
        bookingId: data.bookingId,
        subtotal: booking.basePrice,
        discount: booking.discount,
        tax: 0,
        total: booking.totalPrice,
        currency: booking.currency,
        paidAmount: totalPaid,
        balance,
        dueDate: new Date(data.dueDate),
        items: [
          {
            description: `${(booking.package.name as { id?: string })?.id || "Package"} - ${booking.roomType}`,
            quantity: booking.pax,
            price: Number(booking.basePrice) / booking.pax,
            total: Number(booking.basePrice),
          },
        ],
        notes: data.notes,
      },
    });

    return successResponse(invoice, "Invoice created");
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("Failed to create invoice", 500);
  }
}
