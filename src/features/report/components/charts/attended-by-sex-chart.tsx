"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AttendedBySex } from "../../types";
import { useMemo } from "react";

interface AttendedBySexChartProps {
  data: AttendedBySex[];
}

export function AttendedBySexChart({ data }: AttendedBySexChartProps) {
  const chartConfig = useMemo(() => {
    return {
      male: {
        label: "Masculino",
        color: "var(--color-chart-2)",
      },
      female: {
        label: "Femenino",
        color: "var(--color-chart-3)",
      }
    } satisfies ChartConfig;
  }, []);

  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Personal Atendido por Sexo</CardTitle>
        <CardDescription>Distribución por lugar de trabajo</CardDescription>
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
                    dataKey="workplaceName" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="male" name="Masculino" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="female" name="Femenino" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
