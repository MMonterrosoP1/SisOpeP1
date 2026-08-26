"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PatientsByWorkplace } from "../types";
import { useMemo } from "react";

interface PatientsByWorkplaceChartProps {
  data: PatientsByWorkplace[];
}

export function PatientsByWorkplaceChart({ data }: PatientsByWorkplaceChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Pacientes",
      },
    };
    
    data.forEach((item, index) => {
      config[`workplace_${index}`] = {
        label: item.workplaceName,
        color: item.fill,
      };
    });
    
    return config;
  }, [data]);

  const MIN_HEIGHT = 300;
  const ITEM_HEIGHT = 32;
  const computedHeight = Math.max(MIN_HEIGHT, data.length * ITEM_HEIGHT);

  return (
    <Card className="col-span-1 lg:col-span-1 h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle>Pacientes por lugar de trabajo</CardTitle>
        <CardDescription>
          Distribución de pacientes activos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6 min-h-0">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay pacientes con lugares de trabajo.
          </div>
        ) : (
          <ScrollArea className="h-[300px] w-full">
            <div style={{ height: computedHeight }} className="w-full pr-4 relative">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="workplaceName" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      width={100}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent hideLabel={false} labelKey="workplaceName" />} 
                      cursor={{fill: "hsl(var(--muted)/0.5)"}} 
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
