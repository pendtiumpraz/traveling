"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plane,
  Users,
  Shield,
  Hotel,
  HeartHandshake,
  MapPin,
  Star,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
  Play,
  Calendar,
  CheckCircle,
  ArrowRight,
  Tag,
  Zap,
  Clock,
  Percent,
  // System Features Icons
  LayoutDashboard,
  Package,
  CreditCard,
  FileText,
  Boxes,
  UserCog,
  Handshake,
  Watch,
  Globe,
  BarChart3,
  Smartphone,
  Settings,
  Lock,
  Layers,
  Building2,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Users,
  Hotel,
  Plane,
  HeartHandshake,
  MapPin,
};

interface LandingContent {
  hero: {
    title: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    image: string;
  };
  stats: Array<{ value: string; label: string }>;
  features: Array<{ icon: string; title: string; description: string }>;
  packages: {
    title: string;
    subtitle: string;
    items?: Array<{
      name: string;
      price: string;
      duration: string;
      hotel: string;
      airline: string;
      image: string;
    }>;
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: Array<{
      name: string;
      location: string;
      image: string;
      text: string;
      rating: number;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
    image: string;
  };
  gallery: string[];
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
  };
  footer: {
    copyright: string;
    tagline: string;
  };
}

export default function LandingPage() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/landing")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setContent(json.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
              href="#packages"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              Paket
            </Link>
            <Link
              href="/promo"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              Promo
            </Link>
            <Link
              href="#system-features"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              Fitur Sistem
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              Layanan
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              Testimoni
            </Link>
            <Link
              href="#contact"
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

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20">
        <div className="absolute inset-0">
          <Image
            src={content.hero.image}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-4">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-emerald-300 backdrop-blur">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Resmi Berizin Kemenag RI
              </span>
            </div>
            <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl">
              {content.hero.title}
            </h1>
            <p className="mt-6 text-xl text-gray-300 leading-relaxed">
              {content.hero.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="#packages"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-emerald-500/30 transition-all"
              >
                {content.hero.cta1}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={`https://wa.me/${content.contact.whatsapp}`}
                className="flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur hover:bg-white/20 transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                {content.hero.cta2}
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-14 w-8 rounded-full border-2 border-white/30 p-1.5">
            <div className="h-3 w-full rounded-full bg-white/50 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 -mt-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-2xl md:grid-cols-4 md:p-8">
            {content.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-emerald-600 md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-emerald-600 font-semibold">
              Mengapa Memilih Kami
            </span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              Layanan Terbaik untuk Anda
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Kami berkomitmen memberikan pengalaman ibadah yang nyaman dan
              berkesan
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.features.map((feature, i) => {
              const Icon = iconMap[feature.icon] || Shield;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* System Features Section */}
      <SystemFeaturesSection />

      {/* Packages Section */}
      <section id="packages" className="bg-gray-50 py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-emerald-600 font-semibold">Paket Umrah</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              {content.packages.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {content.packages.subtitle}
            </p>
          </div>
          {content.packages.items && content.packages.items.length > 0 && (
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {content.packages.items.map((pkg, i) => (
                <div
                  key={i}
                  className="group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-2xl font-bold text-white">
                        {pkg.price}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {pkg.name}
                    </h3>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hotel className="h-4 w-4 text-emerald-600" />
                        <span>{pkg.hotel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-emerald-600" />
                        <span>{pkg.airline}</span>
                      </div>
                    </div>
                    <Link
                      href={`https://wa.me/${content.contact.whatsapp}?text=Halo, saya tertarik dengan paket ${pkg.name}`}
                      className="mt-6 block w-full rounded-xl bg-emerald-600 py-3 text-center font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      Pesan Sekarang
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Section */}
      <PromoSection />

      {/* Gallery Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-emerald-600 font-semibold">Galeri</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              Dokumentasi Perjalanan
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {content.gallery.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-2xl"
              >
                <Image
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-emerald-600 font-semibold">Testimoni</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              {content.testimonials.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {content.testimonials.subtitle}
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {content.testimonials.items.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100"
              >
                <div className="flex gap-1">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0">
          <Image
            src={content.cta.image}
            alt="CTA"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-emerald-900/80" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            {content.cta.title}
          </h2>
          <p className="mt-6 text-xl text-emerald-100">
            {content.cta.subtitle}
          </p>
          <Link
            href="/register"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-lg font-bold text-emerald-600 shadow-xl hover:bg-emerald-50 transition-colors"
          >
            {content.cta.button}
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <span className="text-emerald-600 font-semibold">
                Hubungi Kami
              </span>
              <h2 className="mt-2 text-4xl font-bold text-gray-900">
                Ada Pertanyaan?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Tim kami siap membantu Anda 24/7
              </p>
              <div className="mt-8 space-y-6">
                <a
                  href={`tel:${content.contact.phone}`}
                  className="flex items-center gap-4 text-gray-600 hover:text-emerald-600"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-lg">{content.contact.phone}</span>
                </a>
                <a
                  href={`mailto:${content.contact.email}`}
                  className="flex items-center gap-4 text-gray-600 hover:text-emerald-600"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-lg">{content.contact.email}</span>
                </a>
                <a
                  href={`https://wa.me/${content.contact.whatsapp}`}
                  className="flex items-center gap-4 text-gray-600 hover:text-emerald-600"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <span className="text-lg">WhatsApp</span>
                </a>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900">Kirim Pesan</h3>
              <form className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="tel"
                  placeholder="No. WhatsApp"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <textarea
                  placeholder="Pesan Anda"
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 font-semibold text-white shadow-lg hover:shadow-emerald-500/30 transition-all"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <span className="font-bold text-white">TravelERP</span>
                <p className="text-xs text-gray-400">
                  {content.footer.tagline}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400">{content.footer.copyright}</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${content.contact.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}

// Promo Section Component
interface Promotion {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  thumbnail: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  daysLeft: number;
  isExpiringSoon: boolean;
  isFeatured: boolean;
}

function PromoSection() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promotions?public=true&home=true&limit=6")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPromos(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || promos.length === 0) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeBgColor = (type: string) => {
    const colors: Record<string, string> = {
      EARLY_BIRD: "from-blue-500 to-blue-600",
      LAST_MINUTE: "from-orange-500 to-orange-600",
      FLASH_SALE: "from-red-500 to-red-600",
      SEASONAL: "from-green-500 to-green-600",
      PACKAGE_DEAL: "from-purple-500 to-purple-600",
      GROUP_DISCOUNT: "from-indigo-500 to-indigo-600",
      REFERRAL: "from-pink-500 to-pink-600",
      LOYALTY: "from-yellow-500 to-yellow-600",
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-red-600 font-semibold">
            <Zap className="h-4 w-4" />
            Promo Spesial
          </span>
          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Penawaran Terbaik untuk Anda
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Hemat lebih banyak dengan promo menarik kami
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <Link key={promo.id} href={`/promo/${promo.slug}`}>
              <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all h-full">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-100">
                  {promo.thumbnail ? (
                    <Image
                      src={promo.thumbnail}
                      alt={promo.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className={`flex h-full items-center justify-center bg-gradient-to-br ${getTypeBgColor(promo.type)}`}
                    >
                      <Percent className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Discount Badge */}
                  <div className="absolute right-4 top-4">
                    <span className="rounded-lg bg-red-500 px-3 py-2 text-lg font-bold text-white shadow-lg">
                      {promo.discountType === "PERCENTAGE"
                        ? `${promo.discountValue}%`
                        : formatCurrency(promo.discountValue)}
                    </span>
                  </div>

                  {/* Expiring Badge */}
                  {promo.isExpiringSoon && (
                    <div className="absolute left-4 top-4">
                      <span className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white">
                        <Zap className="h-3 w-3" />
                        Segera Berakhir
                      </span>
                    </div>
                  )}

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white line-clamp-2">
                      {promo.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {promo.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {promo.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {promo.daysLeft} hari lagi
                    </span>
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

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/promo"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            <Tag className="h-5 w-5" />
            Lihat Semua Promo
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// System Features Data
const systemFeatures = [
  {
    category: "Manajemen Bisnis",
    icon: Building2,
    color: "from-blue-500 to-blue-600",
    features: [
      {
        icon: Layers,
        title: "Multi Jenis Perjalanan",
        description:
          "Support Umrah, Haji, Outbound, Inbound, Domestic, MICE, dan Cruise dalam satu sistem terpadu.",
      },
      {
        icon: Package,
        title: "Manajemen Paket",
        description:
          "Kelola paket perjalanan lengkap dengan itinerary, hotel, maskapai, dan harga seasonal.",
      },
      {
        icon: Calendar,
        title: "Penjadwalan Keberangkatan",
        description:
          "Atur jadwal keberangkatan dengan kuota, harga, dan status otomatis.",
      },
    ],
  },
  {
    category: "Operasional",
    icon: Settings,
    color: "from-purple-500 to-purple-600",
    features: [
      {
        icon: FileText,
        title: "Manifest & Rooming",
        description:
          "Kelola data jamaah, pembagian kamar, dan manifest keberangkatan secara otomatis.",
      },
      {
        icon: Plane,
        title: "Manajemen Penerbangan",
        description:
          "Atur jadwal penerbangan, seat assignment, dan integrasi dengan maskapai.",
      },
      {
        icon: Hotel,
        title: "Manajemen Hotel",
        description:
          "Database hotel dengan rating, tipe kamar, dan jarak ke Masjidil Haram/Nabawi.",
      },
    ],
  },
  {
    category: "Keuangan",
    icon: CreditCard,
    color: "from-green-500 to-green-600",
    features: [
      {
        icon: CreditCard,
        title: "Pembayaran & Cicilan",
        description:
          "Terima pembayaran DP, cicilan, dan pelunasan dengan verifikasi otomatis.",
      },
      {
        icon: FileText,
        title: "Invoice Otomatis",
        description:
          "Generate invoice dan kwitansi secara otomatis dengan nomor urut.",
      },
      {
        icon: BarChart3,
        title: "Laporan Keuangan",
        description:
          "Dashboard revenue, profit, dan outstanding payment real-time.",
      },
    ],
  },
  {
    category: "Customer & Sales",
    icon: Users,
    color: "from-orange-500 to-orange-600",
    features: [
      {
        icon: Users,
        title: "CRM Terintegrasi",
        description:
          "Kelola data customer dari prospect hingga repeat customer dengan riwayat lengkap.",
      },
      {
        icon: Handshake,
        title: "Manajemen Agent",
        description:
          "Sistem keagenan dengan tier (Bronze-Platinum), komisi, dan subdomain khusus.",
      },
      {
        icon: Tag,
        title: "Promo & Voucher",
        description:
          "Buat berbagai jenis promo: Early Bird, Flash Sale, Group Discount, Referral.",
      },
    ],
  },
  {
    category: "SDM & Inventory",
    icon: UserCog,
    color: "from-pink-500 to-pink-600",
    features: [
      {
        icon: UserCog,
        title: "HRIS Karyawan",
        description:
          "Kelola data karyawan, tour leader, absensi, cuti, dan penggajian.",
      },
      {
        icon: Boxes,
        title: "Inventory Management",
        description:
          "Stok perlengkapan jamaah, gudang, dan distribusi per manifest.",
      },
      {
        icon: FileText,
        title: "Dokumen Digital",
        description:
          "Upload dan verifikasi dokumen jamaah (paspor, KTP, foto) terintegrasi Google Drive.",
      },
    ],
  },
  {
    category: "Teknologi",
    icon: Smartphone,
    color: "from-cyan-500 to-cyan-600",
    features: [
      {
        icon: Watch,
        title: "IoT Tracking",
        description:
          "Integrasi Huawei Smartwatch untuk tracking lokasi GPS dan health monitoring jamaah.",
      },
      {
        icon: Smartphone,
        title: "Customer Portal",
        description:
          "Portal khusus jamaah untuk booking, pembayaran, dokumen, e-ticket, dan tracking.",
      },
      {
        icon: Globe,
        title: "Multi-tenant & Multi-bahasa",
        description:
          "Arsitektur multi-tenant dengan dukungan multi-bahasa dan multi-currency.",
      },
    ],
  },
];

const systemHighlights = [
  { value: "7+", label: "Jenis Perjalanan" },
  { value: "15+", label: "Modul Terintegrasi" },
  { value: "80+", label: "Fitur Lengkap" },
  { value: "11", label: "Role Pengguna" },
];

function SystemFeaturesSection() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section
      id="system-features"
      className="bg-gradient-to-b from-gray-900 to-gray-800 py-24 px-4 text-white"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-emerald-400 font-semibold">
            <LayoutDashboard className="h-4 w-4" />
            Sistem ERP Travel Terlengkap
          </span>
          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Semua yang Anda Butuhkan dalam{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Satu Platform
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Sistem manajemen travel terlengkap untuk Umrah, Haji, dan berbagai
            jenis perjalanan wisata. Dirancang khusus untuk kebutuhan biro
            perjalanan Indonesia.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {systemHighlights.map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/5 backdrop-blur p-6 text-center border border-white/10"
            >
              <p className="text-4xl font-bold text-emerald-400">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {systemFeatures.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`flex items-center gap-2 rounded-full px-5 py-3 font-medium transition-all ${
                  activeCategory === i
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.category}
              </button>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {systemFeatures[activeCategory].features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-8 hover:bg-white/10 transition-all"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${systemFeatures[activeCategory].color} text-white shadow-lg`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* All Features List */}
        <div className="mt-16 rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Fitur Unggulan Lainnya
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              "Dashboard Analytics Real-time",
              "11 Role Pengguna (Admin, Finance, Operasional, dll)",
              "Soft Delete & Audit Trail",
              "Google OAuth & Credentials Login",
              "Google Drive Integration",
              "Huawei Health Kit API",
              "E-Ticket & E-Voucher",
              "Trip Itinerary Day-by-Day",
              "Live GPS Tracking",
              "Health Monitoring Jamaah",
              "Support Ticket System",
              "Landing Page CMS",
              "SEO Optimized",
              "Responsive Design",
              "Dark Mode Ready",
              "API-First Architecture",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Tech Stack */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 p-8">
            <Lock className="h-12 w-12 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Keamanan Terjamin</h3>
            <p className="text-gray-400">
              Dibangun dengan NextAuth v5, enkripsi data, role-based access
              control, dan audit trail untuk menjaga keamanan data bisnis dan
              jamaah Anda.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-8">
            <Layers className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Teknologi Modern</h3>
            <p className="text-gray-400">
              Next.js 15, TypeScript, Prisma ORM, PostgreSQL, Tailwind CSS 4,
              dan React Query untuk performa optimal dan kemudahan pengembangan.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-emerald-500/30 transition-all"
          >
            Mulai Gunakan Sekarang
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-gray-500">
            Gratis trial 14 hari, tanpa kartu kredit
          </p>
        </div>
      </div>
    </section>
  );
}
