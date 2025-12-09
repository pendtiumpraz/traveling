"use client";

import { useThemeStore } from "@/stores/theme-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { config } = useThemeStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          config.sidebarCollapsed ? "pl-[72px]" : "pl-64",
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
