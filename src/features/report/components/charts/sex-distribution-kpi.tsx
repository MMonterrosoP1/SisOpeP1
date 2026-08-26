import { AttendedBySex } from "../../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SexDistributionKpiProps {
  data: AttendedBySex[];
}

export function SexDistributionKpi({ data }: SexDistributionKpiProps) {
  const { totalMale, totalFemale, total } = data.reduce(
    (acc, item) => ({
      totalMale: acc.totalMale + item.male,
      totalFemale: acc.totalFemale + item.female,
      total: acc.total + item.male + item.female,
    }),
    { totalMale: 0, totalFemale: 0, total: 0 }
  );

  const malePercentage = total > 0 ? Math.round((totalMale / total) * 100) : 0;
  const femalePercentage = total > 0 ? Math.round((totalFemale / total) * 100) : 0;

  return (
    <Card className="flex h-full flex-col overflow-hidden border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
          Distribución por Sexo
        </CardTitle>
        <CardDescription>Proporción global de pacientes atendidos</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        {total === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            No hay datos suficientes
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold tracking-tight text-[var(--color-chart-2)]">
                  {malePercentage}%
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
                  Masculino
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold tracking-tight text-[var(--color-chart-3)]">
                  {femalePercentage}%
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
                  Femenino
                </div>
              </div>
            </div>

            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
              {/* Progress Bar (Male) */}
              <div
                className="absolute inset-y-0 left-0 bg-[var(--color-chart-2)] transition-all duration-500 ease-in-out"
                style={{ width: `${malePercentage}%` }}
              />
              {/* Progress Bar (Female) */}
              <div
                className="absolute inset-y-0 right-0 bg-[var(--color-chart-3)] transition-all duration-500 ease-in-out"
                style={{ width: `${femalePercentage}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{totalMale} pacientes</span>
              <span>{totalFemale} pacientes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
