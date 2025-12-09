"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Plane,
  Download,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(1250000000),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Total Bookings",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: Calendar,
      color: "blue",
    },
    {
      label: "New Customers",
      value: "89",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "purple",
    },
    {
      label: "Departures",
      value: "12",
      change: "-2.1%",
      trend: "down",
      icon: Plane,
      color: "amber",
    },
  ];

  const topPackages = [
    { name: "Umrah Ramadhan 2024", bookings: 45, revenue: 2250000000 },
    { name: "Umrah Plus Dubai", bookings: 32, revenue: 1920000000 },
    { name: "Haji Plus 2025", bookings: 28, revenue: 4200000000 },
    { name: "Tour Turki 10D", bookings: 24, revenue: 720000000 },
    { name: "Umrah Reguler", bookings: 18, revenue: 540000000 },
  ];

  const monthlyData = [
    { month: "Jan", revenue: 850, bookings: 42 },
    { month: "Feb", revenue: 920, bookings: 48 },
    { month: "Mar", revenue: 1100, bookings: 55 },
    { month: "Apr", revenue: 980, bookings: 52 },
    { month: "May", revenue: 1150, bookings: 58 },
    { month: "Jun", revenue: 1250, bookings: 62 },
  ];

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-500">Overview of your business performance</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border">
            {["week", "month", "quarter", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  period === p
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50"
                } ${p === "week" ? "rounded-l-lg" : ""} ${p === "year" ? "rounded-r-lg" : ""}`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                <div className="mt-1 flex items-center gap-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">
                    vs last {period}
                  </span>
                </div>
              </div>
              <div className={`rounded-lg bg-${stat.color}-100 p-2`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue Overview</h2>
            <select className="rounded-lg border px-3 py-1.5 text-sm">
              <option>Revenue</option>
              <option>Bookings</option>
            </select>
          </div>
          <div className="flex h-64 items-end gap-4">
            {monthlyData.map((data) => (
              <div
                key={data.month}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t-lg bg-primary/20 transition-all hover:bg-primary/30"
                    style={{ height: `${(data.revenue / maxRevenue) * 200}px` }}
                  >
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-primary"
                      style={{
                        height: `${(data.revenue / maxRevenue) * 200 * 0.7}px`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500">{data.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Packages */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Top Packages</h2>
          <div className="space-y-4">
            {topPackages.map((pkg, index) => (
              <div key={pkg.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {pkg.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pkg.bookings} bookings
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(pkg.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Booking Status */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Booking Status</h2>
          <div className="space-y-3">
            {[
              {
                status: "Confirmed",
                count: 89,
                color: "bg-green-500",
                percent: 57,
              },
              {
                status: "Pending Payment",
                count: 34,
                color: "bg-amber-500",
                percent: 22,
              },
              {
                status: "Processing",
                count: 21,
                color: "bg-blue-500",
                percent: 13,
              },
              {
                status: "Cancelled",
                count: 12,
                color: "bg-red-500",
                percent: 8,
              },
            ].map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">{item.status}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Source */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Customer Source</h2>
          <div className="space-y-3">
            {[
              { source: "Website", count: 45, percent: 35 },
              { source: "Agent/Partner", count: 38, percent: 30 },
              { source: "WhatsApp", count: 25, percent: 20 },
              { source: "Referral", count: 12, percent: 10 },
              { source: "Walk-in", count: 6, percent: 5 },
            ].map((item) => (
              <div key={item.source} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-600">{item.source}</span>
                    <span className="font-medium">{item.count} customers</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 text-right text-sm text-gray-500">
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="space-y-4">
          {[
            {
              action: "New booking",
              detail: "Umrah Ramadhan 2024 - Ahmad Fauzi",
              time: "5 minutes ago",
              type: "booking",
            },
            {
              action: "Payment received",
              detail: "Rp 45.000.000 from Budi Santoso",
              time: "15 minutes ago",
              type: "payment",
            },
            {
              action: "Customer registered",
              detail: "Siti Rahayu joined as new customer",
              time: "1 hour ago",
              type: "customer",
            },
            {
              action: "Schedule updated",
              detail: "Departure date changed for Group A",
              time: "2 hours ago",
              type: "schedule",
            },
            {
              action: "Invoice sent",
              detail: "INV-2024-0156 sent to customer",
              time: "3 hours ago",
              type: "invoice",
            },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={`mt-1 h-2 w-2 rounded-full ${
                  activity.type === "booking"
                    ? "bg-blue-500"
                    : activity.type === "payment"
                      ? "bg-green-500"
                      : activity.type === "customer"
                        ? "bg-purple-500"
                        : activity.type === "schedule"
                          ? "bg-amber-500"
                          : "bg-gray-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action}
                </p>
                <p className="text-sm text-gray-500">{activity.detail}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
