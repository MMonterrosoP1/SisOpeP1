import { Metadata } from "next";
import { getPatients } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { PatientTable } from "@/features/patient/components/patient-table";
import { PatientFilters } from "@/features/patient/components/patient-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/shared/auth/auth-guard";

export const metadata: Metadata = {
  title: "Pacientes",
  description: "Directorio y expedientes de pacientes",
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getAuthSession();
  const role = (session?.user as any)?.role || "VIEWER";

  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground text-sm">Gestiona el directorio de pacientes y sus expedientes.</p>
        </div>
        {role !== "VIEWER" && (
          <Link href="/patients/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </Link>
        )}
      </div>

      <PatientsContent searchParams={searchParams} />
    </div>
  );
}

async function PatientsContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.page) || 1;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;
  const companyId = resolvedParams.company ? Number(resolvedParams.company) : undefined;
  const workplaceId = resolvedParams.workplace ? Number(resolvedParams.workplace) : undefined;
  const workAreaId = resolvedParams.workArea ? Number(resolvedParams.workArea) : undefined;
  const jobPositionId = resolvedParams.jobPosition ? Number(resolvedParams.jobPosition) : undefined;

  const [patientsRes, companies, workplaces, workAreas, jobPositions] = await Promise.all([
    getPatients({ search, companyId, workplaceId, workAreaId, jobPositionId }, { page, pageSize: 20 }),
    getCatalogs("company"),
    getCatalogs("workplace"),
    getCatalogs("workArea"),
    getCatalogs("jobPosition"),
  ]);

  return (
    <>
      <PatientFilters
        companies={companies.map((c: any) => ({ key: String(c.id), label: c.acronym || c.name }))}
        workplaces={workplaces.map((w: any) => ({ key: String(w.id), label: w.name, companyId: w.companyId, type: w.type }))}
        workAreas={workAreas.map((a: any) => ({ key: String(a.id), label: a.name, type: a.type }))}
        jobPositions={jobPositions.map((p: any) => ({ key: String(p.id), label: p.name, type: p.type }))}
      />

      <div className="bg-background rounded-lg border shadow-sm flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 relative rounded-t-lg">
        <PatientTable data={patientsRes.data} totalCount={patientsRes.meta.totalCount} />

        </div>

        {/* Simple pagination controls */}
        <div className="flex justify-between items-center p-4 border-t bg-background shrink-0 rounded-b-lg relative z-10">
          <span className="text-sm text-muted-foreground">
            Mostrando {patientsRes.data.length} de {patientsRes.meta.totalCount} resultados
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/patients?${new URLSearchParams({ ...resolvedParams as Record<string, string>, page: String(page - 1) }).toString()}`}>
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
              </Link>
            )}
            {page < patientsRes.meta.totalPages && (
              <Link href={`/patients?${new URLSearchParams({ ...resolvedParams as Record<string, string>, page: String(page + 1) }).toString()}`}>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
