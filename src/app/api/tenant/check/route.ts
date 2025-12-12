import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { isReservedSubdomain } from "@/lib/tenant/config";

// GET /api/tenant/check?subdomain=xxx - Check if subdomain is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get("subdomain");

    if (!subdomain) {
      return errorResponse("Subdomain is required", 400);
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain.toLowerCase())) {
      return successResponse({
        available: false,
        reason: "invalid_format",
        message: "Subdomain harus 3-63 karakter, hanya huruf kecil, angka, dan strip (-)",
      });
    }

    // Check if reserved
    if (isReservedSubdomain(subdomain)) {
      return successResponse({
        available: false,
        reason: "reserved",
        message: "Subdomain ini tidak tersedia karena sudah direservasi sistem",
      });
    }

    // Check if already exists
    const existing = await prisma.tenant.findFirst({
      where: { subdomain: subdomain.toLowerCase() },
    });

    if (existing) {
      return successResponse({
        available: false,
        reason: "taken",
        message: "Subdomain ini sudah digunakan",
      });
    }

    return successResponse({
      available: true,
      message: "Subdomain tersedia",
    });
  } catch (error) {
    console.error("Check subdomain error:", error);
    return errorResponse("Failed to check subdomain", 500);
  }
}
