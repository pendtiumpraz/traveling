"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: "w-[400px]",
  md: "w-[500px]",
  lg: "w-[600px]",
  xl: "w-[800px]",
  full: "w-full max-w-[90vw]",
};

export function SidebarModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
}: SidebarModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeOnEscape, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={closeOnOverlayClick ? onClose : undefined}
            />
          )}

          <motion.div
            ref={modalRef}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 z-50 h-full bg-white shadow-2xl",
              "flex flex-col",
              "border-l border-gray-200",
              sizeClasses[size],
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-gray-200 px-6 py-4">{footer}</div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
