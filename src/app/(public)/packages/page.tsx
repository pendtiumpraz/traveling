"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plane,
  Search,
  Clock,
  Star,
  ChevronRight,
  Hotel,
  Filter,
  X,
} from "lucide-react";

interface Package {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  description: string | null;
  duration: number;
  basePrice: number;
  currency: string;
  thumbnail: string | null;
  inclusions: string | null;
  highlights: string[];
  rating: number;
  reviewCount: number;
}

const businessTypes = [
  { value: "", label: "Semua Paket" },
  { value: "UMROH", label: "Umroh" },
  { value: "HAJI", label: "Haji" },
  { value: "OUTBOUND", label: "Outbound" },
  { value: "INBOUND", label: "Inbound" },
  { value: "DOMESTIC", label: "Domestic" },
  { value: "MICE", label: "MICE" },
  { value: "CRUISE", label: "Cruise" },
];

const sortOptions = [
  { value: "newest", label: "Terbaru" },
  { value: "price_low", label: "Harga Terendah" },
  { value: "price_high", label: "Harga Tertinggi" },
  { value: "duration_short", label: "Durasi Terpendek" },
  { value: "popular", label: "Terpopuler" },
];

export default function PublicPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (businessType) params.append("businessType", businessType);
      params.append("isActive", "true");

      const res = await fetch(`/api/packages?${params}`);
      const data = await res.json();

      if (data.success) {
        const pkgs = data.data.map((p: Package) => ({
          ...p,
          highlights: p.inclusions?.split("\n").slice(0, 4) || [],
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 100) + 20,
        }));

        // Sort
        if (sortBy === "price_low") {
          pkgs.sort((a: Package, b: Package) => a.basePrice - b.basePrice);
        } else if (sortBy === "price_high") {
          pkgs.sort((a: Package, b: Package) => b.basePrice - a.basePrice);
        } else if (sortBy === "duration_short") {
          pkgs.sort((a: Package, b: Package) => a.duration - b.duration);
        }

        setPackages(pkgs);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setLoading(false);
    }
  }, [businessType, sortBy]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const filteredPackages = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBusinessTypeLabel = (type: string) => {
    return businessTypes.find((t) => t.value === type)?.label || type;
  };

  const getBusinessTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      UMROH: "bg-emerald-100 text-emerald-700",
      HAJI: "bg-green-100 text-green-700",
      OUTBOUND: "bg-blue-100 text-blue-700",
      INBOUND: "bg-purple-100 text-purple-700",
      DOMESTIC: "bg-orange-100 text-orange-700",
      MICE: "bg-pink-100 text-pink-700",
      CRUISE: "bg-cyan-100 text-cyan-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
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
            <Link href="/packages" className="text-emerald-600 font-semibold">
              Paket
            </Link>
            <Link
              href="/schedules"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
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
      <section className="relative pt-20 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <h1 className="text-4xl font-bold md:text-5xl">Paket Perjalanan</h1>
          <p className="mt-4 text-lg text-emerald-100 max-w-2xl">
            Temukan paket perjalanan terbaik untuk ibadah Umroh, Haji, dan
            wisata lainnya
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari paket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/20 px-6 py-4 font-medium backdrop-blur hover:bg-white/30 transition-colors md:hidden"
            >
              <Filter className="h-5 w-5" />
              Filter
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="sticky top-24 space-y-6">
              {/* Mobile Close */}
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="font-semibold">Filter</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Business Type */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Jenis Perjalanan
                </h3>
                <div className="space-y-2">
                  {businessTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="businessType"
                        value={type.value}
                        checked={businessType === type.value}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Urutkan</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Package Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Menampilkan{" "}
                <span className="font-semibold">{filteredPackages.length}</span>{" "}
                paket
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="hidden md:block rounded-lg border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="h-48 rounded-lg bg-gray-200" />
                    <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="text-center py-16">
                <Plane className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Tidak ada paket
                </h3>
                <p className="mt-2 text-gray-500">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPackages.map((pkg) => (
                  <Link key={pkg.id} href={`/packages/${pkg.slug || pkg.id}`}>
                    <div className="group h-full overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all">
                      {/* Image */}
                      <div className="relative h-48 bg-gray-100">
                        {pkg.thumbnail ? (
                          <Image
                            src={pkg.thumbnail}
                            alt={pkg.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                            <Plane className="h-16 w-16 text-white/50" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getBusinessTypeColor(pkg.businessType)}`}
                          >
                            {getBusinessTypeLabel(pkg.businessType)}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {pkg.name}
                        </h3>

                        {/* Rating */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">
                              {pkg.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            ({pkg.reviewCount} review)
                          </span>
                        </div>

                        {/* Info */}
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {pkg.duration} Hari
                          </div>
                          <div className="flex items-center gap-1">
                            <Hotel className="h-4 w-4" />
                            Hotel *4/*5
                          </div>
                        </div>

                        {/* Highlights */}
                        {pkg.highlights.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {pkg.highlights.slice(0, 3).map((h, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                <span className="line-clamp-1">{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Price */}
                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                          <div>
                            <p className="text-xs text-gray-400">Mulai dari</p>
                            <p className="text-lg font-bold text-emerald-600">
                              {formatCurrency(pkg.basePrice)}
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:underline">
                            Lihat Detail
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
