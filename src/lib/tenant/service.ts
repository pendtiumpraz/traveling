import { prisma } from "@/lib/prisma";
import { tenantConfig, isSingleTenantMode, extractSubdomain } from "./config";
import type { TenantData } from "./context";
import type { BusinessType } from "@prisma/client";

// Get tenant by ID
export async function getTenantById(tenantId: string): Promise<TenantData | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId, isActive: true, isDeleted: false },
  });
  
  if (!tenant) return null;
  
  return mapTenantToData(tenant);
}

// Get tenant by subdomain
export async function getTenantBySubdomain(subdomain: string): Promise<TenantData | null> {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain, isActive: true, isDeleted: false },
  });
  
  if (!tenant) return null;
  
  return mapTenantToData(tenant);
}

// Get tenant by custom domain
export async function getTenantByDomain(domain: string): Promise<TenantData | null> {
  const tenant = await prisma.tenant.findFirst({
    where: { domain, isActive: true, isDeleted: false },
  });
  
  if (!tenant) return null;
  
  return mapTenantToData(tenant);
}

// Resolve tenant from request hostname
export async function resolveTenant(hostname: string): Promise<TenantData | null> {
  // Single tenant mode - always return default tenant
  if (isSingleTenantMode()) {
    return getTenantById(tenantConfig.defaultTenantId);
  }
  
  // Multi-tenant mode
  // First, check for custom domain
  const tenantByDomain = await getTenantByDomain(hostname);
  if (tenantByDomain) return tenantByDomain;
  
  // Then, check for subdomain
  const subdomain = extractSubdomain(hostname);
  if (subdomain) {
    return getTenantBySubdomain(subdomain);
  }
  
  // Fallback to default tenant for base domain
  return getTenantById(tenantConfig.defaultTenantId);
}

// Get or create default tenant
export async function getOrCreateDefaultTenant(): Promise<TenantData> {
  let tenant = await prisma.tenant.findUnique({
    where: { id: tenantConfig.defaultTenantId },
  });
  
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        id: tenantConfig.defaultTenantId,
        name: "Default Travel Agency",
        subdomain: "default",
        businessTypes: ["UMROH", "HAJI"] as BusinessType[],
        defaultCurrency: "IDR",
        defaultLanguage: "id",
        timezone: "Asia/Jakarta",
        isActive: true,
      },
    });
  }
  
  return mapTenantToData(tenant);
}

// Create new tenant
export async function createTenant(data: {
  name: string;
  subdomain: string;
  domain?: string;
  businessTypes?: string[];
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}): Promise<{ tenant: TenantData; adminUserId: string }> {
  const bcrypt = await import("bcryptjs");
  
  // Create tenant
  const businessTypes = (data.businessTypes || ["UMROH"]) as BusinessType[];
  const tenant = await prisma.tenant.create({
    data: {
      name: data.name,
      subdomain: data.subdomain.toLowerCase(),
      domain: data.domain,
      businessTypes,
      defaultCurrency: "IDR",
      defaultLanguage: "id",
      timezone: "Asia/Jakarta",
      isActive: true,
    },
  });
  
  // Create roles for tenant
  const roleNames = [
    { name: "SUPER_ADMIN", displayName: { id: "Super Admin", en: "Super Admin" } },
    { name: "ADMIN", displayName: { id: "Admin", en: "Admin" } },
    { name: "FINANCE", displayName: { id: "Keuangan", en: "Finance" } },
    { name: "OPERASIONAL", displayName: { id: "Operasional", en: "Operations" } },
    { name: "MARKETING", displayName: { id: "Marketing", en: "Marketing" } },
    { name: "HRD", displayName: { id: "HRD", en: "HR" } },
    { name: "INVENTORY", displayName: { id: "Inventory", en: "Inventory" } },
    { name: "TOUR_LEADER", displayName: { id: "Tour Leader", en: "Tour Leader" } },
    { name: "AGENT", displayName: { id: "Agen", en: "Agent" } },
    { name: "SALES", displayName: { id: "Sales", en: "Sales" } },
    { name: "CUSTOMER", displayName: { id: "Customer", en: "Customer" } },
  ];
  
  const createdRoles: Record<string, string> = {};
  for (const role of roleNames) {
    const created = await prisma.role.create({
      data: {
        tenantId: tenant.id,
        name: role.name,
        displayName: role.displayName,
        permissions: role.name === "SUPER_ADMIN" ? ["*"] : [],
      },
    });
    createdRoles[role.name] = created.id;
  }
  
  // Create admin user
  const hashedPassword = await bcrypt.hash(data.adminPassword, 12);
  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: data.adminEmail,
      password: hashedPassword,
      name: data.adminName,
      provider: "credentials",
      isActive: true,
    },
  });
  
  // Assign SUPER_ADMIN role
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: createdRoles["SUPER_ADMIN"],
    },
  });
  
  // Create employee record
  await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      nip: "ADM-001",
      name: data.adminName,
      email: data.adminEmail,
      position: "Administrator",
      department: "Management",
      status: "ACTIVE",
      joinDate: new Date(),
      baseSalary: 0,
      userId: adminUser.id,
    },
  });
  
  return {
    tenant: mapTenantToData(tenant),
    adminUserId: adminUser.id,
  };
}

// Update tenant
export async function updateTenant(
  tenantId: string,
  data: Partial<{
    name: string;
    logo: string;
    domain: string;
    businessTypes: string[];
    defaultCurrency: string;
    defaultLanguage: string;
    timezone: string;
    features: Record<string, boolean>;
    theme: Record<string, string>;
    terminology: Record<string, string>;
  }>
): Promise<TenantData | null> {
  // Build update payload with proper types
  const updateData: Record<string, unknown> = {};
  if (data.name) updateData.name = data.name;
  if (data.logo) updateData.logo = data.logo;
  if (data.domain !== undefined) updateData.domain = data.domain;
  if (data.businessTypes) updateData.businessTypes = data.businessTypes as BusinessType[];
  if (data.defaultCurrency) updateData.defaultCurrency = data.defaultCurrency;
  if (data.defaultLanguage) updateData.defaultLanguage = data.defaultLanguage;
  if (data.timezone) updateData.timezone = data.timezone;
  if (data.features) updateData.features = data.features;
  if (data.theme) updateData.theme = data.theme;
  if (data.terminology) updateData.terminology = data.terminology;

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: updateData,
  });
  
  return mapTenantToData(tenant);
}

// Check if subdomain is available
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const { isReservedSubdomain } = await import("./config");
  
  if (isReservedSubdomain(subdomain)) {
    return false;
  }
  
  const existing = await prisma.tenant.findFirst({
    where: { subdomain: subdomain.toLowerCase() },
  });
  
  return !existing;
}

// List all tenants (for super admin)
export async function listTenants(options?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}): Promise<{ tenants: TenantData[]; total: number }> {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;
  
  const where: Record<string, unknown> = { isDeleted: false };
  
  if (options?.isActive !== undefined) {
    where.isActive = options.isActive;
  }
  
  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { subdomain: { contains: options.search, mode: "insensitive" } },
    ];
  }
  
  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.count({ where }),
  ]);
  
  return {
    tenants: tenants.map(mapTenantToData),
    total,
  };
}

// Helper to map Prisma tenant to TenantData
function mapTenantToData(tenant: {
  id: string;
  name: string;
  subdomain: string;
  domain: string | null;
  logo: string | null;
  businessTypes: string[];
  defaultCurrency: string;
  defaultLanguage: string;
  timezone: string;
  features: unknown;
  theme: unknown;
  terminology: unknown;
  isActive: boolean;
}): TenantData {
  return {
    id: tenant.id,
    name: tenant.name,
    subdomain: tenant.subdomain,
    domain: tenant.domain,
    logo: tenant.logo,
    businessTypes: tenant.businessTypes,
    defaultCurrency: tenant.defaultCurrency,
    defaultLanguage: tenant.defaultLanguage,
    timezone: tenant.timezone,
    features: tenant.features as Record<string, boolean> | undefined,
    theme: tenant.theme as TenantData["theme"],
    terminology: tenant.terminology as Record<string, string> | undefined,
    isActive: tenant.isActive,
  };
}
