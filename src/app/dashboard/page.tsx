"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui";
import {
  Users,
  CreditCard,
  Package,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardStats {
  summary: {
    totalCustomers: { value: number; change: string; trend: string };
    activeBookings: { value: number; change: string; trend: string };
    totalPackages: { value: number; change: string; trend: string };
    revenue: { value: number; change: string; trend: string };
    pendingPayments: { value: number };
  };
  upcomingDepartures: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    pax: number;
    quota: number;
    availableQuota: number;
  }>;
  recentBookings: Array<{
    id: string;
    code: string;
    customer: string;
    package: string;
    type: string;
    departureDate: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    createdAt: string;
  }>;
  bookingsByStatus: Record<string, number>;
  bookingsByType: Record<string, number>;
}

const statusColors: Record<
  string,
  "default" | "warning" | "success" | "destructive" | "secondary"
> = {
  PENDING: "warning",
  CONFIRMED: "default",
  PROCESSING: "default",
  READY: "success",
  DEPARTED: "secondary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const paymentStatusColors: Record<
  string,
  "default" | "warning" | "success" | "destructive"
> = {
  UNPAID: "destructive",
  PARTIAL: "warning",
  PAID: "success",
  REFUNDED: "default",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || "Failed to fetch stats");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-gray-600">{error || "No data available"}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchStats();
          }}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Customers",
      value: stats.summary.totalCustomers.value.toLocaleString(),
      change: `${stats.summary.totalCustomers.change}%`,
      trend: stats.summary.totalCustomers.trend,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Bookings",
      value: stats.summary.activeBookings.value.toLocaleString(),
      change: `${stats.summary.activeBookings.change}%`,
      trend: stats.summary.activeBookings.trend,
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Packages",
      value: stats.summary.totalPackages.value.toLocaleString(),
      change: `${stats.summary.totalPackages.change}%`,
      trend: stats.summary.totalPackages.trend,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Revenue (This Month)",
      value: formatCurrency(stats.summary.revenue.value),
      change: `${stats.summary.revenue.change}%`,
      trend: stats.summary.revenue.trend,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back! Here&apos;s your overview.
          </p>
        </div>
        <Link
          href="/dashboard/ai-assistant"
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-white hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span
                    className={`flex items-center text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="ml-1 h-4 w-4" />
                    )}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Payments Alert */}
      {stats.summary.pendingPayments.value > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-amber-100 p-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-800">
                {stats.summary.pendingPayments.value} booking menunggu
                pembayaran
              </p>
              <p className="text-sm text-amber-600">
                Perlu tindak lanjut untuk konfirmasi pembayaran
              </p>
            </div>
            <Link
              href="/dashboard/bookings?paymentStatus=UNPAID"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Lihat Detail
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Departures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Departures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingDepartures.length > 0 ? (
              <div className="space-y-4">
                {stats.upcomingDepartures.map((departure) => (
                  <Link
                    key={departure.id}
                    href={`/dashboard/schedules?id=${departure.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {departure.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(departure.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {departure.pax} / {departure.quota} pax
                      </p>
                      <Badge
                        variant={
                          departure.availableQuota < 5 ? "warning" : "default"
                        }
                        size="sm"
                      >
                        Sisa {departure.availableQuota}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">Tidak ada jadwal dalam 30 hari ke depan</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/dashboard/bookings?id=${booking.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-mono text-sm font-medium text-primary">
                        {booking.code}
                      </p>
                      <p className="text-sm text-gray-900">
                        {booking.customer}
                      </p>
                      <p className="text-xs text-gray-500">{booking.package}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={statusColors[booking.status]} size="sm">
                        {booking.status}
                      </Badge>
                      <Badge
                        variant={paymentStatusColors[booking.paymentStatus]}
                        size="sm"
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">No recent bookings</p>
                <Link
                  href="/dashboard/bookings"
                  className="text-sm text-primary hover:underline"
                >
                  Create a new booking
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Statistics */}
      {(Object.keys(stats.bookingsByStatus).length > 0 ||
        Object.keys(stats.bookingsByType).length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* By Status */}
          {Object.keys(stats.bookingsByStatus).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.bookingsByStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <Badge variant={statusColors[status] || "default"}>
                          {status}
                        </Badge>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* By Business Type */}
          {Object.keys(stats.bookingsByType).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Business Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.bookingsByType).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-600">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
