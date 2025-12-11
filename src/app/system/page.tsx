"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plane,
  Users,
  Shield,
  Hotel,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Zap,
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
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Menu,
  X,
  Quote,
  Building2,
  Layers,
  Tag,
  MessageCircle,
} from "lucide-react";

// System Features Data
const systemModules = [
  {
    id: "business",
    icon: Building2,
    title: "Manajemen Bisnis",
    description: "Kelola semua jenis perjalanan dalam satu platform",
    color: "from-blue-500 to-blue-600",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    features: [
      "Multi jenis perjalanan (Umrah, Haji, Outbound, Inbound, Domestic, MICE, Cruise)",
      "Manajemen paket dengan itinerary lengkap",
      "Penjadwalan keberangkatan otomatis",
      "Harga seasonal dan dynamic pricing",
      "Kuota management real-time",
    ],
  },
  {
    id: "operations",
    icon: Settings,
    title: "Operasional",
    description: "Otomatisasi seluruh proses operasional",
    color: "from-purple-500 to-purple-600",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    features: [
      "Manifest jamaah otomatis",
      "Rooming list & pembagian kamar",
      "Manajemen penerbangan & seat assignment",
      "Database hotel dengan rating",
      "Check-in/check-out tracking",
    ],
  },
  {
    id: "finance",
    icon: CreditCard,
    title: "Keuangan",
    description: "Sistem keuangan terintegrasi penuh",
    color: "from-green-500 to-green-600",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    features: [
      "Pembayaran DP, cicilan, pelunasan",
      "Verifikasi pembayaran otomatis",
      "Invoice & kwitansi auto-generate",
      "Laporan keuangan real-time",
      "Multi payment gateway ready",
    ],
  },
  {
    id: "crm",
    icon: Users,
    title: "CRM & Sales",
    description: "Kelola customer dari prospect hingga repeat",
    color: "from-orange-500 to-orange-600",
    image:
      "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80",
    features: [
      "Customer lifecycle management",
      "Riwayat perjalanan lengkap",
      "Sistem keagenan multi-tier",
      "Promo & voucher management",
      "Referral & loyalty program",
    ],
  },
  {
    id: "hr",
    icon: UserCog,
    title: "SDM & Inventory",
    description: "HRIS dan inventory dalam satu sistem",
    color: "from-pink-500 to-pink-600",
    image:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
    features: [
      "Data karyawan & tour leader",
      "Absensi & penggajian",
      "Inventory perlengkapan jamaah",
      "Distribusi barang per manifest",
      "Stock management & alerts",
    ],
  },
  {
    id: "tech",
    icon: Smartphone,
    title: "Teknologi",
    description: "Fitur teknologi terdepan",
    color: "from-cyan-500 to-cyan-600",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    features: [
      "IoT Tracking dengan Huawei Smartwatch",
      "GPS & health monitoring jamaah",
      "Customer portal lengkap",
      "E-Ticket & E-Voucher",
      "Real-time notifications",
    ],
  },
];

const testimonials = [
  {
    name: "H. Ahmad Fauzi",
    role: "Direktur",
    company: "Al-Madinah Tour",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    text: "Sejak menggunakan Travel ERP, operasional kami jadi 3x lebih efisien. Manifest dan rooming yang dulu butuh berjam-jam, sekarang selesai dalam hitungan menit.",
    rating: 5,
  },
  {
    name: "Hj. Siti Aminah",
    role: "Owner",
    company: "Safar Umrah",
    image:
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&q=80",
    text: "Fitur tracking jamaah dengan smartwatch sangat membantu. Keluarga jamaah bisa tenang karena bisa pantau lokasi dan kondisi kesehatan secara real-time.",
    rating: 5,
  },
  {
    name: "Ustadz Hasan",
    role: "Manager Operasional",
    company: "Baitul Maqdis Travel",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    text: "Customer portal memudahkan jamaah untuk booking, bayar, dan upload dokumen sendiri. Tim kami jadi bisa fokus pada pelayanan, bukan administrasi.",
    rating: 5,
  },
];

const stats = [
  { value: "500+", label: "Biro Travel Aktif" },
  { value: "50.000+", label: "Jamaah Terlayani" },
  { value: "99.9%", label: "Uptime Server" },
  { value: "24/7", label: "Support" },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Rp 500.000",
    period: "/bulan",
    description: "Untuk biro travel kecil yang baru memulai",
    features: [
      "Max 100 jamaah/bulan",
      "3 user account",
      "Modul booking & payment",
      "Customer portal basic",
      "Email support",
    ],
    cta: "Mulai Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "Rp 1.500.000",
    period: "/bulan",
    description: "Untuk biro travel yang sedang berkembang",
    features: [
      "Max 500 jamaah/bulan",
      "10 user account",
      "Semua modul aktif",
      "Customer portal lengkap",
      "IoT tracking basic",
      "Priority support",
    ],
    cta: "Mulai Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Untuk biro travel besar dengan kebutuhan khusus",
    features: [
      "Unlimited jamaah",
      "Unlimited user",
      "Semua modul + custom",
      "White-label solution",
      "IoT tracking advanced",
      "Dedicated support",
      "On-premise option",
    ],
    cta: "Hubungi Sales",
    popular: false,
  },
];

export default function SystemLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("business");

  const currentModule =
    systemModules.find((m) => m.id === activeModule) || systemModules[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
          <Link href="/system" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <LayoutDashboard className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">TravelERP</span>
              <p className="text-xs text-gray-500">
                Sistem Manajemen Travel #1
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Fitur
            </Link>
            <Link
              href="#modules"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Modul
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Testimoni
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Harga
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Coba Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-4">
            <Link href="#features" className="block text-gray-600 font-medium">
              Fitur
            </Link>
            <Link href="#modules" className="block text-gray-600 font-medium">
              Modul
            </Link>
            <Link
              href="#testimonials"
              className="block text-gray-600 font-medium"
            >
              Testimoni
            </Link>
            <Link href="#pricing" className="block text-gray-600 font-medium">
              Harga
            </Link>
            <div className="pt-4 border-t space-y-2">
              <Link
                href="/login"
                className="block text-center py-2 text-gray-600 font-medium"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="block text-center py-3 bg-indigo-600 text-white rounded-xl font-semibold"
              >
                Coba Gratis
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <div className="absolute inset-0 bg-gradient-to-l from-indigo-100/50 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-indigo-700 font-medium mb-6">
                <Zap className="h-4 w-4" />
                Sistem ERP Travel #1 di Indonesia
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Kelola Bisnis Travel Anda dengan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Lebih Efisien
                </span>
              </h1>

              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Sistem manajemen travel terlengkap untuk Umrah, Haji, dan
                wisata. Otomatisasi booking, keuangan, operasional, hingga
                tracking jamaah dalam satu platform terintegrasi.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-indigo-500/30 transition-all"
                >
                  Coba Gratis 14 Hari
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#demo"
                  className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <Play className="h-5 w-5 text-indigo-600" />
                  Lihat Demo
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex items-center gap-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-500"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Dipercaya 500+ biro travel
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                  alt="Dashboard Preview"
                  width={800}
                  height={500}
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-8 top-1/4 rounded-xl bg-white p-4 shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Hari Ini</p>
                    <p className="text-xl font-bold text-gray-900">+127</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 rounded-xl bg-white p-4 shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-xl font-bold text-gray-900">Rp 2.4M</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-indigo-600">
                  {stat.value}
                </p>
                <p className="mt-2 text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-indigo-600 font-semibold">Fitur Lengkap</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              Semua yang Anda Butuhkan untuk Mengelola Bisnis Travel
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Dari booking hingga tracking jamaah, semua dalam satu platform
              terintegrasi
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: "Manajemen Paket",
                desc: "Buat dan kelola paket perjalanan dengan itinerary, hotel, dan harga dinamis",
              },
              {
                icon: Calendar,
                title: "Penjadwalan",
                desc: "Atur jadwal keberangkatan dengan kuota dan status otomatis",
              },
              {
                icon: Users,
                title: "CRM Terintegrasi",
                desc: "Kelola data jamaah dari prospect hingga repeat customer",
              },
              {
                icon: CreditCard,
                title: "Keuangan",
                desc: "Pembayaran, invoice, dan laporan keuangan real-time",
              },
              {
                icon: FileText,
                title: "Manifest & Rooming",
                desc: "Generate manifest dan pembagian kamar otomatis",
              },
              {
                icon: Watch,
                title: "IoT Tracking",
                desc: "Pantau lokasi dan kesehatan jamaah dengan smartwatch",
              },
              {
                icon: Smartphone,
                title: "Customer Portal",
                desc: "Portal khusus jamaah untuk booking dan dokumen",
              },
              {
                icon: Handshake,
                title: "Manajemen Agent",
                desc: "Sistem keagenan dengan komisi dan tier",
              },
              {
                icon: BarChart3,
                title: "Reports & Analytics",
                desc: "Dashboard analitik untuk pengambilan keputusan",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-gray-100 bg-white p-8 hover:shadow-xl hover:border-indigo-200 transition-all"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modules Deep Dive */}
      <section id="modules" className="bg-gray-900 py-24 px-4 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-indigo-400 font-semibold">Modul Lengkap</span>
            <h2 className="mt-2 text-4xl font-bold">Eksplorasi Setiap Modul</h2>
            <p className="mt-4 text-lg text-gray-400">
              Klik untuk melihat detail fitur di setiap modul
            </p>
          </div>

          {/* Module Tabs */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {systemModules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 font-medium transition-all ${
                    activeModule === module.id
                      ? `bg-gradient-to-r ${module.color} text-white shadow-lg`
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {module.title}
                </button>
              );
            })}
          </div>

          {/* Module Content */}
          <div className="mt-12 grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src={currentModule.image}
                alt={currentModule.title}
                width={600}
                height={400}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-bold">{currentModule.title}</h3>
                <p className="text-gray-300 mt-1">
                  {currentModule.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {currentModule.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-white/5 p-4"
                >
                  <CheckCircle className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-indigo-600 font-semibold">Cara Kerja</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              Mulai dalam 3 Langkah Mudah
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Daftar & Setup",
                desc: "Buat akun dan setup profil biro travel Anda dalam 5 menit",
                image:
                  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80",
              },
              {
                step: "02",
                title: "Import Data",
                desc: "Import data paket, jamaah, dan transaksi dari sistem lama",
                image:
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
              },
              {
                step: "03",
                title: "Mulai Operasional",
                desc: "Sistem siap digunakan untuk operasional harian",
                image:
                  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="rounded-2xl overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-indigo-100">
                    {item.step}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gray-50 py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-indigo-600 font-semibold">Testimoni</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              Dipercaya Ratusan Biro Travel
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {testimonials.map((item, i) => (
              <div key={i} className="rounded-2xl bg-white p-8 shadow-lg">
                <Quote className="h-10 w-10 text-indigo-200" />
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {item.text}
                </p>
                <div className="mt-6 flex items-center gap-1">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.role}, {item.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-indigo-600 font-semibold">Harga</span>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              Pilih Paket yang Sesuai
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Semua paket termasuk trial gratis 14 hari
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium mb-4">
                    Paling Populer
                  </span>
                )}
                <h3
                  className={`text-xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}
                >
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span
                    className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={plan.popular ? "text-white/80" : "text-gray-500"}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`mt-2 ${plan.popular ? "text-white/80" : "text-gray-500"}`}
                >
                  {plan.description}
                </p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle
                        className={`h-5 w-5 ${plan.popular ? "text-white" : "text-indigo-600"}`}
                      />
                      <span
                        className={
                          plan.popular ? "text-white/90" : "text-gray-600"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 block w-full rounded-xl py-3 text-center font-semibold transition-all ${
                    plan.popular
                      ? "bg-white text-indigo-600 hover:bg-gray-100"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1600&q=80"
            alt="CTA Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 to-purple-900/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold">
            Siap Transformasi Bisnis Travel Anda?
          </h2>
          <p className="mt-6 text-xl text-white/80">
            Bergabung dengan 500+ biro travel yang sudah menggunakan TravelERP.
            Mulai trial gratis 14 hari sekarang, tanpa kartu kredit.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-xl hover:bg-gray-100 transition-all"
            >
              Coba Gratis Sekarang
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              Hubungi Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold">TravelERP</span>
              </div>
              <p className="mt-4 text-gray-400">
                Sistem manajemen travel terlengkap untuk biro perjalanan
                Indonesia.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Fitur
                  </Link>
                </li>
                <li>
                  <Link href="#modules" className="hover:text-white">
                    Modul
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    Harga
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Karir
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    SLA
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} TravelERP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
