"use client";

import { createContext, useContext, ReactNode } from "react";

export interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  domain?: string | null;
  logo?: string | null;
  businessTypes: string[];
  defaultCurrency: string;
  defaultLanguage: string;
  timezone: string;
  features?: Record<string, boolean>;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  terminology?: Record<string, string>;
  isActive: boolean;
}

interface TenantContextType {
  tenant: TenantData | null;
  isLoading: boolean;
  isSingleTenant: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  isSingleTenant: true,
});

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

interface TenantProviderProps {
  children: ReactNode;
  tenant: TenantData | null;
  isSingleTenant?: boolean;
}

export function TenantProvider({
  children,
  tenant,
  isSingleTenant = true,
}: TenantProviderProps) {
  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading: false,
        isSingleTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

// Hook to get tenant-specific terminology
export function useTerminology() {
  const { tenant } = useTenant();
  
  const t = (key: string, defaultValue: string): string => {
    if (tenant?.terminology && tenant.terminology[key]) {
      return tenant.terminology[key];
    }
    return defaultValue;
  };
  
  return { t };
}

// Hook to check tenant features
export function useTenantFeatures() {
  const { tenant } = useTenant();
  
  const hasFeature = (featureKey: string): boolean => {
    if (!tenant?.features) return true; // Default to enabled if not configured
    return tenant.features[featureKey] !== false;
  };
  
  return { hasFeature };
}

// Hook to get tenant theme
export function useTenantTheme() {
  const { tenant } = useTenant();
  
  return {
    primaryColor: tenant?.theme?.primaryColor || "#7c3aed",
    secondaryColor: tenant?.theme?.secondaryColor || "#4f46e5",
    accentColor: tenant?.theme?.accentColor || "#06b6d4",
  };
}
