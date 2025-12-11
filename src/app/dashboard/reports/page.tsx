"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Plane,
  FileSpreadsheet,
  BarChart3,
  Activity,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// Custom Tooltip component (must be outside ReportsPage to avoid re-creation on render)
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white p-3 shadow-lg border">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600">
            {entry.name}:{" "}
            {entry.name === "revenue"
              ? formatCurrency(entry.value)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [activeChart, setActiveChart] = useState<"revenue" | "bookings">(
    "revenue",
  );
  const [loading, setLoading] = useState(true);

  // Mock data - in production, fetch from API
  const [data] = useState({
    stats: {
      revenue: { value: 1250000000, change: 12.5, trend: "up" },
      bookings: { value: 156, change: 8.2, trend: "up" },
      customers: { value: 89, change: 15.3, trend: "up" },
      departures: { value: 12, change: -2.1, trend: "down" },
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 850000000, bookings: 42, customers: 35 },
      { month: "Feb", revenue: 920000000, bookings: 48, customers: 41 },
      { month: "Mar", revenue: 1100000000, bookings: 55, customers: 48 },
      { month: "Apr", revenue: 980000000, bookings: 52, customers: 44 },
      { month: "May", revenue: 1150000000, bookings: 58, customers: 52 },
      { month: "Jun", revenue: 1250000000, bookings: 62, customers: 56 },
      { month: "Jul", revenue: 1180000000, bookings: 59, customers: 51 },
      { month: "Aug", revenue: 1320000000, bookings: 66, customers: 60 },
      { month: "Sep", revenue: 1080000000, bookings: 54, customers: 47 },
      { month: "Oct", revenue: 1420000000, bookings: 71, customers: 64 },
      { month: "Nov", revenue: 1560000000, bookings: 78, customers: 70 },
      { month: "Dec", revenue: 1850000000, bookings: 92, customers: 85 },
    ],
    packageTypes: [
      { name: "Umroh", value: 45, revenue: 2250000000 },
      { name: "Haji", value: 15, revenue: 4200000000 },
      { name: "Outbound", value: 22, revenue: 880000000 },
      { name: "Domestic", value: 12, revenue: 360000000 },
      { name: "MICE", value: 6, revenue: 720000000 },
    ],
    topPackages: [
      { name: "Umrah Ramadhan 2024", bookings: 45, revenue: 2250000000 },
      { name: "Umrah Plus Dubai", bookings: 32, revenue: 1920000000 },
      { name: "Haji Plus 2025", bookings: 28, revenue: 4200000000 },
      { name: "Tour Turki 10D", bookings: 24, revenue: 720000000 },
      { name: "Umrah Reguler", bookings: 18, revenue: 540000000 },
    ],
    bookingStatus: [
      { status: "Confirmed", count: 89, color: "#10b981" },
      { status: "Pending Payment", count: 34, color: "#f59e0b" },
      { status: "Processing", count: 21, color: "#3b82f6" },
      { status: "Cancelled", count: 12, color: "#ef4444" },
    ],
    customerSource: [
      { source: "Website", count: 45, percent: 35 },
      { source: "Agent/Partner", count: 38, percent: 30 },
      { source: "WhatsApp", count: 25, percent: 20 },
      { source: "Referral", count: 12, percent: 10 },
      { source: "Walk-in", count: 6, percent: 5 },
    ],
    recentActivities: [
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
    ],
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(data.stats.revenue.value),
      change: data.stats.revenue.change,
      trend: data.stats.revenue.trend,
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Total Bookings",
      value: data.stats.bookings.value.toString(),
      change: data.stats.bookings.change,
      trend: data.stats.bookings.trend,
      icon: Calendar,
      color: "blue",
    },
    {
      label: "New Customers",
      value: data.stats.customers.value.toString(),
      change: data.stats.customers.change,
      trend: data.stats.customers.trend,
      icon: Users,
      color: "purple",
    },
    {
      label: "Departures",
      value: data.stats.departures.value.toString(),
      change: data.stats.departures.change,
      trend: data.stats.departures.trend,
      icon: Plane,
      color: "amber",
    },
  ];

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Monthly Revenue Sheet
    const revenueData = data.monthlyRevenue.map((d) => ({
      Month: d.month,
      Revenue: d.revenue,
      Bookings: d.bookings,
      Customers: d.customers,
    }));
    const ws1 = XLSX.utils.json_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(wb, ws1, "Monthly Report");

    // Top Packages Sheet
    const packagesData = data.topPackages.map((p) => ({
      Package: p.name,
      Bookings: p.bookings,
      Revenue: p.revenue,
    }));
    const ws2 = XLSX.utils.json_to_sheet(packagesData);
    XLSX.utils.book_append_sheet(wb, ws2, "Top Packages");

    // Booking Status Sheet
    const statusData = data.bookingStatus.map((s) => ({
      Status: s.status,
      Count: s.count,
    }));
    const ws3 = XLSX.utils.json_to_sheet(statusData);
    XLSX.utils.book_append_sheet(wb, ws3, "Booking Status");

    // Download
    XLSX.writeFile(
      wb,
      `Report_${period}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
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
                    className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.change > 0 ? "+" : ""}
                    {stat.change}%
                  </span>
                  <span className="text-sm text-gray-500">
                    vs last {period}
                  </span>
                </div>
              </div>
              <div
                className={`rounded-lg p-2 ${
                  stat.color === "emerald"
                    ? "bg-emerald-100"
                    : stat.color === "blue"
                      ? "bg-blue-100"
                      : stat.color === "purple"
                        ? "bg-purple-100"
                        : "bg-amber-100"
                }`}
              >
                <stat.icon
                  className={`h-5 w-5 ${
                    stat.color === "emerald"
                      ? "text-emerald-600"
                      : stat.color === "blue"
                        ? "text-blue-600"
                        : stat.color === "purple"
                          ? "text-purple-600"
                          : "text-amber-600"
                  }`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue/Bookings Chart */}
        <Card className="col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue & Bookings Trend</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChart("revenue")}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  activeChart === "revenue"
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <DollarSign className="h-4 w-4" />
                Revenue
              </button>
              <button
                onClick={() => setActiveChart("bookings")}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  activeChart === "bookings"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Calendar className="h-4 w-4" />
                Bookings
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  activeChart === "revenue"
                    ? `${(value / 1000000000).toFixed(1)}B`
                    : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              {activeChart === "revenue" ? (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorBookings)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Package Types Pie Chart */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Revenue by Package Type
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={data.packageTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.packageTypes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Packages Bar Chart */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Top 5 Packages by Bookings
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topPackages} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip />
              <Bar dataKey="bookings" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Booking Status */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Booking Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={data.bookingStatus}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.bookingStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Customer Source */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Customer Source</h2>
          <div className="space-y-3">
            {data.customerSource.map((item, index) => (
              <div key={item.source}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">{item.source}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: COLORS[index],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-2 p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-4">
            {data.recentActivities.map((activity, index) => (
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

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <BarChart3 className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-emerald-100 text-sm">Total Revenue YTD</p>
          <p className="text-2xl font-bold">{formatCurrency(14660000000)}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <Calendar className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-blue-100 text-sm">Total Bookings YTD</p>
          <p className="text-2xl font-bold">687</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <Users className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-purple-100 text-sm">Total Customers</p>
          <p className="text-2xl font-bold">1,245</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <Activity className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-amber-100 text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold">68.5%</p>
        </Card>
      </div>
    </div>
  );
}
