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
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría del Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Registro completo de actividades y cambios en el sistema.
          </p>
        </div>
      </div>

      <AuditStats stats={stats} />
      
      <AuditFiltersComponent />
      
      <AuditTable data={data} />
    </div>
  );
}
