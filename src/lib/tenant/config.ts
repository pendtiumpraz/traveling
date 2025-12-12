// Multi-Tenant Configuration
export type TenantMode = "single" | "multi";

export interface TenantConfig {
  mode: TenantMode;
  defaultTenantId: string;
  baseDomain: string;
  registrationEnabled: boolean;
}

export const tenantConfig: TenantConfig = {
  mode: (process.env.TENANT_MODE as TenantMode) || "single",
  defaultTenantId: process.env.DEFAULT_TENANT_ID || "default",
  baseDomain: process.env.TENANT_BASE_DOMAIN || "localhost:3000",
  registrationEnabled: process.env.TENANT_REGISTRATION_ENABLED === "true",
};

export function isSingleTenantMode(): boolean {
  return tenantConfig.mode === "single";
}

export function isMultiTenantMode(): boolean {
  return tenantConfig.mode === "multi";
}

export function getDefaultTenantId(): string {
  return tenantConfig.defaultTenantId;
}

// Extract subdomain from hostname
export function extractSubdomain(hostname: string): string | null {
  const baseDomain = tenantConfig.baseDomain;
  
  // Remove port if present
  const hostWithoutPort = hostname.split(":")[0];
  const baseWithoutPort = baseDomain.split(":")[0];
  
  // localhost handling
  if (hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1") {
    return null;
  }
  
  // Check if hostname ends with base domain
  if (!hostWithoutPort.endsWith(baseWithoutPort)) {
    return null;
  }
  
  // Extract subdomain
  const subdomain = hostWithoutPort.slice(0, -(baseWithoutPort.length + 1));
  
  // Ignore www
  if (subdomain === "www" || subdomain === "") {
    return null;
  }
  
  return subdomain;
}

// Reserved subdomains that cannot be used by tenants
export const RESERVED_SUBDOMAINS = [
  "www",
  "api",
  "app",
  "admin",
  "dashboard",
  "portal",
  "mail",
  "email",
  "smtp",
  "ftp",
  "ssh",
  "cdn",
  "static",
  "assets",
  "images",
  "img",
  "media",
  "files",
  "docs",
  "help",
  "support",
  "status",
  "blog",
  "news",
  "dev",
  "staging",
  "test",
  "demo",
  "sandbox",
];

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}
