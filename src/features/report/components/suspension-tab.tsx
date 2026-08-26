import { SuspensionReport } from "../types";
import { SuspensionByTypeChart } from "./charts/suspension-by-type-chart";
import { TopDiagnosesTable } from "./tables/top-diagnoses-table";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface SuspensionTabProps {
  data: SuspensionReport;
  isAnnual: boolean;
}

export function SuspensionTab({ data, isAnnual }: SuspensionTabProps) {
  // Convert hours to standard 8-hour work days
  const daysLost = (data.totalSuspensionHours / 8).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group relative overflow-hidden col-span-1 border shadow-sm bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900 transition-all hover:shadow-md">
          {/* Background subtle icon */}
          <div className="pointer-events-none absolute -right-4 -top-4 size-40 opacity-[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.05] text-blue-600 dark:text-blue-400">
            <Clock className="size-full" />
          </div>
          
          <CardContent className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 shadow-sm border border-white/20 dark:border-white/10">
              <Clock className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Horas Totales Perdidas</h3>
            <div className="text-5xl font-bold tracking-tight text-blue-700 dark:text-blue-300">
              {data.totalSuspensionHours}
            </div>
            <p className="text-sm text-muted-foreground mt-3 font-medium flex items-center gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-blue-500"></span>
              Aprox. {daysLost} días laborales
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <SuspensionByTypeChart data={data.suspensionsByDiseaseType} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopDiagnosesTable 
          data={data.topDiagnosesWithSuspension} 
          title="Top Diagnósticos con Suspensión"
          description="Diagnósticos que generaron más casos de suspensión"
          showSuspensions={true}
        />
      </div>
    </div>
  );
}
