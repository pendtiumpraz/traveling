"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void | Promise<void>;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!options) return;
    setIsLoading(true);
    try {
      await options.onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
      setOptions(null);
    }
  };

  const variantStyles = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      button: "destructive" as const,
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      button: "default" as const,
    },
    default: {
      icon: AlertTriangle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      button: "default" as const,
    },
  };

  const variant = options?.variant || "default";
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in zoom-in-95">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                  styles.iconBg,
                )}
              >
                <Icon className={cn("h-6 w-6", styles.iconColor)} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {options?.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{options?.message}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isLoading}
              >
                {options?.cancelText || "Cancel"}
              </Button>
              <Button
                variant={styles.button}
                onClick={handleConfirm}
                isLoading={isLoading}
              >
                {options?.confirmText || "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
