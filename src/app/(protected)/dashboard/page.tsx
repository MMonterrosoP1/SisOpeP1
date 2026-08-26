import { Metadata } from "next";
import {
  getDashboardAdminStats,
  getPatientsByWorkplace,
  getPendingFollowUps,
  getEncountersByTypeOverTime,
  getTopDiagnoses,
  getRecentEncounters
} from "@/features/dashboard/queries";
import { DashboardMetricCard } from "@/features/dashboard/components/dashboard-metric-card";
import { EncountersByTypeAreaChart } from "@/features/dashboard/components/encounters-by-type-area-chart";
import { PatientsByWorkplaceChart } from "@/features/dashboard/components/patients-by-workplace-chart";
import { CalendarAgendaView } from "@/features/dashboard/components/calendar-agenda-view";
import { RecentEncountersList } from "@/features/dashboard/components/recent-encounters-list";
import { TopDiagnosesChart } from "@/features/dashboard/components/top-diagnoses-chart";
import { CalendarDays, Users, ShieldAlert, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel de control principal",
};

export default async function DashboardPage() {
  const [
    adminStats,
    patientsByWorkplace,
    encountersOverTime,
    followUps,
    topDiagnoses,
    recentEncounters
  ] = await Promise.all([
    getDashboardAdminStats(),
    getPatientsByWorkplace(),
    getEncountersByTypeOverTime(),
    getPendingFollowUps(),
    getTopDiagnoses(),
    getRecentEncounters()
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total de consultas"
          metric={adminStats.totalEncounters}
          icon={<CalendarDays className="size-5" />}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <DashboardMetricCard
          title="Nuevos Pacientes"
          metric={adminStats.newPatients}
          icon={<Users className="size-5" />}
          iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <DashboardMetricCard
          title="Incapacidades Activas"
          metric={adminStats.activeDisabilities}
          icon={<ShieldAlert className="size-5" />}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <DashboardMetricCard
          title="Seguimientos Pendientes"
          metric={adminStats.pendingFollowUpsMonth}
          icon={<Activity className="size-5" />}
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Middle Row: Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <EncountersByTypeAreaChart data={encountersOverTime.data} types={encountersOverTime.types} />
        <PatientsByWorkplaceChart data={patientsByWorkplace} />
      </div>

      {/* Bottom Row: Calendar, Recent Encounters, Top Diagnoses */}
      <div className="grid gap-4 lg:grid-cols-3">
        <CalendarAgendaView followUps={followUps} />
        <RecentEncountersList encounters={recentEncounters} />
        <TopDiagnosesChart data={topDiagnoses} />
      </div>
    </div>
  );
}
