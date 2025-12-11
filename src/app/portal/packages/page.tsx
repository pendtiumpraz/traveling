"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Clock, Star, ChevronRight } from "lucide-react";

interface Package {
  id: string;
  name: string;
  businessType: string;
  description: string;
  duration: number;
  basePrice: number;
  currency: string;
  thumbnail?: string;
  rating: number;
  reviews: number;
  highlights: string[];
}

export default function PortalPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (data.success) {
        setPackages(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchSearch = pkg.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || pkg.businessType === filterType;
    return matchSearch && matchType;
  });

  const businessTypes = [
    { value: "ALL", label: "Semua" },
    { value: "UMROH", label: "Umroh" },
    { value: "HAJI", label: "Haji" },
    { value: "OUTBOUND", label: "Tour Luar Negeri" },
    { value: "DOMESTIC", label: "Tour Dalam Negeri" },
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl bg-gray-200"
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
        <h1 className="text-2xl font-bold text-gray-900">Paket Perjalanan</h1>
        <p className="text-gray-500">Temukan paket perjalanan impian Anda</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {businessTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                filterType === type.value
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Package Grid */}
      {filteredPackages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">Tidak ada paket ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {pkg.thumbnail ? (
                  <span
                    className="block h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${pkg.thumbnail})` }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <MapPin className="h-12 w-12 text-primary/50" />
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
                    {pkg.businessType}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                  {pkg.name}
                </h3>

                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {pkg.duration} Hari
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    {pkg.rating || 4.8} ({pkg.reviews || 0})
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                  {pkg.description ||
                    "Paket perjalanan dengan fasilitas lengkap dan pelayanan terbaik."}
                </p>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Mulai dari</p>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(pkg.basePrice, pkg.currency)}
                    </p>
                  </div>
                  <Link
                    href={`/portal/packages/${pkg.id}`}
                    className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Detail <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
