"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, Plane, Clock, ChevronRight } from "lucide-react";

interface Schedule {
  id: string;
  package: { id: string; name: string; businessType: string };
  departureDate: string;
  returnDate: string;
  quotaTotal: number;
  quotaAvailable: number;
  priceQuad: number;
  priceTriple: number;
  priceDouble: number;
  priceSingle: number;
  status: string;
}

export default function PortalSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/schedules?status=OPEN");
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700";
      case "FULL":
        return "bg-red-100 text-red-700";
      case "CLOSED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const months = [
    { value: "", label: "Semua Bulan" },
    { value: "2025-01", label: "Januari 2025" },
    { value: "2025-02", label: "Februari 2025" },
    { value: "2025-03", label: "Maret 2025" },
    { value: "2025-04", label: "April 2025" },
    { value: "2025-05", label: "Mei 2025" },
    { value: "2025-06", label: "Juni 2025" },
  ];

  const filteredSchedules = selectedMonth
    ? schedules.filter((s) => s.departureDate.startsWith(selectedMonth))
    : schedules;

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Jadwal Keberangkatan
        </h1>
        <p className="text-gray-500">Pilih jadwal keberangkatan yang sesuai</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {months.map((month) => (
          <button
            key={month.value}
            onClick={() => setSelectedMonth(month.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedMonth === month.value
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {month.label}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      {filteredSchedules.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">Tidak ada jadwal tersedia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Package & Date */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {schedule.package?.name || "Paket Perjalanan"}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {schedule.package?.businessType}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(schedule.departureDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      s/d {formatDate(schedule.returnDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Sisa {schedule.quotaAvailable} dari {schedule.quotaTotal}{" "}
                      seat
                    </span>
                  </div>
                </div>

                {/* Right: Price & Action */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Mulai dari</p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(schedule.priceQuad)}
                    </p>
                    <p className="text-xs text-gray-400">/pax (Quad)</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(schedule.status)}`}
                    >
                      {schedule.status === "OPEN"
                        ? "Tersedia"
                        : schedule.status}
                    </span>
                    {schedule.status === "OPEN" && (
                      <Link
                        href={`/portal/booking?schedule=${schedule.id}`}
                        className="flex items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                      >
                        Booking <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 grid grid-cols-4 gap-2 border-t border-gray-100 pt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Quad</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(schedule.priceQuad)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Triple</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(schedule.priceTriple)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Double</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(schedule.priceDouble)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Single</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(schedule.priceSingle)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
