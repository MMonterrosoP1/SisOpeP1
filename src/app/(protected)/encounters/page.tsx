import { getEncounters } from "@/features/encounter/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, MoreHorizontal, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EncountersHeader } from "@/features/encounter/components/encounters-header";
import { EncountersFilters } from "@/features/encounter/components/encounters-filters";
import { DocumentActionMenuItem } from "@/features/document/components/document-action-button";
import { EncounterTableRow } from "@/features/encounter/components/encounter-table-row";
import { getAuthSession } from "@/shared/auth/auth-guard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultas",
  description: "Registro y gestión de consultas médicas",
};

export default async function GlobalEncountersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full">
      <EncountersHeader />
      <EncountersContent searchParams={searchParams} />
    </div>
  );
}

async function EncountersContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.page) || 1;
  const pageSize = 20;

  const session = await getAuthSession();

  let defaultPractitionerId: string | undefined = resolvedParams.practitionerId as string;
  const currentSearch = resolvedParams.search as string;

  if (defaultPractitionerId === undefined && session?.user.role === 'DOCTOR') {
    defaultPractitionerId = session.user.id;
  } else if (defaultPractitionerId === 'all') {
    defaultPractitionerId = undefined;
  }

  const { data: encounters, meta } = await getEncounters(
    {
      practitionerId: defaultPractitionerId,
      search: currentSearch
    },
    { page, pageSize }
  );

  return (
    <>
      <EncountersFilters
        currentPractitionerId={resolvedParams.practitionerId as string}
        currentSearch={currentSearch}
      />

      <div className="bg-background rounded-lg border shadow-sm flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0 relative rounded-t-lg overflow-auto">
        {encounters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30">
            <p className="text-muted-foreground">No hay consultas registradas en el sistema.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo de Consulta</TableHead>
                <TableHead>Médico Tratante</TableHead>
                <TableHead>Meds. Administrados</TableHead>
                <TableHead>Observación</TableHead>
                <TableHead>Aptitud</TableHead>
                <TableHead className="text-right sticky right-0 z-10 bg-background shadow-[-1px_0_0_0_hsl(var(--border))]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encounters.map((encounter: any) => (
                <EncounterTableRow key={encounter.id} encounter={encounter} />
              ))}
            </TableBody>
          </Table>
        )}

        </div>

        {/* Pagination controls */}
        {encounters.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t bg-background shrink-0 rounded-b-lg relative z-10">
            <span className="text-sm text-muted-foreground">
              Mostrando {encounters.length} de {meta.totalCount} resultados
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/encounters?${new URLSearchParams({ ...resolvedParams as Record<string, string>, page: String(page - 1) }).toString()}`}>
                  <Button variant="outline" size="sm">
                    Anterior
                  </Button>
                </Link>
              )}
              {page < meta.totalPages && (
                <Link href={`/encounters?${new URLSearchParams({ ...resolvedParams as Record<string, string>, page: String(page + 1) }).toString()}`}>
                  <Button variant="outline" size="sm">
                    Siguiente
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
