import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { tenantConfig, isReservedSubdomain } from "@/lib/tenant/config";
import { createTenant, isSubdomainAvailable } from "@/lib/tenant/service";
import { z } from "zod";

const registerSchema = z.object({
  // Tenant info
  tenantName: z.string().min(3, "Nama perusahaan minimal 3 karakter"),
  subdomain: z.string()
    .min(3, "Subdomain minimal 3 karakter")
    .max(63, "Subdomain maksimal 63 karakter")
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Subdomain hanya boleh huruf kecil, angka, dan strip"),
  businessTypes: z.array(z.string()).optional(),
  
  // Admin user info
  adminName: z.string().min(2, "Nama admin minimal 2 karakter"),
  adminEmail: z.string().email("Email tidak valid"),
  adminPassword: z.string().min(8, "Password minimal 8 karakter"),
});

// POST /api/tenant/register - Register new tenant
export async function POST(request: NextRequest) {
  try {
    // Check if registration is enabled
    if (!tenantConfig.registrationEnabled) {
      return errorResponse("Pendaftaran tenant baru tidak diaktifkan", 403);
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message, 400);
    }

    const data = validation.data;
    const subdomain = data.subdomain.toLowerCase();

    // Check reserved
    if (isReservedSubdomain(subdomain)) {
      return errorResponse("Subdomain ini tidak tersedia", 400);
    }

    // Check availability
    const available = await isSubdomainAvailable(subdomain);
    if (!available) {
      return errorResponse("Subdomain sudah digunakan", 400);
    }

    // Create tenant
    const result = await createTenant({
      name: data.tenantName,
      subdomain,
      businessTypes: data.businessTypes,
      adminEmail: data.adminEmail,
      adminPassword: data.adminPassword,
      adminName: data.adminName,
    });

    return successResponse({
      message: "Tenant berhasil dibuat",
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
      },
      adminUserId: result.adminUserId,
      loginUrl: tenantConfig.mode === "multi" 
        ? `https://${subdomain}.${tenantConfig.baseDomain}/login`
        : "/login",
    });
  } catch (error) {
    console.error("Register tenant error:", error);
    return errorResponse("Gagal membuat tenant", 500);
  }
}
