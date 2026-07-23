import { getPatients } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { PatientTable } from "@/features/patient/components/patient-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;
  const companyId = resolvedParams.company ? Number(resolvedParams.company) : undefined;
  const workplaceId = resolvedParams.workplace ? Number(resolvedParams.workplace) : undefined;

  const [patientsRes, companies, workplaces] = await Promise.all([
    getPatients({ search, companyId, workplaceId }, { page, pageSize: 20 }),
    getCatalogs("company"),
    getCatalogs("workplace"),
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

      <div className="flex flex-col sm:flex-row gap-4 bg-muted/50 p-4 rounded-lg border">
        <form className="flex flex-1 gap-4 flex-col sm:flex-row" action="/patients" method="GET">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="Buscar por nombre o documento..."
              className="pl-10"
              type="search"
            />
          </div>
          <select
            name="company"
            defaultValue={companyId || ""}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="">Todas las Empresas</option>
            {companies.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="workplace"
            defaultValue={workplaceId || ""}
            className="h-10 px-3 rounded-md border border-input bg-background"
          >
            <option value="">Todas las Sedes</option>
            {workplaces.map((w: any) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            Filtrar
          </Button>
        </form>
      </div>

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
