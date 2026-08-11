"use client";

import { AuditFilters as AuditFiltersComponent } from "./audit-filters";
import { AuditTable } from "./audit-table";
import { AuditStats } from "./audit-stats";
import { AuditLogPaginatedResponse } from "../types";

interface AuditClientProps {
  data: AuditLogPaginatedResponse;
  stats: any;
}

export function AuditClient({ data, stats }: AuditClientProps) {
  return (
    <>

      <AuditStats stats={stats} />
      
      <AuditFiltersComponent />
      
      <AuditTable data={data} />
    </>
  );
}
