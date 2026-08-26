"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AttendedByAgeGroup } from "../../types";
import { useMemo } from "react";

interface AgeGroupChartProps {
  data: AttendedByAgeGroup[];
}

export function AgeGroupChart({ data }: AgeGroupChartProps) {
  const chartConfig = useMemo(() => {
    return {
      count: {
        label: "Atendidos",
        color: "var(--color-chart-4)",
      },
    } satisfies ChartConfig;
  }, []);

  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Grupos de Edad</CardTitle>
        <CardDescription>Distribución etaria de pacientes</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay datos suficientes
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                  <XAxis 
                    dataKey="ageGroup" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    hide
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    <LabelList dataKey="count" position="top" className="fill-foreground text-xs font-bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
