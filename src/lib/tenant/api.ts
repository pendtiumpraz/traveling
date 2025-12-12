import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSingleTenantMode, getDefaultTenantId } from "./config";
import { errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { Session } from "next-auth";

// Types for tenant-aware API handlers
export interface TenantContext {
  tenantId: string;
  userId: string;
  userRoles: string[];
  isSuperAdmin: boolean;
}

export type TenantApiHandler = (
  request: NextRequest,
  context: TenantContext
) => Promise<NextResponse>;

// Get tenant ID from session or default
export async function getTenantIdFromSession(): Promise<string | null> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }
  
  // In single tenant mode, always use default
  if (isSingleTenantMode()) {
    return getDefaultTenantId();
  }
  
  // Use user's tenant ID
  return session.user.tenantId || getDefaultTenantId();
}

// Wrapper for tenant-aware API routes
export function withTenant(handler: TenantApiHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const session = await auth();
      
      if (!session?.user?.id) {
        return unauthorizedResponse();
      }
      
      const tenantId = isSingleTenantMode()
        ? getDefaultTenantId()
        : session.user.tenantId || getDefaultTenantId();
      
      const userRoles = session.user.roles || [];
      const isSuperAdmin = userRoles.includes("SUPER_ADMIN");
      
      const context: TenantContext = {
        tenantId,
        userId: session.user.id,
        userRoles,
        isSuperAdmin,
      };
      
      return handler(request, context);
    } catch (error) {
      console.error("Tenant API error:", error);
      return errorResponse("Internal server error", 500);
    }
  };
}

// Create tenant-aware Prisma filter
export function tenantFilter(tenantId: string, additionalFilters?: Record<string, unknown>) {
  return {
    tenantId,
    isDeleted: false,
    ...additionalFilters,
  };
}

// Create tenant-aware Prisma data (for creates)
export function tenantData<T extends Record<string, unknown>>(tenantId: string, data: T) {
  return {
    tenantId,
    ...data,
  };
}

// Verify user belongs to tenant
export async function verifyUserTenant(userId: string, tenantId: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId, isDeleted: false },
  });
  return !!user;
}

// Get all tenant IDs user has access to (for super admin cross-tenant access)
export async function getUserAccessibleTenants(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });
  
  if (!user) return [];
  
  // Check if user is platform super admin (null tenantId with SUPER_ADMIN role)
  const isPlatformAdmin = user.roles.some(
    (r) => r.role.name === "SUPER_ADMIN" && !r.role.tenantId
  );
  
  if (isPlatformAdmin) {
    // Platform admin can access all tenants
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true, isDeleted: false },
      select: { id: true },
    });
    return tenants.map((t) => t.id);
  }
  
  // Regular user can only access their tenant
  return user.tenantId ? [user.tenantId] : [];
}

// Helper to check if user can access a specific tenant
export async function canAccessTenant(userId: string, tenantId: string): Promise<boolean> {
  const accessibleTenants = await getUserAccessibleTenants(userId);
  return accessibleTenants.includes(tenantId);
}

// Stats for tenant (dashboard)
export async function getTenantStats(tenantId: string) {
  const filter = { tenantId, isDeleted: false };
  
  const [customers, bookings, revenue, employees, agents] = await Promise.all([
    prisma.customer.count({ where: filter }),
    prisma.booking.count({ where: filter }),
    prisma.payment.aggregate({
      where: { ...filter, status: "SUCCESS" },
      _sum: { amountInBase: true },
    }),
    prisma.employee.count({ where: filter }),
    prisma.agent.count({ where: filter }),
  ]);
  
  return {
    customers,
    bookings,
    revenue: revenue._sum.amountInBase || 0,
    employees,
    agents,
  };
}

// Helper to get tenant ID from session with fallback
export function getSessionTenantId(session: Session | null): string {
  if (!session?.user) {
    return getDefaultTenantId();
  }
  
  if (isSingleTenantMode()) {
    return getDefaultTenantId();
  }
  
  return session.user.tenantId || getDefaultTenantId();
}

// Helper to build tenant-aware where clause
export function buildTenantWhere(
  session: Session | null,
  additionalWhere?: Record<string, unknown>
): Record<string, unknown> {
  const tenantId = getSessionTenantId(session);
  
  return {
    tenantId,
    isDeleted: false,
    ...additionalWhere,
  };
}

// Helper to build tenant-aware create data
export function buildTenantCreate<T extends Record<string, unknown>>(
  session: Session | null,
  data: T
): T & { tenantId: string } {
  const tenantId = getSessionTenantId(session);
  
  return {
    ...data,
    tenantId,
  };
}
