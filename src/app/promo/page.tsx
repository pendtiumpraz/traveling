"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Tag,
  Clock,
  Percent,
  Zap,
  Calendar,
  Users,
  Gift,
  Star,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscount: number | null;
  minPurchase: number | null;
  startDate: string;
  endDate: string;
  quota: number | null;
  used: number;
  thumbnail: string | null;
  banner: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  isFeatured: boolean;
  remainingQuota: number | null;
  daysLeft: number;
  isExpiringSoon: boolean;
}

const promoTypes = [
  { value: "", label: "Semua Promo", icon: Tag },
  { value: "EARLY_BIRD", label: "Early Bird", icon: Clock },
  { value: "LAST_MINUTE", label: "Last Minute", icon: Zap },
  { value: "FLASH_SALE", label: "Flash Sale", icon: Zap },
  { value: "SEASONAL", label: "Musiman", icon: Calendar },
  { value: "PACKAGE_DEAL", label: "Paket Hemat", icon: Gift },
  { value: "GROUP_DISCOUNT", label: "Diskon Grup", icon: Users },
  { value: "REFERRAL", label: "Referral", icon: Gift },
  { value: "LOYALTY", label: "Member", icon: Star },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function PromoListingPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          public: "true",
          limit: "50",
        });
        if (selectedType) params.append("type", selectedType);

        const res = await fetch(`/api/promotions?${params}`);
        const data = await res.json();
        if (data.success) {
          setPromotions(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [selectedType]);

  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.title.toLowerCase().includes(search.toLowerCase()) ||
      promo.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const featuredPromos = filteredPromotions.filter((p) => p.isFeatured);
  const regularPromos = filteredPromotions.filter((p) => !p.isFeatured);

  const getTypeIcon = (type: string) => {
    const found = promoTypes.find((t) => t.value === type);
    return found?.icon || Tag;
  };

  const getTypeLabel = (type: string) => {
    const found = promoTypes.find((t) => t.value === type);
    return found?.label || type;
  };

  const getTypeBgColor = (type: string) => {
    const colors: Record<string, string> = {
      EARLY_BIRD: "bg-blue-500",
      LAST_MINUTE: "bg-orange-500",
      FLASH_SALE: "bg-red-500",
      SEASONAL: "bg-green-500",
      PACKAGE_DEAL: "bg-purple-500",
      GROUP_DISCOUNT: "bg-indigo-500",
      REFERRAL: "bg-pink-500",
      LOYALTY: "bg-yellow-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-primary/80 py-16 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container relative mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">
            Promo & Penawaran Spesial
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-white/90">
            Temukan berbagai penawaran menarik untuk perjalanan ibadah Anda.
            Hemat lebih banyak dengan promo terbaik kami!
          </p>

          {/* Search Bar */}
          <div className="mx-auto max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari promo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border-0 py-4 pl-12 pr-4 text-gray-900 shadow-lg focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-20 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="hidden gap-2 md:flex">
              {promoTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedType === type.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 md:hidden"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            <p className="text-sm text-gray-500">
              {filteredPromotions.length} promo ditemukan
            </p>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 pb-4 md:hidden">
              {promoTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value);
                    setShowFilters(false);
                  }}
                  className={`rounded-full px-3 py-1 text-sm ${
                    selectedType === type.value
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl bg-gray-200"
              ></div>
            ))}
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="py-20 text-center">
            <Tag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-600">
              Tidak ada promo tersedia
            </h3>
            <p className="text-gray-500">
              Coba ubah filter atau cek kembali nanti untuk promo terbaru
            </p>
          </div>
        ) : (
          <>
            {/* Featured Promos */}
            {featuredPromos.length > 0 && (
              <div className="mb-12">
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Promo Unggulan
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {featuredPromos.map((promo) => (
                    <FeaturedPromoCard key={promo.id} promo={promo} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Promos */}
            <div>
              <h2 className="mb-6 text-2xl font-bold">Semua Promo</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularPromos.map((promo) => (
                  <PromoCard key={promo.id} promo={promo} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FeaturedPromoCard({ promo }: { promo: Promotion }) {
  return (
    <Link href={`/promo/${promo.slug}`}>
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-xl transition-transform hover:scale-[1.02]">
        {promo.banner && (
          <div className="absolute inset-0">
            <Image
              src={promo.banner}
              alt={promo.title}
              fill
              className="object-cover opacity-30"
            />
          </div>
        )}
        <div className="relative p-8">
          <div className="mb-4 flex items-start justify-between">
            <div>
              {promo.badgeText && (
                <span
                  className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold"
                  style={{ backgroundColor: promo.badgeColor || "#ef4444" }}
                >
                  {promo.badgeText}
                </span>
              )}
              <h3 className="text-2xl font-bold">{promo.title}</h3>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black">
                {promo.discountType === "PERCENTAGE"
                  ? `${promo.discountValue}%`
                  : formatCurrency(promo.discountValue)}
              </div>
              <div className="text-sm text-white/80">OFF</div>
            </div>
          </div>

          {promo.description && (
            <p className="mb-4 text-white/90 line-clamp-2">
              {promo.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {promo.daysLeft} hari lagi
              </span>
              {promo.remainingQuota !== null && (
                <span>Sisa {promo.remainingQuota} kuota</span>
              )}
            </div>
            <span className="flex items-center gap-1 font-medium group-hover:underline">
              Lihat Detail
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const promoTypeConfig: Record<string, { label: string; color: string }> = {
  EARLY_BIRD: { label: "Early Bird", color: "bg-blue-500" },
  LAST_MINUTE: { label: "Last Minute", color: "bg-orange-500" },
  FLASH_SALE: { label: "Flash Sale", color: "bg-red-500" },
  SEASONAL: { label: "Musiman", color: "bg-green-500" },
  PACKAGE_DEAL: { label: "Paket Hemat", color: "bg-purple-500" },
  GROUP_DISCOUNT: { label: "Diskon Grup", color: "bg-indigo-500" },
  REFERRAL: { label: "Referral", color: "bg-pink-500" },
  LOYALTY: { label: "Member", color: "bg-yellow-500" },
};

function PromoCard({ promo }: { promo: Promotion }) {
  const config = promoTypeConfig[promo.type] || {
    label: promo.type,
    color: "bg-gray-500",
  };

  return (
    <Link href={`/promo/${promo.slug}`}>
      <div className="group h-full overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl">
        {/* Image */}
        <div className="relative h-48 bg-gray-100">
          {promo.thumbnail ? (
            <Image
              src={promo.thumbnail}
              alt={promo.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div
              className={`flex h-full items-center justify-center ${config.color}`}
            >
              <Percent className="h-16 w-16 text-white/50" />
            </div>
          )}

          {/* Badge */}
          <div className="absolute left-4 top-4">
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white ${config.color}`}
            >
              <Tag className="h-3 w-3" />
              {config.label}
            </span>
          </div>

          {/* Discount Badge */}
          <div className="absolute right-4 top-4">
            <span className="rounded-lg bg-red-500 px-3 py-2 text-lg font-bold text-white shadow-lg">
              {promo.discountType === "PERCENTAGE"
                ? `${promo.discountValue}%`
                : formatCurrency(promo.discountValue)}
            </span>
          </div>

          {/* Expiring Soon Badge */}
          {promo.isExpiringSoon && (
            <div className="absolute bottom-4 left-4">
              <span className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white">
                <Zap className="h-3 w-3" />
                Segera Berakhir
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary">
            {promo.title}
          </h3>

          {promo.description && (
            <p className="mb-4 text-sm text-gray-500 line-clamp-2">
              {promo.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="h-4 w-4" />
              s/d {formatDate(promo.endDate)}
            </div>

            {promo.remainingQuota !== null && promo.remainingQuota < 50 && (
              <span className="text-red-500 font-medium">
                Sisa {promo.remainingQuota}
              </span>
            )}
          </div>

          {promo.minPurchase && (
            <div className="mt-2 text-xs text-gray-400">
              Min. pembelian {formatCurrency(promo.minPurchase)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
