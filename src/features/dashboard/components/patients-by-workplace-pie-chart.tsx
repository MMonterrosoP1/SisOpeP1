"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PatientsByWorkplace } from "../types";
import { useMemo } from "react";

interface PatientsByWorkplacePieChartProps {
  data: PatientsByWorkplace[];
}

export function PatientsByWorkplacePieChart({ data }: PatientsByWorkplacePieChartProps) {
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

  return (
    <Card className="col-span-1 lg:col-span-1 h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Pacientes por lugar de trabajo</CardTitle>
        <CardDescription>
          Distribución de pacientes activos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No hay pacientes con lugares de trabajo.
          </div>
        ) : (
          <div className="h-[300px] w-full relative">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="workplaceName"
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={110}
                    labelLine={true}
                    label={({ value }) => value} // Show value outside the pie
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="square"
                    wrapperStyle={{ paddingTop: "20px" }}
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
