"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Percent,
  Users,
  Gift,
  CheckCircle,
  Copy,
  Share2,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  duration: number;
  businessType: string;
}

interface Promotion {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  content: string | null;
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
  images: string[] | null;
  badgeText: string | null;
  badgeColor: string | null;
  terms: string | null;
  remainingQuota: number | null;
  daysLeft: number;
  packages: Package[] | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const promoTypeInfo: Record<
  string,
  { label: string; icon: typeof Tag; color: string }
> = {
  EARLY_BIRD: { label: "Early Bird", icon: Clock, color: "bg-blue-500" },
  LAST_MINUTE: { label: "Last Minute", icon: Clock, color: "bg-orange-500" },
  FLASH_SALE: { label: "Flash Sale", icon: Sparkles, color: "bg-red-500" },
  SEASONAL: { label: "Promo Musiman", icon: Calendar, color: "bg-green-500" },
  PACKAGE_DEAL: { label: "Paket Hemat", icon: Gift, color: "bg-purple-500" },
  GROUP_DISCOUNT: { label: "Diskon Grup", icon: Users, color: "bg-indigo-500" },
  REFERRAL: { label: "Referral", icon: Gift, color: "bg-pink-500" },
  LOYALTY: { label: "Member Reward", icon: Tag, color: "bg-yellow-500" },
};

export default function PromoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await fetch(`/api/promotions/${resolvedParams.slug}`);
        const data = await res.json();
        if (data.success) {
          setPromo(data.data);
        } else {
          router.push("/promo");
        }
      } catch (error) {
        console.error("Failed to fetch promotion:", error);
        router.push("/promo");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotion();
  }, [resolvedParams.slug, router]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && promo) {
      try {
        await navigator.share({
          title: promo.title,
          text: promo.description || "",
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-80 animate-pulse bg-gray-200"></div>
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!promo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold">Promo Tidak Ditemukan</h1>
          <p className="mb-4 text-gray-500">
            Promo yang Anda cari tidak tersedia atau sudah berakhir
          </p>
          <Link
            href="/promo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Lihat Promo Lainnya
          </Link>
        </div>
      </div>
    );
  }

  const typeInfo = promoTypeInfo[promo.type] || {
    label: promo.type,
    icon: Tag,
    color: "bg-gray-500",
  };
  const TypeIcon = typeInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-80 bg-gradient-to-r from-primary to-primary/80 md:h-96">
        {promo.banner ? (
          <Image
            src={promo.banner}
            alt={promo.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70"></div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Back Button */}
        <div className="container relative mx-auto px-4 pt-6">
          <Link
            href="/promo"
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-white ${typeInfo.color}`}
                >
                  <TypeIcon className="h-4 w-4" />
                  {typeInfo.label}
                </span>
                <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                  {promo.title}
                </h1>
              </div>
              <div className="hidden text-right md:block">
                <div className="rounded-2xl bg-white px-6 py-4 shadow-xl">
                  <div className="text-sm text-gray-500">Diskon</div>
                  <div className="text-4xl font-black text-primary">
                    {promo.discountType === "PERCENTAGE"
                      ? `${promo.discountValue}%`
                      : formatCurrency(promo.discountValue)}
                  </div>
                  {promo.maxDiscount && (
                    <div className="text-xs text-gray-400">
                      Maks. {formatCurrency(promo.maxDiscount)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Mobile Discount Card */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white md:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Diskon</div>
                  <div className="text-3xl font-bold">
                    {promo.discountType === "PERCENTAGE"
                      ? `${promo.discountValue}%`
                      : formatCurrency(promo.discountValue)}
                  </div>
                </div>
                {promo.maxDiscount && (
                  <div className="text-right">
                    <div className="text-sm text-white/80">Maks. Potongan</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(promo.maxDiscount)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {promo.description && (
              <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Deskripsi Promo</h2>
                <p className="whitespace-pre-line text-gray-600">
                  {promo.description}
                </p>
              </div>
            )}

            {/* Content */}
            {promo.content && (
              <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Detail Promo</h2>
                <div
                  className="prose max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: promo.content }}
                />
              </div>
            )}

            {/* Applicable Packages */}
            {promo.packages && promo.packages.length > 0 && (
              <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">
                  Paket yang Berlaku
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {promo.packages.map((pkg) => (
                    <Link key={pkg.id} href={`/packages/${pkg.id}`}>
                      <div className="group flex gap-4 rounded-lg border p-4 transition-colors hover:border-primary">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {pkg.thumbnail ? (
                            <Image
                              src={pkg.thumbnail}
                              alt={pkg.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-primary/10">
                              <Tag className="h-8 w-8 text-primary/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 group-hover:text-primary">
                            {pkg.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {pkg.duration} Hari
                          </p>
                          <span className="text-xs text-primary">
                            {pkg.businessType}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            {promo.terms && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">
                  Syarat & Ketentuan
                </h2>
                <div className="space-y-2 text-sm text-gray-600">
                  {promo.terms.split("\n").map((term, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Promo Info Card */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold">Informasi Promo</h3>

                <div className="space-y-4">
                  {/* Period */}
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Periode Promo</div>
                      <div className="text-sm font-medium">
                        {formatDate(promo.startDate)} -{" "}
                        {formatDate(promo.endDate)}
                      </div>
                    </div>
                  </div>

                  {/* Days Left */}
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Sisa Waktu</div>
                      <div
                        className={`text-sm font-medium ${promo.daysLeft <= 7 ? "text-red-500" : ""}`}
                      >
                        {promo.daysLeft} hari lagi
                      </div>
                    </div>
                  </div>

                  {/* Quota */}
                  {promo.remainingQuota !== null && (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Kuota Tersisa
                        </div>
                        <div
                          className={`text-sm font-medium ${promo.remainingQuota < 10 ? "text-red-500" : ""}`}
                        >
                          {promo.remainingQuota} slot
                        </div>
                        {promo.quota && (
                          <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.max(5, (promo.remainingQuota / promo.quota) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Min Purchase */}
                  {promo.minPurchase && (
                    <div className="flex items-start gap-3">
                      <Percent className="mt-0.5 h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Min. Pembelian
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(promo.minPurchase)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-6 space-y-3">
                  <Link
                    href="/portal/packages"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary/90"
                  >
                    Gunakan Promo Ini
                    <ChevronRight className="h-4 w-4" />
                  </Link>

                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Share2 className="h-4 w-4" />
                      Bagikan
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Tersalin!" : "Salin Link"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              {promo.images && promo.images.length > 0 && (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold">Galeri</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {promo.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-lg"
                      >
                        <Image
                          src={img}
                          alt={`${promo.title} ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
