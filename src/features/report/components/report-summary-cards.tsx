import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndicatorsSummary } from "../types";
import { Users, ShieldAlert, Hospital, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ReportSummaryCardsProps {
  data: IndicatorsSummary;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

function SummaryCard({ title, value, subtitle, icon, iconBgColor = "bg-primary/10", iconColor = "text-primary" }: SummaryCardProps) {
  return (
    <Card className="group relative flex flex-col overflow-hidden border shadow-sm transition-all hover:shadow-md">
      {/* Background subtle icon */}
      <div className={cn("pointer-events-none absolute -right-6 -top-6 size-32 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.05]", iconColor)}>
        {icon}
      </div>
      
      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg shadow-sm border border-white/20 dark:border-white/10", iconBgColor, iconColor)}>
          {icon}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground/80">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReportSummaryCards({ data }: ReportSummaryCardsProps) {
  // Extract days from absenteeism rate assuming roughly
  const hours = data.absenteeismRate ? data.absenteeismRate : 0; // This is a rate, actual hours would come from suspension report directly if we passed it.
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard 
        title="Total Atendidos" 
        value={data.totalAttended} 
        icon={<Users className="size-4" />} 
        iconBgColor="bg-blue-100 dark:bg-blue-900/20"
        iconColor="text-blue-600 dark:text-blue-400"
        subtitle={data.coveragePercentage !== null ? `Cobertura: ${data.coveragePercentage.toFixed(1)}%` : "Sin datos de trabajadores activos"}
      />
      
      <SummaryCard 
        title="Tasa de Ausentismo" 
        value={data.absenteeismRate !== null ? `${data.absenteeismRate.toFixed(2)}%` : "N/D"} 
        icon={<Clock className="size-4" />} 
        iconBgColor="bg-amber-100 dark:bg-amber-900/20"
        iconColor="text-amber-600 dark:text-amber-400"
        subtitle={data.absenteeismRate !== null ? "Horas perdidas / Hrs programadas" : "Sin datos de horas programadas"}
      />
      
      <SummaryCard 
        title="Consultas ♂ / ♀" 
        value={`${data.consultationRateBySex.male !== null ? data.consultationRateBySex.male.toFixed(1) : "-"}% / ${data.consultationRateBySex.female !== null ? data.consultationRateBySex.female.toFixed(1) : "-"}%`} 
        icon={<ShieldAlert className="size-4" />} 
        iconBgColor="bg-purple-100 dark:bg-purple-900/20"
        iconColor="text-purple-600 dark:text-purple-400"
        subtitle="Tasa de consultas por sexo"
      />

      <SummaryCard 
        title="Tasa General" 
        value={data.totalAttended > 0 ? "Activa" : "Sin Datos"} 
        icon={<Hospital className="size-4" />} 
        iconBgColor="bg-green-100 dark:bg-green-900/20"
        iconColor="text-green-600 dark:text-green-400"
        subtitle="Vigilancia médica ocupacional"
      />
    </div>
  );
}
