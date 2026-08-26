import { Metadata } from "next";
import { Suspense } from "react";
import { ReportFilters } from "@/features/report/components/report-filters";
import { ReportSummaryCards } from "@/features/report/components/report-summary-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SociodemographicTab } from "@/features/report/components/sociodemographic-tab";
import { MorbidityTab } from "@/features/report/components/morbidity-tab";
import { SuspensionTab } from "@/features/report/components/suspension-tab";
import { getSociodemographicReport, getMorbidityReport, getSuspensionReport, getIndicatorsReport } from "@/features/report/queries";
import { workplaceRepo } from "@/features/catalog/repository";

export const metadata: Metadata = {
  title: "Reportes ",
  description: "Módulo de reportes y estadísticas",
};

interface ReportsPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
    workplaceId?: string;
  }>;
}

export default async function ReportsPage(props: ReportsPageProps) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();

  const filters = {
    year: searchParams.year ? parseInt(searchParams.year) : currentYear,
    month: searchParams.month && searchParams.month !== "annual" ? parseInt(searchParams.month) : null,
    workplaceId: searchParams.workplaceId && searchParams.workplaceId !== "all" ? parseInt(searchParams.workplaceId) : null,
  };

  const isAnnual = searchParams.month === "annual";

  // Fetch catalogs for filters
  const workplaces = await workplaceRepo.findAll({ active: true });

  // Fetch all reports concurrently
  const [
    socioReport,
    morbidityReport,
    suspensionReport
  ] = await Promise.all([
    getSociodemographicReport(filters),
    getMorbidityReport(filters),
    getSuspensionReport(filters)
  ]);

  // Indicators require socio data
  const indicatorsReport = await getIndicatorsReport(
    filters,
    socioReport.totalAttended,
    {
      male: socioReport.attendedBySex.reduce((sum, item) => sum + item.male, 0),
      female: socioReport.attendedBySex.reduce((sum, item) => sum + item.female, 0)
    }
  );

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 bg-muted/20 min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <ReportFilters
          workplaces={workplaces}
          currentFilters={{
            year: filters.year.toString(),
            month: isAnnual ? "annual" : (filters.month ? filters.month.toString() : new Date().getMonth() + 1 + ""),
            workplaceId: filters.workplaceId ? filters.workplaceId.toString() : "all"
          }}
        />
      </div>

      <ReportSummaryCards data={indicatorsReport} />

      <Tabs defaultValue="sociodemographic" className="space-y-6">
        <TabsList className="bg-background border shadow-sm w-full sm:w-auto overflow-x-auto flex-nowrap justify-start h-auto p-1">
          <TabsTrigger value="sociodemographic" className="whitespace-nowrap px-4 py-2">
            Sociodemográficos
          </TabsTrigger>
          <TabsTrigger value="morbidity" className="whitespace-nowrap px-4 py-2">
            Morbilidad
          </TabsTrigger>
          <TabsTrigger value="suspension" className="whitespace-nowrap px-4 py-2">
            Suspensiones y Ausentismo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sociodemographic" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <SociodemographicTab data={socioReport} isAnnual={isAnnual} />
        </TabsContent>

        <TabsContent value="morbidity" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <MorbidityTab data={morbidityReport} isAnnual={isAnnual} />
        </TabsContent>

        <TabsContent value="suspension" className="m-0 focus-visible:outline-none focus-visible:ring-0">
          <SuspensionTab data={suspensionReport} isAnnual={isAnnual} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
