import { auth } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// GET /api/debug/session - Check current session status
export async function GET(request: NextRequest) {
  try {
    // Check auth session
    const session = await auth();
    
    // Check JWT token directly
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    return Response.json({
      hasSession: !!session,
      hasToken: !!token,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      token: token ? {
        sub: token.sub,
        email: token.email,
        name: token.name,
        roles: token.roles,
      } : null,
      env: {
        AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
        AUTH_SECRET_LENGTH: process.env.AUTH_SECRET?.length || 0,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not set",
        AUTH_URL: process.env.AUTH_URL || "not set",
      },
      cookies: {
        hasSessionToken: !!request.cookies.get("authjs.session-token") || !!request.cookies.get("__Secure-authjs.session-token"),
      }
    });
  } catch (error) {
    return Response.json({
      error: "Failed to check session",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
