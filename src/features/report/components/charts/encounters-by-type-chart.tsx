"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { EncountersByType } from "../../types";
import { useMemo } from "react";

interface EncountersByTypeChartProps {
  data: EncountersByType[];
}

export function EncountersByTypeChart({ data }: EncountersByTypeChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Consultas",
      },
    };
    
    data.forEach((item, index) => {
      config[`type_${index}`] = {
        label: item.encounterTypeName,
        color: `var(--color-chart-${(index % 5) + 1})`,
      };
    });
    
    return config;
  }, [data]);

  const pieData = data.map((item, index) => ({
    ...item,
    fill: `var(--color-chart-${(index % 5) + 1})`
  }));

  return (
    <Card className="col-span-1 border-0 shadow-none sm:border sm:shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Consultas por Tipo</CardTitle>
        <CardDescription>Distribución de atenciones</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay consultas registradas
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="encounterTypeName"
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
