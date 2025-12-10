import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    label?: string;
  };
  trend?: "up" | "down" | "neutral";
  className?: string;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  icon,
  change,
  trend,
  className,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-gray-600";
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {TrendIcon && <TrendIcon className={cn("h-4 w-4", trendColor)} />}
              <span className={cn("text-sm font-medium", trendColor)}>
                {change.value > 0 ? "+" : ""}
                {change.value}%
              </span>
              {change.label && (
                <span className="text-sm text-gray-500">{change.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconBg,
            )}
          >
            <div className={iconColor}>{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface StatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
}

export function StatGrid({ children, columns = 4 }: StatGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
  };

  return <div className={cn("grid gap-4", gridCols[columns])}>{children}</div>;
}
