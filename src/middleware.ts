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

// Role-based path access
const rolePathAccess: Record<string, string[]> = {
  SUPER_ADMIN: ["/dashboard", "/api"],
  ADMIN: ["/dashboard", "/api"],
  MANAGER: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/packages",
    "/dashboard/schedules",
    "/dashboard/bookings",
    "/dashboard/operations",
    "/dashboard/finance",
    "/dashboard/reports",
    "/api/customers",
    "/api/packages",
    "/api/schedules",
    "/api/bookings",
    "/api/payments",
    "/api/manifests",
  ],
  STAFF: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/bookings",
    "/dashboard/operations",
    "/api/customers",
    "/api/bookings",
    "/api/payments",
    "/api/manifests",
  ],
  TOUR_LEADER: [
    "/dashboard",
    "/dashboard/operations",
    "/dashboard/tracking",
    "/api/manifests",
    "/api/tracking",
  ],
  AGENT: [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/bookings",
    "/api/customers",
    "/api/bookings",
  ],
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
