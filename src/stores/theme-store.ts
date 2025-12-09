import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemePreset =
  | "emerald"
  | "blue"
  | "purple"
  | "orange"
  | "rose"
  | "custom";

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
}

export interface ThemeConfig {
  preset: ThemePreset;
  mode: "light" | "dark" | "system";
  colors: ThemeColors;
  radius: number;
  sidebarCollapsed: boolean;
}

const presets: Record<ThemePreset, Partial<ThemeColors>> = {
  emerald: {
    primary: "#10b981",
    secondary: "#064e3b",
    accent: "#34d399",
  },
  blue: {
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#60a5fa",
  },
  purple: {
    primary: "#8b5cf6",
    secondary: "#5b21b6",
    accent: "#a78bfa",
  },
  orange: {
    primary: "#f97316",
    secondary: "#c2410c",
    accent: "#fb923c",
  },
  rose: {
    primary: "#f43f5e",
    secondary: "#be123c",
    accent: "#fb7185",
  },
  custom: {},
};

const defaultColors: ThemeColors = {
  primary: "#10b981",
  primaryForeground: "#ffffff",
  secondary: "#064e3b",
  secondaryForeground: "#ffffff",
  accent: "#34d399",
  accentForeground: "#064e3b",
  background: "#ffffff",
  foreground: "#0f172a",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  card: "#ffffff",
  cardForeground: "#0f172a",
  border: "#e2e8f0",
  ring: "#10b981",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  success: "#22c55e",
  successForeground: "#ffffff",
  warning: "#f59e0b",
  warningForeground: "#ffffff",
};

interface ThemeState {
  config: ThemeConfig;
  setPreset: (preset: ThemePreset) => void;
  setMode: (mode: "light" | "dark" | "system") => void;
  setColor: (key: keyof ThemeColors, value: string) => void;
  setRadius: (radius: number) => void;
  toggleSidebar: () => void;
  resetToDefault: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      config: {
        preset: "emerald",
        mode: "light",
        colors: defaultColors,
        radius: 8,
        sidebarCollapsed: false,
      },
      setPreset: (preset) =>
        set((state) => ({
          config: {
            ...state.config,
            preset,
            colors: {
              ...state.config.colors,
              ...presets[preset],
            },
          },
        })),
      setMode: (mode) =>
        set((state) => ({
          config: { ...state.config, mode },
        })),
      setColor: (key, value) =>
        set((state) => ({
          config: {
            ...state.config,
            preset: "custom",
            colors: { ...state.config.colors, [key]: value },
          },
        })),
      setRadius: (radius) =>
        set((state) => ({
          config: { ...state.config, radius },
        })),
      toggleSidebar: () =>
        set((state) => ({
          config: {
            ...state.config,
            sidebarCollapsed: !state.config.sidebarCollapsed,
          },
        })),
      resetToDefault: () =>
        set({
          config: {
            preset: "emerald",
            mode: "light",
            colors: defaultColors,
            radius: 8,
            sidebarCollapsed: false,
          },
        }),
    }),
    {
      name: "theme-storage",
    },
  ),
);
