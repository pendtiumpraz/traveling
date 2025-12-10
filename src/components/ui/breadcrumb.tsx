import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({
  items,
  showHome = true,
  className,
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: "Home", href: "/dashboard" }, ...items]
    : items;

  return (
    <nav className={cn("flex items-center text-sm", className)}>
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isFirst = index === 0 && showHome;

        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            )}
            {isLast ? (
              <span className="font-medium text-gray-900">{item.label}</span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                {isFirst && <Home className="h-4 w-4" />}
                {!isFirst && item.label}
              </Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
