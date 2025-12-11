import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Customer booking history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Get customer with all related bookings
    const customer = await prisma.customer.findUnique({
      where: { id, isDeleted: false },
      include: {
        bookings: {
          where: { isDeleted: false },
          include: {
            schedule: {
              include: {
                package: true,
              },
            },
            payments: {
              where: { isDeleted: false },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 },
      );
    }

    // Calculate statistics
    const totalBookings = customer.bookings.length;
    const completedBookings = customer.bookings.filter(
      (b) => b.status === "COMPLETED",
    ).length;
    const totalSpent = customer.bookings
      .filter((b) => b.paymentStatus === "PAID")
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);
    const totalPayments = customer.bookings.reduce(
      (sum, b) =>
        sum +
        b.payments.reduce(
          (s, p) => s + (p.status === "SUCCESS" ? Number(p.amount) : 0),
          0,
        ),
      0,
    );

    // Get loyalty points (calculate from completed bookings)
    const loyaltyPoints = completedBookings * 100;

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          customerType: customer.customerType,
        },
        statistics: {
          totalBookings,
          completedBookings,
          cancelledBookings: customer.bookings.filter(
            (b) => b.status === "CANCELLED",
          ).length,
          totalSpent,
          totalPayments,
          outstandingBalance: totalSpent - totalPayments,
          loyaltyPoints,
          memberSince: customer.createdAt,
        },
        bookings: customer.bookings.map((booking) => ({
          id: booking.id,
          bookingCode: booking.bookingCode,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          totalPrice: booking.totalPrice,
          roomType: booking.roomType,
          pax: booking.pax,
          createdAt: booking.createdAt,
          schedule: booking.schedule
            ? {
                departureDate: booking.schedule.departureDate,
                returnDate: booking.schedule.returnDate,
                package: {
                  name: booking.schedule.package.name,
                  type: booking.schedule.package.type,
                },
              }
            : null,
          payments: booking.payments.map((p) => ({
            id: p.id,
            amount: p.amount,
            method: p.method,
            status: p.status,
            createdAt: p.createdAt,
          })),
        })),
      },
    });
  } catch (error) {
    console.error("Get customer history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer history" },
      { status: 500 },
    );
  }
}
