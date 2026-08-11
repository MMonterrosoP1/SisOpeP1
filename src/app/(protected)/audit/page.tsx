import { getAuditLogs, getAuditStats } from "@/features/audit/queries";
import { AuditClient } from "@/features/audit/components/audit-client";
import { AuditFilters } from "@/features/audit/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Auditoría | PREMED",
  description: "Registro completo de actividades del sistema",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuditPage({ searchParams }: Props) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const savedFilters = cookieStore.get('cookie_audit_filters')?.value;
  const filterKeys = Object.keys(params).filter(k => k !== 'page');
  const hasNoFiltersInUrl = filterKeys.length === 0;

  if (hasNoFiltersInUrl && savedFilters) {
    const savedParams = new URLSearchParams(savedFilters);
    const hasRealFilters = Array.from(savedParams.keys()).some(k => k !== 'page');
    
    if (hasRealFilters) {
      if (params.page) {
        savedParams.set('page', String(params.page));
      }
      const targetQuery = savedParams.toString();
      const currentQuery = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      
      if (targetQuery !== currentQuery) {
        redirect(`/audit?${targetQuery}`);
      }
    }
  }

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
