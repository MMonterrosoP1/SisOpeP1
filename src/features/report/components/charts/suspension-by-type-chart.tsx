"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { SuspensionSummary } from "../../types";
import { useMemo } from "react";

interface SuspensionByTypeChartProps {
  data: SuspensionSummary[];
}

export function SuspensionByTypeChart({ data }: SuspensionByTypeChartProps) {
  const chartConfig = useMemo(() => {
    return {
      count: {
        label: "Suspendidos",
        color: "var(--color-chart-5)",
      },
      totalHours: {
        label: "Total Horas",
        color: "var(--color-chart-1)",
      }
    } satisfies ChartConfig;
  }, []);

  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Suspensión por Origen</CardTitle>
        <CardDescription>Cantidad de pacientes suspendidos según tipo de enfermedad</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay suspensiones registradas
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
                    dataKey="diseaseType" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={30}
                  />
                  {/* Hide right Y-axis visually but keep it for scale separation if needed, 
                      though count and hours can vary wildly. 
                      We'll map both to left for simplicity unless scale is too different.
                      Actually, better just show Count visually or let recharts scale. */}
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar yAxisId="left" dataKey="count" name="Pacientes" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} maxBarSize={50}>
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
