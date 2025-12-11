/**
 * Role-Based Access Control Configuration
 * Defines what each role can see and do
 */

// Menu items configuration
export const MENU_ITEMS = {
  dashboard: {
    path: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
  },
  customers: {
    path: "/dashboard/customers",
    label: "Customers",
    icon: "Users",
  },
  packages: { path: "/dashboard/packages", label: "Packages", icon: "Package" },
  schedules: {
    path: "/dashboard/schedules",
    label: "Schedules",
    icon: "Calendar",
  },
  bookings: {
    path: "/dashboard/bookings",
    label: "Bookings",
    icon: "FileText",
  },
  operations: {
    path: "/dashboard/operations",
    label: "Operations",
    icon: "Settings2",
  },
  finance: { path: "/dashboard/finance", label: "Finance", icon: "DollarSign" },
  inventory: { path: "/dashboard/inventory", label: "Inventory", icon: "Box" },
  marketing: {
    path: "/dashboard/marketing",
    label: "Marketing",
    icon: "Megaphone",
  },
  agents: { path: "/dashboard/agents", label: "Agents", icon: "UserCheck" },
  hris: { path: "/dashboard/hris", label: "HRIS", icon: "Users2" },
  support: { path: "/dashboard/support", label: "Support", icon: "Headphones" },
  tracking: { path: "/dashboard/tracking", label: "Tracking", icon: "MapPin" },
  reports: { path: "/dashboard/reports", label: "Reports", icon: "BarChart3" },
  settings: {
    path: "/dashboard/settings",
    label: "Settings",
    icon: "Settings",
  },
} as const;

// Role-based menu access
export const ROLE_MENUS: Record<string, string[]> = {
  SUPER_ADMIN: [
    "dashboard",
    "customers",
    "packages",
    "schedules",
    "bookings",
    "operations",
    "finance",
    "inventory",
    "marketing",
    "agents",
    "hris",
    "support",
    "tracking",
    "reports",
    "settings",
  ],
  ADMIN: [
    "dashboard",
    "customers",
    "packages",
    "schedules",
    "bookings",
    "operations",
    "finance",
    "inventory",
    "marketing",
    "agents",
    "hris",
    "support",
    "tracking",
    "reports",
    "settings",
  ],
  MANAGER: [
    "dashboard",
    "customers",
    "packages",
    "schedules",
    "bookings",
    "operations",
    "finance",
    "reports",
  ],
  STAFF: ["dashboard", "customers", "bookings", "operations"],
  TOUR_LEADER: ["dashboard", "operations", "tracking"],
  AGENT: ["dashboard", "customers", "bookings"],
  CUSTOMER: [
    // Customer has separate portal, not dashboard
  ],
};

// API permissions per role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "dashboard:*",
    "customer:*",
    "package:*",
    "schedule:*",
    "booking:*",
    "payment:*",
    "invoice:*",
    "manifest:*",
    "employee:*",
    "agent:*",
    "voucher:*",
    "product:*",
    "report:*",
    "setting:*",
  ],
  MANAGER: [
    "dashboard:view",
    "customer:*",
    "package:read",
    "schedule:*",
    "booking:*",
    "payment:*",
    "invoice:read",
    "manifest:*",
    "report:view",
  ],
  STAFF: [
    "dashboard:view",
    "customer:read",
    "customer:create",
    "customer:update",
    "booking:read",
    "booking:create",
    "booking:update",
    "payment:read",
    "payment:create",
    "manifest:read",
  ],
  TOUR_LEADER: [
    "dashboard:view",
    "manifest:read",
    "customer:read",
    "tracking:*",
    "attendance:*",
  ],
  AGENT: [
    "dashboard:view",
    "customer:create",
    "customer:read:own",
    "customer:update:own",
    "booking:create",
    "booking:read:own",
    "commission:read:own",
  ],
  CUSTOMER: [
    "profile:read",
    "profile:update",
    "booking:read:own",
    "payment:read:own",
  ],
};

/**
 * Check if user has permission
 */
export function hasPermission(
  userRoles: string[],
  permission: string,
): boolean {
  for (const role of userRoles) {
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Super admin has all permissions
    if (permissions.includes("*")) return true;

    // Check exact permission
    if (permissions.includes(permission)) return true;

    // Check wildcard (e.g., customer:* matches customer:read)
    const [resource, action] = permission.split(":");
    if (permissions.includes(`${resource}:*`)) return true;

    // Check if has any permission for resource
    if (action === "*" && permissions.some((p) => p.startsWith(`${resource}:`)))
      return true;
  }

  return false;
}

/**
 * Get allowed menu items for user roles
 */
export function getAllowedMenus(userRoles: string[]): string[] {
  const allowedMenus = new Set<string>();

  for (const role of userRoles) {
    const menus = ROLE_MENUS[role] || [];
    menus.forEach((menu) => allowedMenus.add(menu));
  }

  return Array.from(allowedMenus);
}

/**
 * Check if user can access a specific path
 */
export function canAccessPath(userRoles: string[], path: string): boolean {
  // Always allow these paths
  const publicPaths = ["/login", "/register", "/", "/api/auth"];
  if (publicPaths.some((p) => path.startsWith(p))) return true;

  // Customer role redirects to customer portal (not dashboard)
  if (userRoles.includes("CUSTOMER") && userRoles.length === 1) {
    return path.startsWith("/portal") || path.startsWith("/api/portal");
  }

  // Get allowed menus
  const allowedMenus = getAllowedMenus(userRoles);

  // Check if path matches any allowed menu
  for (const menuKey of allowedMenus) {
    const menu = MENU_ITEMS[menuKey as keyof typeof MENU_ITEMS];
    if (menu && path.startsWith(menu.path)) return true;
  }

  // Dashboard root is always allowed for non-customer roles
  if (path === "/dashboard" && !userRoles.includes("CUSTOMER")) return true;

  return false;
}

/**
 * Get redirect path based on role
 */
export function getDefaultRedirect(userRoles: string[]): string {
  if (userRoles.includes("CUSTOMER") && userRoles.length === 1) {
    return "/portal"; // Customer portal
  }
  return "/dashboard";
}
