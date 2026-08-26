"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DiseasePrevalence } from "../../types";
import { useMemo } from "react";

interface DiseasePrevalenceChartProps {
  title: string;
  description: string;
  data: DiseasePrevalence[];
  colorVar?: string;
}

export function DiseasePrevalenceChart({ 
  title, 
  description, 
  data, 
  colorVar = "var(--color-chart-5)" 
}: DiseasePrevalenceChartProps) {
  
  const chartConfig = useMemo(() => {
    return {
      count: {
        label: "Casos",
        color: colorVar,
      },
    } satisfies ChartConfig;
  }, [colorVar]);

  // Tomamos solo el top 10 para no saturar la gráfica si hay muchos datos
  const displayData = data.slice(0, 10);

  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {displayData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay diagnósticos registrados
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.4} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="description" 
                    type="category" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    width={150}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill={colorVar} radius={[0, 4, 4, 0]} barSize={25}>
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
