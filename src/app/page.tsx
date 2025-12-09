import Link from "next/link";
import {
  Plane,
  Users,
  Calendar,
  Shield,
  Globe,
  Headphones,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Plane className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">TravelERP</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Complete Travel Agency
          <span className="block text-emerald-600">Management System</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Manage Umrah, Hajj, tours, and travel operations in one powerful
          platform. From booking to departure, we&apos;ve got you covered.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-emerald-600 px-8 py-3 text-lg font-medium text-white shadow-lg hover:bg-emerald-700"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Everything You Need to Run Your Travel Business
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            A comprehensive ERP solution designed specifically for travel
            agencies
          </p>

          <div className="mt-16 grid grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Customer Management",
                desc: "Track prospects, manage customer data, documents, and booking history.",
              },
              {
                icon: Calendar,
                title: "Booking & Scheduling",
                desc: "Create packages, manage schedules, and handle bookings with ease.",
              },
              {
                icon: Plane,
                title: "Operations",
                desc: "Manifests, rooming lists, flight management, and group coordination.",
              },
              {
                icon: Shield,
                title: "Finance & Payments",
                desc: "Invoicing, payment tracking, commissions, and financial reports.",
              },
              {
                icon: Globe,
                title: "Live Tracking",
                desc: "GPS tracking for groups, geofencing alerts, and real-time monitoring.",
              },
              {
                icon: Headphones,
                title: "Support System",
                desc: "Ticket management, customer inquiries, and communication tools.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <feature.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-emerald-600 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-4 gap-8 text-center text-white">
            {[
              { value: "500+", label: "Travel Agencies" },
              { value: "50K+", label: "Bookings Managed" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold">{stat.value}</p>
                <p className="mt-2 text-emerald-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Transform Your Travel Business?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join hundreds of travel agencies already using TravelERP
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-emerald-600 px-8 py-3 text-lg font-medium text-white shadow-lg hover:bg-emerald-700"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Plane className="h-5 w-5" />
              </div>
              <span className="font-bold text-gray-900">TravelERP</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} TravelERP. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
