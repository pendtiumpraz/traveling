import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { listTenants } from "@/lib/tenant/service";
import { getTenantStats } from "@/lib/tenant/api";
import { z } from "zod";

// GET /api/tenant - List all tenants (super admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    // Check if super admin
    const userRoles = session.user.roles || [];
    if (!userRoles.includes("SUPER_ADMIN")) {
      return errorResponse("Hanya Super Admin yang dapat mengakses daftar tenant", 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const isActive = searchParams.get("isActive") === "true" ? true : 
                     searchParams.get("isActive") === "false" ? false : undefined;

    const result = await listTenants({ page, limit, search, isActive });

    // Get stats for each tenant
    const tenantsWithStats = await Promise.all(
      result.tenants.map(async (tenant) => {
        const stats = await getTenantStats(tenant.id);
        return { ...tenant, stats };
      })
    );

    return successResponse({
      tenants: tenantsWithStats,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error) {
    console.error("List tenants error:", error);
    return errorResponse("Failed to list tenants", 500);
  }
}

const updateTenantSchema = z.object({
  name: z.string().min(3).optional(),
  logo: z.string().url().optional(),
  domain: z.string().optional(),
  businessTypes: z.array(z.string()).optional(),
  defaultCurrency: z.string().optional(),
  defaultLanguage: z.string().optional(),
  timezone: z.string().optional(),
  features: z.record(z.string(), z.boolean()).optional(),
  theme: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    accentColor: z.string().optional(),
  }).optional(),
  terminology: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/tenant - Update tenant (super admin or tenant admin)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { tenantId, ...updateData } = body;

    if (!tenantId) {
      return errorResponse("Tenant ID is required", 400);
    }

    // Check permissions
    const userRoles = session.user.roles || [];
    const isSuperAdmin = userRoles.includes("SUPER_ADMIN");
    const isOwnTenant = session.user.tenantId === tenantId;

    if (!isSuperAdmin && !isOwnTenant) {
      return errorResponse("Tidak memiliki akses untuk mengubah tenant ini", 403);
    }

    // Only super admin can change isActive status
    if (updateData.isActive !== undefined && !isSuperAdmin) {
      delete updateData.isActive;
    }

    const validation = updateTenantSchema.safeParse(updateData);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    // Build update data with proper types
    const updatePayload: Record<string, unknown> = {};
    if (validation.data.name) updatePayload.name = validation.data.name;
    if (validation.data.logo) updatePayload.logo = validation.data.logo;
    if (validation.data.domain !== undefined) updatePayload.domain = validation.data.domain;
    if (validation.data.businessTypes) updatePayload.businessTypes = validation.data.businessTypes;
    if (validation.data.defaultCurrency) updatePayload.defaultCurrency = validation.data.defaultCurrency;
    if (validation.data.defaultLanguage) updatePayload.defaultLanguage = validation.data.defaultLanguage;
    if (validation.data.timezone) updatePayload.timezone = validation.data.timezone;
    if (validation.data.features) updatePayload.features = validation.data.features;
    if (validation.data.theme) updatePayload.theme = validation.data.theme;
    if (validation.data.terminology) updatePayload.terminology = validation.data.terminology;
    if (validation.data.isActive !== undefined) updatePayload.isActive = validation.data.isActive;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updatePayload,
    });

    return successResponse({
      message: "Tenant berhasil diperbarui",
      tenant,
    });
  } catch (error) {
    console.error("Update tenant error:", error);
    return errorResponse("Failed to update tenant", 500);
  }
}

// DELETE /api/tenant - Soft delete tenant (super admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const userRoles = session.user.roles || [];
    if (!userRoles.includes("SUPER_ADMIN")) {
      return errorResponse("Hanya Super Admin yang dapat menghapus tenant", 403);
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("id");

    if (!tenantId) {
      return errorResponse("Tenant ID is required", 400);
    }

    // Soft delete
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { isDeleted: true, isActive: false },
    });

    return successResponse({ message: "Tenant berhasil dihapus" });
  } catch (error) {
    console.error("Delete tenant error:", error);
    return errorResponse("Failed to delete tenant", 500);
  }
}
