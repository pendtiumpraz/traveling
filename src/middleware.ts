import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Multi-tenant configuration
const TENANT_MODE = process.env.TENANT_MODE || "single";
const TENANT_BASE_DOMAIN = process.env.TENANT_BASE_DOMAIN || "localhost:3000";
const RESERVED_SUBDOMAINS = ["www", "api", "app", "admin", "dashboard", "portal", "mail", "cdn", "static", "docs", "help", "support", "status", "blog", "dev", "staging", "test"];

// Extract subdomain from hostname
function extractSubdomain(hostname: string): string | null {
  const hostWithoutPort = hostname.split(":")[0];
  const baseWithoutPort = TENANT_BASE_DOMAIN.split(":")[0];
  
  if (hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1") {
    return null;
  }
  
  if (!hostWithoutPort.endsWith(baseWithoutPort)) {
    return null;
  }
  
  const subdomain = hostWithoutPort.slice(0, -(baseWithoutPort.length + 1));
  
  if (subdomain === "www" || subdomain === "" || RESERVED_SUBDOMAINS.includes(subdomain)) {
    return null;
  }
  
  return subdomain;
}

// Paths that don't require authentication (exact match)
const publicPathsExact = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
];

// Paths that don't require authentication (prefix match)
const publicPathsPrefix = [
  "/api/auth",
  "/api/seed",
  "/api/debug",
  "/api/settings/landing",
  "/api/tenant/check",
  "/api/tenant/register",
  "/packages",
  "/schedules",
  "/promo",
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
  const hostname = request.headers.get("host") || "";
  
  // Extract tenant subdomain in multi-tenant mode
  const subdomain = TENANT_MODE === "multi" ? extractSubdomain(hostname) : null;
  
  // Create response with tenant headers
  const createResponse = (response: NextResponse) => {
    if (subdomain) {
      response.headers.set("x-tenant-subdomain", subdomain);
    }
    response.headers.set("x-tenant-mode", TENANT_MODE);
    return response;
  };

  // Allow public paths (exact match)
  if (publicPathsExact.includes(pathname)) {
    return createResponse(NextResponse.next());
  }

  // Allow public paths (prefix match)
  if (publicPathsPrefix.some((path) => pathname.startsWith(path))) {
    return createResponse(NextResponse.next());
  }

  // Allow static files and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // files with extensions
  ) {
    return createResponse(NextResponse.next());
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

  // Multi-tenant mode: verify user belongs to tenant
  if (TENANT_MODE === "multi" && subdomain) {
    const tokenTenantSubdomain = token.tenantSubdomain as string | undefined;
    // If user's tenant doesn't match subdomain, redirect to their tenant or login
    if (tokenTenantSubdomain && tokenTenantSubdomain !== subdomain) {
      // User is trying to access different tenant - redirect to their tenant
      const userTenantUrl = new URL(request.url);
      userTenantUrl.hostname = `${tokenTenantSubdomain}.${TENANT_BASE_DOMAIN.split(":")[0]}`;
      return NextResponse.redirect(userTenantUrl);
    }
  }

  // Get user roles from token
  const userRoles = (token.roles as string[]) || [];

  // If no roles, deny access
  if (userRoles.length === 0) {
    return NextResponse.redirect(new URL("/login?error=no_role", request.url));
  }

  // SUPER_ADMIN and ADMIN have full access
  if (userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN")) {
    return createResponse(NextResponse.next());
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

  return createResponse(NextResponse.next());
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
