import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "outline";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  destructive: "bg-red-50 text-red-700 border-red-200",
  outline: "bg-transparent text-gray-700 border-gray-300",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  default: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

export function Badge({
  variant = "default",
  size = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
