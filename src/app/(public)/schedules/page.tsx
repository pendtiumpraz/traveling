"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plane,
  Search,
  Calendar,
  Users,
  ChevronRight,
  ChevronLeft,
  Clock,
  Hotel,
  CheckCircle,
} from "lucide-react";

interface Schedule {
  id: string;
  departureDate: string;
  returnDate: string;
  quota: number;
  available: number;
  status: string;
  priceQuad: number;
  priceTriple: number;
  priceDouble: number;
  priceSingle: number;
  package: {
    id: string;
    name: string;
    slug: string;
    businessType: string;
    duration: number;
    thumbnail: string | null;
  };
}

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function PublicSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [businessType, setBusinessType] = useState("");
  const [search, setSearch] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showFilters, setShowFilters] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("status", "OPEN");

      const res = await fetch(`/api/schedules?${params}`);
      const data = await res.json();

      if (data.success) {
        // Filter by month/year
        const filtered = data.data.filter((s: Schedule) => {
          const date = new Date(s.departureDate);
          const matchMonth =
            date.getMonth() === selectedMonth &&
            date.getFullYear() === selectedYear;
          const matchType =
            !businessType || s.package.businessType === businessType;
          return matchMonth && matchType;
        });
        setSchedules(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, businessType]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const filteredSchedules = schedules.filter((s) =>
    s.package.name.toLowerCase().includes(search.toLowerCase()),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string, available: number) => {
    if (available === 0 || status === "FULL") {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          Penuh
        </span>
      );
    }
    if (available <= 5) {
      return (
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
          Sisa {available}
        </span>
      );
    }
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        Tersedia
      </span>
    );
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
              <Plane className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">TravelERP</span>
              <p className="text-xs text-gray-500">Umrah & Haji Terpercaya</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/packages"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              Paket
            </Link>
            <Link href="/schedules" className="text-emerald-600 font-semibold">
              Jadwal
            </Link>
            <Link
              href="/promo"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              Promo
            </Link>
            <Link
              href="/#contact"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              Kontak
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 font-semibold text-white shadow-lg hover:shadow-emerald-500/30 transition-all"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <h1 className="text-4xl font-bold md:text-5xl">
            Jadwal Keberangkatan
          </h1>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl">
            Pilih jadwal keberangkatan yang sesuai dengan rencana Anda
          </p>

          {/* Month Selector */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-center min-w-[200px]">
              <h2 className="text-2xl font-bold">
                {months[selectedMonth]} {selectedYear}
              </h2>
            </div>
            <button
              onClick={nextMonth}
              className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari paket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-gray-200 py-3 pl-12 pr-4 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="rounded-xl border-gray-200 py-3 px-4 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Semua Jenis</option>
            <option value="UMROH">Umroh</option>
            <option value="HAJI">Haji</option>
            <option value="OUTBOUND">Outbound</option>
            <option value="DOMESTIC">Domestic</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex gap-6">
                  <div className="h-32 w-48 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-4 w-1/4 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Tidak ada jadwal
            </h3>
            <p className="mt-2 text-gray-500">
              Belum ada jadwal keberangkatan untuk {months[selectedMonth]}{" "}
              {selectedYear}
            </p>
            <button
              onClick={nextMonth}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Lihat Bulan Berikutnya
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="group overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
                    {schedule.package.thumbnail ? (
                      <Image
                        src={schedule.package.thumbnail}
                        alt={schedule.package.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                        <Plane className="h-12 w-12 text-white/50" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            {schedule.package.businessType}
                          </span>
                          {getStatusBadge(schedule.status, schedule.available)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {schedule.package.name}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            {formatDate(schedule.departureDate)} -{" "}
                            {formatDate(schedule.returnDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            {schedule.package.duration} Hari
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            Sisa {schedule.available} dari {schedule.quota} seat
                          </div>
                        </div>
                      </div>

                      {/* Price Grid */}
                      <div className="grid grid-cols-2 gap-2 text-center min-w-[200px]">
                        <div className="rounded-lg bg-gray-50 p-2">
                          <p className="text-xs text-gray-500">Quad</p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(schedule.priceQuad)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2">
                          <p className="text-xs text-gray-500">Triple</p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(schedule.priceTriple)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2">
                          <p className="text-xs text-gray-500">Double</p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(schedule.priceDouble)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-2">
                          <p className="text-xs text-gray-500">Single</p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(schedule.priceSingle)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Termasuk Visa
                        </div>
                        <div className="flex items-center gap-1">
                          <Hotel className="h-4 w-4 text-green-500" />
                          Hotel *4/*5
                        </div>
                      </div>
                      <Link
                        href={`/portal/booking?schedule=${schedule.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        Pesan Sekarang
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Month Navigation */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Jadwal Bulan Lainnya
          </h3>
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() + i);
              const m = date.getMonth();
              const y = date.getFullYear();
              const isActive = m === selectedMonth && y === selectedYear;

              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedMonth(m);
                    setSelectedYear(y);
                  }}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {months[m]} {y}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4 mt-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <span className="font-bold text-white">TravelERP</span>
                <p className="text-xs text-gray-400">Umrah & Haji Terpercaya</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 TravelERP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
