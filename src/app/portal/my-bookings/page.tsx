"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  CreditCard,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Booking {
  id: string;
  code: string;
  schedule: {
    package: { name: string };
    departureDate: string;
    returnDate: string;
  };
  roomType: string;
  paxAdult: number;
  paxChild: number;
  totalPrice: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export default function PortalMyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/portal/bookings");
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; icon: typeof Clock }
    > = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      CONFIRMED: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: CheckCircle,
      },
      COMPLETED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
      CANCELLED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    const style = styles[status] || styles.PENDING;
    const Icon = style.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      UNPAID: "bg-red-100 text-red-700",
      PARTIAL: "bg-yellow-100 text-yellow-700",
      PAID: "bg-green-100 text-green-700",
    };
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.UNPAID}`}
      >
        {status === "UNPAID"
          ? "Belum Bayar"
          : status === "PARTIAL"
            ? "DP"
            : "Lunas"}
      </span>
    );
  };

  const filteredBookings =
    filter === "ALL"
      ? bookings
      : bookings.filter((b) => b.bookingStatus === filter);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Saya</h1>
          <p className="text-gray-500">Riwayat dan status booking Anda</p>
        </div>
        <Link
          href="/portal/booking"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          + Booking Baru
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
                filter === status
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {status === "ALL" ? "Semua" : status}
            </button>
          ),
        )}
      </div>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">Belum ada booking</p>
          <Link
            href="/portal/packages"
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Lihat Paket
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">#{booking.code}</p>
                      <h3 className="font-semibold text-gray-900">
                        {booking.schedule?.package?.name || "Paket Perjalanan"}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {booking.schedule &&
                        formatDate(booking.schedule.departureDate)}
                    </span>
                    <span>•</span>
                    <span>{booking.roomType} Room</span>
                    <span>•</span>
                    <span>{booking.paxAdult + booking.paxChild} Pax</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {getStatusBadge(booking.bookingStatus)}
                    {getPaymentBadge(booking.paymentStatus)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(booking.totalPrice)}
                    </p>
                  </div>
                  <Link
                    href={`/portal/my-bookings/${booking.id}`}
                    className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Actions */}
              {booking.paymentStatus !== "PAID" &&
                booking.bookingStatus !== "CANCELLED" && (
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    <Link
                      href={`/portal/payments?booking=${booking.id}`}
                      className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                      <CreditCard className="h-4 w-4" />
                      Bayar Sekarang
                    </Link>
                    <Link
                      href={`/portal/my-bookings/${booking.id}`}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
