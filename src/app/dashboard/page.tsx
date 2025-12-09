"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CreditCard,
  Package,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    title: "Total Customers",
    value: "1,234",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Active Bookings",
    value: "456",
    change: "+8.2%",
    trend: "up",
    icon: CreditCard,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Packages",
    value: "89",
    change: "+3.1%",
    trend: "up",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Revenue",
    value: "Rp 1.2M",
    change: "-2.4%",
    trend: "down",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
];

const upcomingDepartures = [
  { id: 1, name: "Umroh Reguler - April", date: "15 Apr 2025", pax: 45 },
  { id: 2, name: "Haji Plus 2025", date: "20 Apr 2025", pax: 30 },
  { id: 3, name: "Tour Jepang Spring", date: "22 Apr 2025", pax: 25 },
  { id: 4, name: "Umroh Plus Dubai", date: "01 May 2025", pax: 35 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here&apos;s your overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
            <div className="space-y-4">
              {upcomingDepartures.map((departure) => (
                <div
                  key={departure.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {departure.name}
                    </p>
                    <p className="text-sm text-gray-500">{departure.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {departure.pax} pax
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No recent bookings</p>
              <p className="text-sm">Start by creating a new booking</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
