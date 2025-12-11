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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "year"; // year, quarter, month
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
    );

    const tenantId = session.user.tenantId || "default";
    const tenantFilter = tenantId !== "default" ? { tenantId } : {};

    // Get monthly data for the year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    // Get all bookings for the year
    const bookings = await prisma.booking.findMany({
      where: {
        isDeleted: false,
        ...tenantFilter,
        createdAt: { gte: startOfYear, lte: endOfYear },
      },
      select: {
        id: true,
        totalPrice: true,
        status: true,
        paymentStatus: true,
        businessType: true,
        createdAt: true,
      },
    });

    // Get all payments for the year
    const payments = await prisma.payment.findMany({
      where: {
        isDeleted: false,
        status: "SUCCESS",
        createdAt: { gte: startOfYear, lte: endOfYear },
        booking: tenantFilter,
      },
      select: {
        amountInBase: true,
        createdAt: true,
      },
    });

    // Get all customers created this year
    const customers = await prisma.customer.findMany({
      where: {
        isDeleted: false,
        ...tenantFilter,
        createdAt: { gte: startOfYear, lte: endOfYear },
      },
      select: {
        id: true,
        source: true,
        createdAt: true,
      },
    });

    // Aggregate monthly data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = months.map((month, index) => {
      const monthStart = new Date(year, index, 1);
      const monthEnd = new Date(year, index + 1, 0, 23, 59, 59);

      const monthBookings = bookings.filter(
        (b) => b.createdAt >= monthStart && b.createdAt <= monthEnd,
      );
      const monthPayments = payments.filter(
        (p) => p.createdAt >= monthStart && p.createdAt <= monthEnd,
      );
      const monthCustomers = customers.filter(
        (c) => c.createdAt >= monthStart && c.createdAt <= monthEnd,
      );

      return {
        month,
        revenue: monthPayments.reduce(
          (sum, p) => sum + Number(p.amountInBase),
          0,
        ),
        bookings: monthBookings.length,
        customers: monthCustomers.length,
      };
    });

    // Aggregate by business type
    const businessTypeStats = bookings.reduce(
      (acc, b) => {
        if (!acc[b.businessType]) {
          acc[b.businessType] = { count: 0, revenue: 0 };
        }
        acc[b.businessType].count++;
        acc[b.businessType].revenue += Number(b.totalPrice);
        return acc;
      },
      {} as Record<string, { count: number; revenue: number }>,
    );

    const packageTypes = Object.entries(businessTypeStats).map(
      ([name, data]) => ({
        name,
        value: data.count,
        revenue: data.revenue,
      }),
    );

    // Aggregate by customer source
    const sourceStats = customers.reduce(
      (acc, c) => {
        const source = c.source || "OTHER";
        if (!acc[source]) acc[source] = 0;
        acc[source]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    const customerSources = Object.entries(sourceStats).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    // Booking status distribution
    const statusStats = bookings.reduce(
      (acc, b) => {
        if (!acc[b.status]) acc[b.status] = 0;
        acc[b.status]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    const bookingStatus = Object.entries(statusStats).map(([name, value]) => ({
      name,
      value,
    }));

    // Calculate totals and changes
    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.amountInBase),
      0,
    );
    const totalBookings = bookings.length;
    const totalCustomers = customers.length;

    // Get last year data for comparison
    const lastYearStart = new Date(year - 1, 0, 1);
    const lastYearEnd = new Date(year - 1, 11, 31, 23, 59, 59);

    const [lastYearPayments, lastYearBookings, lastYearCustomers] =
      await Promise.all([
        prisma.payment.aggregate({
          where: {
            isDeleted: false,
            status: "SUCCESS",
            createdAt: { gte: lastYearStart, lte: lastYearEnd },
            booking: tenantFilter,
          },
          _sum: { amountInBase: true },
        }),
        prisma.booking.count({
          where: {
            isDeleted: false,
            ...tenantFilter,
            createdAt: { gte: lastYearStart, lte: lastYearEnd },
          },
        }),
        prisma.customer.count({
          where: {
            isDeleted: false,
            ...tenantFilter,
            createdAt: { gte: lastYearStart, lte: lastYearEnd },
          },
        }),
      ]);

    const lastYearRevenue = Number(lastYearPayments._sum.amountInBase || 0);

    // Upcoming departures count
    const upcomingDepartures = await prisma.schedule.count({
      where: {
        isDeleted: false,
        departureDate: { gte: new Date() },
        status: { in: ["OPEN", "ALMOST_FULL"] },
        package: tenantFilter,
      },
    });

    const stats = {
      revenue: {
        value: totalRevenue,
        change:
          lastYearRevenue > 0
            ? (
                ((totalRevenue - lastYearRevenue) / lastYearRevenue) *
                100
              ).toFixed(1)
            : "0",
        trend: totalRevenue >= lastYearRevenue ? "up" : "down",
      },
      bookings: {
        value: totalBookings,
        change:
          lastYearBookings > 0
            ? (
                ((totalBookings - lastYearBookings) / lastYearBookings) *
                100
              ).toFixed(1)
            : "0",
        trend: totalBookings >= lastYearBookings ? "up" : "down",
      },
      customers: {
        value: totalCustomers,
        change:
          lastYearCustomers > 0
            ? (
                ((totalCustomers - lastYearCustomers) / lastYearCustomers) *
                100
              ).toFixed(1)
            : "0",
        trend: totalCustomers >= lastYearCustomers ? "up" : "down",
      },
      departures: {
        value: upcomingDepartures,
        change: "0",
        trend: "up",
      },
    };

    return successResponse({
      stats,
      monthlyRevenue: monthlyData,
      packageTypes,
      customerSources,
      bookingStatus,
      year,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return errorResponse("Failed to fetch reports", 500);
  }
}
