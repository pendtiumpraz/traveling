import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const tenantId = session.user.tenantId || "default";

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries for stats
    const [
      totalCustomers,
      customersLastMonth,
      activeBookings,
      bookingsLastMonth,
      totalPackages,
      packagesLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      upcomingSchedules,
      recentBookings,
      pendingPayments,
      bookingsByStatus,
      bookingsByType,
    ] = await Promise.all([
      // Total customers
      prisma.customer.count({
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
        },
      }),
      // Customers last month
      prisma.customer.count({
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      // Active bookings (not cancelled/completed)
      prisma.booking.count({
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
          status: { notIn: ["CANCELLED", "COMPLETED"] },
        },
      }),
      // Bookings last month
      prisma.booking.count({
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      // Total packages
      prisma.package.count({
        where: {
          isDeleted: false,
          isActive: true,
          ...(tenantId !== "default" && { tenantId }),
        },
      }),
      // Packages last month
      prisma.package.count({
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      // Revenue this month (from successful payments)
      prisma.payment.aggregate({
        where: {
          isDeleted: false,
          status: "SUCCESS",
          createdAt: { gte: startOfMonth },
          booking: tenantId !== "default" ? { tenantId } : undefined,
        },
        _sum: { amountInBase: true },
      }),
      // Revenue last month
      prisma.payment.aggregate({
        where: {
          isDeleted: false,
          status: "SUCCESS",
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          booking: tenantId !== "default" ? { tenantId } : undefined,
        },
        _sum: { amountInBase: true },
      }),
      // Upcoming schedules (next 30 days)
      prisma.schedule.findMany({
        where: {
          isDeleted: false,
          departureDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
          status: { in: ["OPEN", "ALMOST_FULL"] },
          package: tenantId !== "default" ? { tenantId } : undefined,
        },
        include: {
          package: { select: { name: true, type: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { departureDate: "asc" },
        take: 5,
      }),
      // Recent bookings
      prisma.booking.findMany({
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
        },
        include: {
          customer: { select: { fullName: true, phone: true } },
          package: { select: { name: true, type: true } },
          schedule: { select: { departureDate: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Pending payments
      prisma.booking.count({
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
          paymentStatus: { in: ["UNPAID", "PARTIAL"] },
          status: { notIn: ["CANCELLED"] },
        },
      }),
      // Bookings by status
      prisma.booking.groupBy({
        by: ["status"],
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
        },
        _count: true,
      }),
      // Bookings by business type
      prisma.booking.groupBy({
        by: ["businessType"],
        where: {
          isDeleted: false,
          ...(tenantId !== "default" && { tenantId }),
        },
        _count: true,
      }),
    ]);

    // Calculate percentage changes
    const customerChange =
      customersLastMonth > 0
        ? (
            ((totalCustomers - customersLastMonth) / customersLastMonth) *
            100
          ).toFixed(1)
        : "0";
    const bookingChange =
      bookingsLastMonth > 0
        ? (
            ((activeBookings - bookingsLastMonth) / bookingsLastMonth) *
            100
          ).toFixed(1)
        : "0";
    const revenueThisMonthVal = Number(revenueThisMonth._sum.amountInBase || 0);
    const revenueLastMonthVal = Number(revenueLastMonth._sum.amountInBase || 0);
    const revenueChange =
      revenueLastMonthVal > 0
        ? (
            ((revenueThisMonthVal - revenueLastMonthVal) /
              revenueLastMonthVal) *
            100
          ).toFixed(1)
        : "0";

    const stats = {
      summary: {
        totalCustomers: {
          value: totalCustomers,
          change: customerChange,
          trend: Number(customerChange) >= 0 ? "up" : "down",
        },
        activeBookings: {
          value: activeBookings,
          change: bookingChange,
          trend: Number(bookingChange) >= 0 ? "up" : "down",
        },
        totalPackages: {
          value: totalPackages,
          change:
            packagesLastMonth > 0
              ? (
                  ((totalPackages - packagesLastMonth) / packagesLastMonth) *
                  100
                ).toFixed(1)
              : "0",
          trend: "up",
        },
        revenue: {
          value: revenueThisMonthVal,
          change: revenueChange,
          trend: Number(revenueChange) >= 0 ? "up" : "down",
        },
        pendingPayments: {
          value: pendingPayments,
        },
      },
      upcomingDepartures: upcomingSchedules.map((s) => ({
        id: s.id,
        name:
          typeof s.package.name === "string"
            ? s.package.name
            : (s.package.name as Record<string, string>).id || "Package",
        type: s.package.type,
        date: s.departureDate,
        pax: s._count.bookings,
        quota: s.quota,
        availableQuota: s.availableQuota,
      })),
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        code: b.bookingCode,
        customer: b.customer.fullName,
        package:
          typeof b.package.name === "string"
            ? b.package.name
            : (b.package.name as Record<string, string>).id || "Package",
        type: b.package.type,
        departureDate: b.schedule.departureDate,
        status: b.status,
        paymentStatus: b.paymentStatus,
        totalPrice: Number(b.totalPrice),
        createdAt: b.createdAt,
      })),
      bookingsByStatus: bookingsByStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      bookingsByType: bookingsByType.reduce(
        (acc, item) => {
          acc[item.businessType] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    return successResponse(stats, "Dashboard stats fetched successfully");
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return errorResponse("Failed to fetch dashboard stats", 500);
  }
}
