import { getPatients } from "@/features/patient/queries";
import { getCatalogs } from "@/features/catalog/queries";
import { PatientTable } from "@/features/patient/components/patient-table";
import { Button, Input, TextField, InputGroup } from "@heroui/react";
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
          <p className="text-default-500 text-sm">Gestiona el directorio de pacientes y sus expedientes.</p>
        </div>
        <Link href="/patients/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Paciente
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-default-50 p-4 rounded-xl border border-default-100">
        <form className="flex flex-1 gap-4 flex-col sm:flex-row" action="/patients" method="GET">
          <div className="flex-1">
            <TextField name="search" defaultValue={search} aria-label="Buscar pacientes">
              <InputGroup>
                <InputGroup.Prefix>
                  <Search className="text-default-400 w-4 h-4" />
                </InputGroup.Prefix>
                <Input
                  placeholder="Buscar por nombre o documento..."
                />
              </InputGroup>
            </TextField>
          </div>
          {/* We would typically use Select here, but for native form submission native selects or hidden inputs are easier. We'll use a simple approach for now */}
          <div className="w-full sm:w-48">
             <select name="company" defaultValue={companyId || ""} className="w-full h-10 px-3 rounded-medium border border-default-200 bg-background text-sm">
                <option value="">Todas las Empresas</option>
                {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <div className="w-full sm:w-48">
             <select name="workplace" defaultValue={workplaceId || ""} className="w-full h-10 px-3 rounded-medium border border-default-200 bg-background text-sm">
                <option value="">Todas las Sedes</option>
                {workplaces.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
             </select>
          </div>
          <Button type="submit" variant="secondary" size="md" className="h-10">Filtrar</Button>
        </form>
      </div>

      <div className="bg-background rounded-xl border border-default-200 shadow-sm overflow-hidden">
        <PatientTable data={patientsRes.data} totalCount={patientsRes.meta.totalCount} />
        
        {/* Simple pagination controls */}
        <div className="flex justify-between items-center p-4 border-t border-default-200">
          <span className="text-sm text-default-500">
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
