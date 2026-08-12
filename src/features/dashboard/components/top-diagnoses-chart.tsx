"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TopDiagnosis } from "../types";
import { Badge } from "@/components/ui/badge";
import { Info, ArrowUpRight } from "lucide-react";

interface TopDiagnosesChartProps {
  data: TopDiagnosis[];
}

export function TopDiagnosesChart({ data }: TopDiagnosesChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  const colors = [
    "bg-[var(--color-chart-1)]",
    "bg-[var(--color-chart-2)]",
    "bg-[var(--color-chart-3)]",
    "bg-[var(--color-chart-4)]",
    "bg-[var(--color-chart-5)]",
  ];

  return (
    <Card className="col-span-1 lg:col-span-1 border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle>Top Diagnósticos</CardTitle>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
          Ver Detalles
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
            No hay diagnósticos registrados.
          </div>
        ) : (
          <div className="flex flex-col gap-6 mt-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">{totalCount}</span>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12%
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="flex h-3 w-full rounded-full overflow-hidden">
              {data.map((item, index) => (
                <div 
                  key={item.icd10Code} 
                  className={colors[index % colors.length]}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.description}: ${item.percentage.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* List */}
            <div className="space-y-4">
              {data.map((item, index) => (
                <div key={item.icd10Code} className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${colors[index % colors.length]}`} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium line-clamp-1" title={item.description}>
                        {item.description}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.count} Casos
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {item.percentage.toFixed(0)}%
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
