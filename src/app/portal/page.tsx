"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Package,
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  Bell,
  ArrowRight,
} from "lucide-react";

export default function PortalHomePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Jamaah";

  // Mock data - replace with real API
  const stats = {
    activeBookings: 1,
    pendingPayments: 2,
    upcomingTrips: 1,
    totalTrips: 3,
  };

  const upcomingTrip = {
    id: "1",
    packageName: "Umroh Reguler 9 Hari",
    departureDate: "2025-02-15",
    status: "CONFIRMED",
    daysLeft: 65,
  };

  const recentNotifications = [
    {
      id: "1",
      message: "Pembayaran DP Anda telah dikonfirmasi",
      time: "2 jam lalu",
      read: false,
    },
    {
      id: "2",
      message: "Jadwal manasik telah diupdate",
      time: "1 hari lalu",
      read: true,
    },
    {
      id: "3",
      message: "Dokumen paspor Anda telah diverifikasi",
      time: "3 hari lalu",
      read: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
        <h1 className="text-2xl font-bold">Assalamualaikum, {userName}! 👋</h1>
        <p className="mt-1 text-white/90">
          Selamat datang di Portal Jamaah. Kelola perjalanan ibadah Anda dengan
          mudah.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeBookings}
              </p>
              <p className="text-sm text-gray-500">Booking Aktif</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <CreditCard className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingPayments}
              </p>
              <p className="text-sm text-gray-500">Menunggu Pembayaran</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.upcomingTrips}
              </p>
              <p className="text-sm text-gray-500">Perjalanan Mendatang</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTrips}
              </p>
              <p className="text-sm text-gray-500">Total Perjalanan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Trip */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Perjalanan Mendatang
          </h2>
          {upcomingTrip ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {upcomingTrip.packageName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Keberangkatan:{" "}
                    {new Date(upcomingTrip.departureDate).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {upcomingTrip.status}
                </span>
              </div>

              <div className="rounded-lg bg-primary/5 p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {upcomingTrip.daysLeft}
                  </p>
                  <p className="text-sm text-gray-600">Hari Lagi</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/portal/my-bookings/${upcomingTrip.id}`}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
                >
                  Lihat Detail
                </Link>
                <Link
                  href="/portal/itinerary"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Lihat Itinerary
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">
                Belum ada perjalanan mendatang
              </p>
              <Link
                href="/portal/packages"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Lihat Paket <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Notifikasi</h2>
            <Link
              href="/portal/notifications"
              className="text-sm text-primary hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {recentNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 rounded-lg p-3 ${
                  notif.read ? "bg-white" : "bg-blue-50"
                }`}
              >
                <div
                  className={`rounded-full p-2 ${notif.read ? "bg-gray-100" : "bg-blue-100"}`}
                >
                  <Bell
                    className={`h-4 w-4 ${notif.read ? "text-gray-500" : "text-blue-600"}`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm ${notif.read ? "text-gray-600" : "font-medium text-gray-900"}`}
                  >
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Aksi Cepat</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/portal/packages"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-primary/5"
          >
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-gray-900">Lihat Paket</p>
              <p className="text-xs text-gray-500">Temukan perjalanan impian</p>
            </div>
          </Link>

          <Link
            href="/portal/payments"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-primary/5"
          >
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-gray-900">Bayar Tagihan</p>
              <p className="text-xs text-gray-500">Lunasi pembayaran</p>
            </div>
          </Link>

          <Link
            href="/portal/documents"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-primary/5"
          >
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-gray-900">Upload Dokumen</p>
              <p className="text-xs text-gray-500">Lengkapi persyaratan</p>
            </div>
          </Link>

          <Link
            href="/portal/tracking"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-primary hover:bg-primary/5"
          >
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-gray-900">Live Tracking</p>
              <p className="text-xs text-gray-500">Pantau lokasi real-time</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
