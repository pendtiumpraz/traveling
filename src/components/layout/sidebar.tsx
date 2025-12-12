"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Sparkles,
  HelpCircle,
} from "lucide-react";

// Role-based menu visibility (11 roles from requirements)
const ROLE_MENUS: Record<string, string[]> = {
  // Full access
  SUPER_ADMIN: [
    "dashboard",
    "customers",
    "packages",
    "schedules",
    "bookings",
    "operations",
    "tracking",
    "finance",
    "inventory",
    "marketing",
    "agents",
    "hris",
    "support",
    "reports",
    "ai-assistant",
    "settings",
    "guide",
  ],
  ADMIN: [
    "dashboard",
    "customers",
    "packages",
    "schedules",
    "bookings",
    "operations",
    "tracking",
    "finance",
    "inventory",
    "marketing",
    "agents",
    "hris",
    "support",
    "reports",
    "ai-assistant",
    "settings",
    "guide",
  ],

  // Department-specific
  FINANCE: ["dashboard", "finance", "reports", "ai-assistant", "guide"],
  OPERASIONAL: [
    "dashboard",
    "operations",
    "schedules",
    "tracking",
    "ai-assistant",
    "guide",
  ],
  MARKETING: ["dashboard", "customers", "marketing", "reports", "ai-assistant", "guide"],
  HRD: ["dashboard", "hris", "ai-assistant", "guide"],
  INVENTORY: ["dashboard", "inventory", "ai-assistant", "guide"],

  // Field roles
  TOUR_LEADER: ["dashboard", "operations", "tracking", "guide"],

  // External roles
  AGENT: ["dashboard", "customers", "bookings", "packages", "schedules", "guide"],
  SALES: [
    "dashboard",
    "customers",
    "bookings",
    "packages",
    "schedules",
    "reports",
    "ai-assistant",
    "guide",
  ],

  // Customer uses portal, not dashboard (no AI access)
  CUSTOMER: [],
};

const menuItems = [
  {
    key: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "customers",
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    key: "packages",
    title: "Packages",
    href: "/dashboard/packages",
    icon: Package,
  },
  {
    key: "schedules",
    title: "Schedules",
    href: "/dashboard/schedules",
    icon: Calendar,
  },
  {
    key: "bookings",
    title: "Bookings",
    href: "/dashboard/bookings",
    icon: CreditCard,
  },
  {
    key: "operations",
    title: "Operations",
    href: "/dashboard/operations",
    icon: Plane,
  },
  {
    key: "tracking",
    title: "Tracking",
    href: "/dashboard/tracking",
    icon: MapPin,
  },
  {
    key: "finance",
    title: "Finance",
    href: "/dashboard/finance",
    icon: CreditCard,
  },
  {
    key: "inventory",
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    key: "marketing",
    title: "Marketing",
    href: "/dashboard/marketing",
    icon: Megaphone,
  },
  {
    key: "agents",
    title: "Agents",
    href: "/dashboard/agents",
    icon: Building2,
  },
  { key: "hris", title: "HRIS", href: "/dashboard/hris", icon: UserCog },
  {
    key: "support",
    title: "Support",
    href: "/dashboard/support",
    icon: Headphones,
  },
  {
    key: "reports",
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    key: "ai-assistant",
    title: "AI Assistant",
    href: "/dashboard/ai-assistant",
    icon: Sparkles,
  },
  {
    key: "settings",
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    key: "guide",
    title: "User Guide",
    href: "/dashboard/guide",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { config, toggleSidebar } = useThemeStore();
  const collapsed = config.sidebarCollapsed;

  // Get user roles from session
  const userRoles = (session?.user as { roles?: string[] })?.roles || [];

  // Get allowed menus based on roles
  const allowedMenuKeys = new Set<string>();
  userRoles.forEach((role) => {
    const menus = ROLE_MENUS[role] || [];
    menus.forEach((menu) => allowedMenuKeys.add(menu));
  });

  // Filter menu items based on allowed menus
  const filteredMenuItems = menuItems.filter((item) =>
    allowedMenuKeys.has(item.key),
  );

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
          {filteredMenuItems.map((item) => {
            // Fix: Dashboard should only be active on exact match
            // Other menus should be active on exact match OR when path starts with their href
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");
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
