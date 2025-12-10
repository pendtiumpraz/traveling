"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const tabStyles = {
    default: {
      container: "border-b",
      tab: "border-b-2 border-transparent px-4 py-2.5 -mb-px",
      active: "border-primary text-primary",
      inactive: "text-gray-500 hover:text-gray-700 hover:border-gray-300",
    },
    pills: {
      container: "bg-gray-100 p-1 rounded-lg",
      tab: "px-4 py-2 rounded-md",
      active: "bg-white text-gray-900 shadow-sm",
      inactive: "text-gray-600 hover:text-gray-900",
    },
    underline: {
      container: "",
      tab: "px-4 py-2 border-b-2 border-transparent",
      active: "border-primary text-primary font-medium",
      inactive: "text-gray-500 hover:text-gray-700",
    },
  };

  const styles = tabStyles[variant];

  return (
    <div className={className}>
      <div className={cn("flex", styles.container)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium transition-colors",
              styles.tab,
              activeTab === tab.id ? styles.active : styles.inactive,
              tab.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-1 rounded-full px-2 py-0.5 text-xs",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-200 text-gray-600",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">{activeContent}</div>
    </div>
  );
}

interface TabListProps {
  children: ReactNode;
  variant?: "default" | "pills" | "underline";
  className?: string;
}

export function TabList({
  children,
  variant = "default",
  className,
}: TabListProps) {
  const containerStyles = {
    default: "border-b",
    pills: "bg-gray-100 p-1 rounded-lg inline-flex",
    underline: "",
  };

  return (
    <div className={cn("flex", containerStyles[variant], className)}>
      {children}
    </div>
  );
}
