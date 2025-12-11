"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  Calendar,
  ShoppingCart,
  CreditCard,
  FileText,
  Ticket,
  MapPin,
  Headphones,
  User,
  Upload,
} from "lucide-react";

const menuItems = [
  { href: "/portal", label: "Beranda", icon: Home },
  { href: "/portal/packages", label: "Paket Perjalanan", icon: Package },
  { href: "/portal/schedules", label: "Jadwal Keberangkatan", icon: Calendar },
  { href: "/portal/booking", label: "Booking Baru", icon: ShoppingCart },
  { href: "/portal/my-bookings", label: "Booking Saya", icon: FileText },
  { href: "/portal/payments", label: "Riwayat Pembayaran", icon: CreditCard },
  { href: "/portal/documents", label: "Dokumen Saya", icon: Upload },
  { href: "/portal/e-tickets", label: "E-Ticket & Voucher", icon: Ticket },
  { href: "/portal/itinerary", label: "Jadwal Perjalanan", icon: Calendar },
  { href: "/portal/tracking", label: "Live Tracking", icon: MapPin },
  { href: "/portal/support", label: "Bantuan", icon: Headphones },
  { href: "/portal/profile", label: "Profil Saya", icon: User },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-64px)] w-64 border-r border-gray-200 bg-white lg:block">
      <nav className="h-full overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
