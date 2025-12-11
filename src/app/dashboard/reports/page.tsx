"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  AlertCircle,
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

interface ReportData {
  stats: {
    revenue: { value: number; change: string; trend: string };
    bookings: { value: number; change: string; trend: string };
    customers: { value: number; change: string; trend: string };
    departures: { value: number; change: string; trend: string };
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
    customers: number;
  }>;
  packageTypes: Array<{
    name: string;
    value: number;
    revenue: number;
  }>;
  customerSources: Array<{
    name: string;
    value: number;
  }>;
  bookingStatus: Array<{
    name: string;
    value: number;
  }>;
  year: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
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
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ReportsPage() {
  const [activeChart, setActiveChart] = useState<"revenue" | "bookings">(
    "revenue",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/summary?year=${year}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const exportToExcel = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Travel ERP - Annual Report " + year],
      [],
      ["Metric", "Value", "Change (%)"],
      ["Total Revenue", data.stats.revenue.value, data.stats.revenue.change],
      ["Total Bookings", data.stats.bookings.value, data.stats.bookings.change],
      [
        "New Customers",
        data.stats.customers.value,
        data.stats.customers.change,
      ],
      [
        "Upcoming Departures",
        data.stats.departures.value,
        data.stats.departures.change,
      ],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    // Monthly data sheet
    const monthlyHeaders = ["Month", "Revenue", "Bookings", "Customers"];
    const monthlyRows = data.monthlyRevenue.map((m) => [
      m.month,
      m.revenue,
      m.bookings,
      m.customers,
    ]);
    const ws2 = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyRows]);
    XLSX.utils.book_append_sheet(wb, ws2, "Monthly Data");

    // Business types sheet
    if (data.packageTypes.length > 0) {
      const typeHeaders = ["Business Type", "Bookings", "Revenue"];
      const typeRows = data.packageTypes.map((t) => [
        t.name,
        t.value,
        t.revenue,
      ]);
      const ws3 = XLSX.utils.aoa_to_sheet([typeHeaders, ...typeRows]);
      XLSX.utils.book_append_sheet(wb, ws3, "By Business Type");
    }

    XLSX.writeFile(wb, `Travel-Report-${year}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-gray-600">{error || "No data available"}</p>
        <button
          onClick={fetchReports}
          className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(data.stats.revenue.value),
      change: parseFloat(data.stats.revenue.change),
      trend: data.stats.revenue.trend,
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Total Bookings",
      value: data.stats.bookings.value.toLocaleString(),
      change: parseFloat(data.stats.bookings.change),
      trend: data.stats.bookings.trend,
      icon: Calendar,
      color: "blue",
    },
    {
      label: "New Customers",
      value: data.stats.customers.value.toLocaleString(),
      change: parseFloat(data.stats.customers.change),
      trend: data.stats.customers.trend,
      icon: Users,
      color: "purple",
    },
    {
      label: "Upcoming Departures",
      value: data.stats.departures.value.toLocaleString(),
      change: parseFloat(data.stats.departures.change),
      trend: data.stats.departures.trend,
      icon: Plane,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-500">Analyze your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div
                className={`rounded-lg p-2 bg-${stat.color}-100`}
                style={{
                  backgroundColor:
                    stat.color === "emerald"
                      ? "#d1fae5"
                      : stat.color === "blue"
                        ? "#dbeafe"
                        : stat.color === "purple"
                          ? "#ede9fe"
                          : "#fef3c7",
                }}
              >
                <stat.icon
                  className="h-5 w-5"
                  style={{
                    color:
                      stat.color === "emerald"
                        ? "#10b981"
                        : stat.color === "blue"
                          ? "#3b82f6"
                          : stat.color === "purple"
                            ? "#8b5cf6"
                            : "#f59e0b",
                  }}
                />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(stat.change).toFixed(1)}%
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Monthly Performance</h2>
            <div className="flex rounded-lg border p-1">
              <button
                onClick={() => setActiveChart("revenue")}
                className={`rounded px-3 py-1 text-sm ${
                  activeChart === "revenue"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveChart("bookings")}
                className={`rounded px-3 py-1 text-sm ${
                  activeChart === "bookings"
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
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
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) =>
                  activeChart === "revenue"
                    ? `${(value / 1000000000).toFixed(1)}B`
                    : value.toString()
                }
              />
              <Tooltip content={<CustomTooltip />} />
              {activeChart === "revenue" ? (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Business Type Chart */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-gray-900">By Business Type</h2>
          {data.packageTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={data.packageTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.packageTypes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-500">
              No booking data yet
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Customer Source */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Customer Sources</h2>
          {data.customerSources.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.customerSources} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9ca3af"
                  fontSize={12}
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-gray-500">
              No customer data yet
            </div>
          )}
        </Card>

        {/* Booking Status */}
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Booking Status</h2>
          {data.bookingStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.bookingStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.bookingStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-gray-500">
              No booking data yet
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
