import { getAuditLogs, getAuditStats } from "@/features/audit/queries";
import { AuditClient } from "@/features/audit/components/audit-client";
import { AuditFilters } from "@/features/audit/types";
import { Suspense } from "react";

export const metadata = {
  title: "Auditoría | PREMED",
  description: "Registro completo de actividades del sistema",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuditPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría del Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Registro completo de actividades y cambios en el sistema.
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-muted-foreground">Cargando registros...</div>}>
        <AuditContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AuditContent({ searchParams }: Props) {
  const params = await searchParams;


  const filters: AuditFilters = {
    page: params.page ? parseInt(params.page as string, 10) : 1,
    limit: 50,
    search: params.search as string | undefined,
    action: params.action as any,
    entityType: params.entityType as string | undefined,
    startDate: params.startDate as string | undefined,
    endDate: params.endDate as string | undefined,
  };

  const [logsResponse, stats] = await Promise.all([
    getAuditLogs(filters),
    getAuditStats(),
  ]);

  return <AuditClient data={logsResponse} stats={stats} />;
}
