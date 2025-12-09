"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/theme-store";
import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  CreditCard,
  Plane,
  Building2,
  UserCog,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Megaphone,
  Boxes,
  Headphones,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Packages",
    href: "/dashboard/packages",
    icon: Package,
  },
  {
    title: "Schedules",
    href: "/dashboard/schedules",
    icon: Calendar,
  },
  {
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: CreditCard,
  },
  {
    title: "Operations",
    href: "/dashboard/operations",
    icon: Plane,
    children: [
      { title: "Manifests", href: "/dashboard/operations/manifests" },
      { title: "Rooming", href: "/dashboard/operations/rooming" },
      { title: "Flights", href: "/dashboard/operations/flights" },
    ],
  },
  {
    title: "Tracking",
    href: "/dashboard/tracking",
    icon: MapPin,
  },
  {
    title: "Finance",
    href: "/dashboard/finance",
    icon: CreditCard,
    children: [
      { title: "Payments", href: "/dashboard/finance/payments" },
      { title: "Invoices", href: "/dashboard/finance/invoices" },
      { title: "Commissions", href: "/dashboard/finance/commissions" },
    ],
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing",
    icon: Megaphone,
  },
  {
    title: "Agents",
    href: "/dashboard/agents",
    icon: Building2,
  },
  {
    title: "HRIS",
    href: "/dashboard/hris",
    icon: UserCog,
  },
  {
    title: "Support",
    href: "/dashboard/support",
    icon: Headphones,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { config, toggleSidebar } = useThemeStore();
  const collapsed = config.sidebarCollapsed;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Plane className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-gray-900">Travel</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100",
            collapsed && "mx-auto",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100vh-64px)] overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    collapsed && "justify-center px-2",
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive && "text-primary",
                    )}
                  />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
