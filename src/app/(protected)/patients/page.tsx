import { Metadata } from "next";
import { getPatients } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { PatientTable } from "@/features/patient/components/patient-table";
import { PatientFilters } from "@/features/patient/components/patient-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Pacientes",
  description: "Directorio y expedientes de pacientes",
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const cookieStore = await cookies();
  const savedFilters = cookieStore.get('cookie_patients_filters')?.value;
  const filterKeys = Object.keys(resolvedParams).filter(k => k !== 'page');
  const hasNoFiltersInUrl = filterKeys.length === 0;

  if (hasNoFiltersInUrl && savedFilters) {
    const savedParams = new URLSearchParams(savedFilters);
    const hasRealFilters = Array.from(savedParams.keys()).some(k => k !== 'page');
    
    if (hasRealFilters) {
      if (resolvedParams.page) {
        savedParams.set('page', String(resolvedParams.page));
      }
      const targetQuery = savedParams.toString();
      const currentQuery = new URLSearchParams(
        Object.entries(resolvedParams).map(([k, v]) => [k, String(v)])
      ).toString();
      
      if (targetQuery !== currentQuery) {
        redirect(`/patients?${targetQuery}`);
      }
    }
  }

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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground text-sm">Gestiona el directorio de pacientes y sus expedientes.</p>
        </div>
        <Link href="/patients/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Paciente
          </Button>
        </Link>
      </div>

      <PatientFilters
        companies={companies.map((c: any) => ({ key: String(c.id), label: c.name }))}
        workplaces={workplaces.map((w: any) => ({ key: String(w.id), label: w.name }))}
        workAreas={workAreas.map((a: any) => ({ key: String(a.id), label: a.name }))}
        jobPositions={jobPositions.map((p: any) => ({ key: String(p.id), label: p.name }))}
      />

      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
        <PatientTable data={patientsRes.data} totalCount={patientsRes.meta.totalCount} />

        {/* Simple pagination controls */}
        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-muted-foreground">
            Mostrando {patientsRes.data.length} de {patientsRes.meta.totalCount} resultados
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/patients?page=${page - 1}`}>
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
              </Link>
            )}
            {page < patientsRes.meta.totalPages && (
              <Link href={`/patients?page=${page + 1}`}>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
