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
  packages: { title: string; subtitle: string };
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

      {/* Gallery Section */}
      <section className="bg-gray-50 py-24 px-4">
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
