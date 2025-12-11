import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/api/seed",
  "/api/settings/landing",
];

// Role-based path access (11 roles from requirements)
const rolePathAccess: Record<string, string[]> = {
  // Full access
  SUPER_ADMIN: ["/dashboard", "/api"],
  ADMIN: ["/dashboard", "/api"],

  // Department-specific
  FINANCE: [
    "/dashboard",
    "/dashboard/finance",
    "/dashboard/reports",
    "/api/payments",
    "/api/invoices",
    "/api/commissions",
  ],
  OPERASIONAL: [
    "/dashboard",
    "/dashboard/operations",
    "/dashboard/schedules",
    "/dashboard/tracking",
    "/api/manifests",
    "/api/schedules",
    "/api/tracking",
    "/api/rooming",
    "/api/flights",
  ],
  MARKETING: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/marketing",
    "/dashboard/reports",
    "/api/customers",
    "/api/vouchers",
    "/api/campaigns",
  ],
  HRD: [
    "/dashboard",
    "/dashboard/hris",
    "/api/employees",
    "/api/attendance",
    "/api/payroll",
  ],
  INVENTORY: [
    "/dashboard",
    "/dashboard/inventory",
    "/api/products",
    "/api/stock",
    "/api/warehouses",
  ],

  // Field roles
  TOUR_LEADER: [
    "/dashboard",
    "/dashboard/operations",
    "/dashboard/tracking",
    "/api/manifests",
    "/api/tracking",
    "/api/attendance",
  ],

  // External roles
  AGENT: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/bookings",
    "/dashboard/packages",
    "/dashboard/schedules",
    "/api/customers",
    "/api/bookings",
    "/api/packages",
    "/api/schedules",
  ],
  SALES: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/bookings",
    "/dashboard/packages",
    "/dashboard/schedules",
    "/dashboard/reports",
    "/api/customers",
    "/api/bookings",
    "/api/packages",
    "/api/schedules",
    "/api/payments",
  ],

  // Customer portal
  CUSTOMER: ["/portal", "/api/portal"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static files and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // files with extensions
  ) {
    return NextResponse.next();
  }

  // Get token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // No token - redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get user roles from token
  const userRoles = (token.roles as string[]) || [];

  // If no roles, deny access
  if (userRoles.length === 0) {
    return NextResponse.redirect(new URL("/login?error=no_role", request.url));
  }

  // SUPER_ADMIN and ADMIN have full access
  if (userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN")) {
    return NextResponse.next();
  }

  // Check if CUSTOMER trying to access dashboard
  if (userRoles.includes("CUSTOMER") && userRoles.length === 1) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // Check role-based access
  const hasAccess = userRoles.some((role) => {
    const allowedPaths = rolePathAccess[role] || [];
    return allowedPaths.some((allowedPath) => pathname.startsWith(allowedPath));
  });

  if (!hasAccess) {
    // Redirect to dashboard with error
    return NextResponse.redirect(
      new URL("/dashboard?error=unauthorized", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
