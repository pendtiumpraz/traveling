import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { getTenantById } from "@/lib/tenant/service";
import { getTenantStats } from "@/lib/tenant/api";

// GET /api/tenant/[id] - Get tenant details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { id: tenantId } = await params;

    // Check permissions
    const userRoles = session.user.roles || [];
    const isSuperAdmin = userRoles.includes("SUPER_ADMIN");
    const isOwnTenant = session.user.tenantId === tenantId;

    if (!isSuperAdmin && !isOwnTenant) {
      return errorResponse("Tidak memiliki akses ke tenant ini", 403);
    }

    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return errorResponse("Tenant tidak ditemukan", 404);
    }

    const stats = await getTenantStats(tenantId);

    // Get user count
    const userCount = await prisma.user.count({
      where: { tenantId, isDeleted: false },
    });

    return successResponse({
      tenant,
      stats: { ...stats, users: userCount },
    });
  } catch (error) {
    console.error("Get tenant error:", error);
    return errorResponse("Failed to get tenant", 500);
  }
}
