"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AttendedByWorkplace } from "../../types";
import { useMemo } from "react";

interface AttendedByWorkplaceChartProps {
  data: AttendedByWorkplace[];
}

export function AttendedByWorkplaceChart({ data }: AttendedByWorkplaceChartProps) {
  const chartConfig = useMemo(() => {
    return {
      count: {
        label: "Atendidos",
        color: "var(--color-chart-1)",
      },
    } satisfies ChartConfig;
  }, []);

  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Personal Atendido por Lugar de Trabajo</CardTitle>
        <CardDescription>Total de pacientes atendidos</CardDescription>
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
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="workplaceName" 
                    type="category" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} barSize={30}>
                    <LabelList dataKey="count" position="right" className="fill-foreground text-xs font-bold" />
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
