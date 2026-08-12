"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { EncountersByTypeChartData } from "../types";
import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EncountersByTypeAreaChartProps {
  data: EncountersByTypeChartData[];
  types: string[];
}

export function EncountersByTypeAreaChart({ data, types }: EncountersByTypeAreaChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    const colors = [
      "var(--color-chart-1)",
      "var(--color-chart-2)",
      "var(--color-chart-3)",
      "var(--color-chart-4)",
      "var(--color-chart-5)",
    ];
    
    types.forEach((type, index) => {
      config[type] = {
        label: type,
        color: colors[index % colors.length],
      };
    });
    return config;
  }, [types]);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Consultas por tipo</CardTitle>
          <CardDescription>Evolución de los últimos 6 meses</CardDescription>
        </div>
        <Select defaultValue="6m">
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6m">6 Meses</SelectItem>
            <SelectItem value="1y">1 Año</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No hay datos suficientes
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    {types.map((type, index) => (
                      <linearGradient key={`color-${index}`} id={`fill${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={`var(--color-${type})`} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={`var(--color-${type})`} stopOpacity={0.1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    // Format tick to just show abbreviated month
                    tickFormatter={(value) => value.split(' ')[0]} 
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {types.map((type, index) => (
                    <Area
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stackId="1" // Stacked areas
                      stroke={`var(--color-${type})`}
                      fill={`url(#fill${index})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
