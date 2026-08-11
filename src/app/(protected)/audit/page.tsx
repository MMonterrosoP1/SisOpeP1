import { getAuditLogs, getAuditStats } from "@/features/audit/queries";
import { AuditClient } from "@/features/audit/components/audit-client";
import { AuditFilters } from "@/features/audit/types";

export const metadata = {
  title: "Auditoría | PREMED",
  description: "Registro completo de actividades del sistema",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuditPage({ searchParams }: Props) {
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
