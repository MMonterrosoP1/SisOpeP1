import { Card, CardContent } from "@/components/ui/card";
import { MetricWithChange } from "../types";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardMetricCardProps {
  title: string;
  metric: MetricWithChange;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  isCurrency?: boolean;
}

export function DashboardMetricCard({ 
  title, 
  metric, 
  icon, 
  iconBgColor = "bg-primary/10", 
  iconColor = "text-primary",
  isCurrency = false
}: DashboardMetricCardProps) {
  const isPositive = metric.percentageChange >= 0;
  const isZero = metric.percentageChange === 0;

  return (
    <Card>
      <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm tracking-tight text-foreground">{title}</h3>
          <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", iconBgColor, iconColor)}>
            {icon}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold">
            {isCurrency ? "$" : ""}{metric.current.toLocaleString()}
          </div>
          
          <div className="flex items-center gap-1 text-xs">
            <span className={cn(
              "font-medium",
              isPositive && !isZero ? "text-green-600 dark:text-green-400" : "",
              !isPositive ? "text-red-600 dark:text-red-400" : "",
              isZero ? "text-muted-foreground" : ""
            )}>
              {isPositive && !isZero ? "+" : ""}{metric.percentageChange}%
            </span>
            <span className="text-muted-foreground">desde el mes pasado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
