import { ReactNode } from "react";
import { FileX, Search, Inbox, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type EmptyVariant = "default" | "search" | "error" | "inbox";

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variants = {
  default: {
    icon: FileX,
    title: "No data found",
    description: "There is no data to display at the moment.",
  },
  search: {
    icon: Search,
    title: "No results found",
    description:
      "Try adjusting your search or filter to find what you're looking for.",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description:
      "We encountered an error while loading the data. Please try again.",
  },
  inbox: {
    icon: Inbox,
    title: "Your inbox is empty",
    description: "You're all caught up! Check back later for new items.",
  },
};

export function EmptyState({
  variant = "default",
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        {icon || <Icon className="h-8 w-8 text-gray-400" />}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {title || config.title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        {description || config.description}
      </p>
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
