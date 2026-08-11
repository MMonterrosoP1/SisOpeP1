import { getEncounters } from "@/features/encounter/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, MoreHorizontal, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EncountersHeader } from "@/features/encounter/components/encounters-header";
import { EncountersFilters } from "@/features/encounter/components/encounters-filters";
import { DocumentActionMenuItem } from "@/features/document/components/document-action-button";
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
    <div className="flex flex-col gap-6 p-6">
      <EncountersHeader />
      <EncountersFilters 
        currentPractitionerId={resolvedParams.practitionerId as string} 
        currentSearch={currentSearch}
      />

      <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
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
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encounters.map((encounter: any) => {
                const medCert = encounter.documents?.find((d: any) => d.documentType.code === 'MEDICAL_CERTIFICATE');
                const illnessCert = encounter.documents?.find((d: any) => d.documentType.code === 'ILLNESS_CERTIFICATE');
                return (
                  <TableRow key={encounter.id} className="group hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(encounter.createdAt))}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(encounter.createdAt))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Link prefetch={false} href={`/patients/${encounter.patientId}`} className="font-medium hover:underline text-primary">
                          {encounter.patient?.person?.givenNames} {encounter.patient?.person?.familyNames}
                        </Link>
                        <span className="text-xs text-muted-foreground">{encounter.patient?.person?.identityDocument || "Sin DPI"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {encounter.encounterType?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {encounter.practitioner?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-sm" title={encounter.medicationsAdministered}>
                        {encounter.medicationsAdministered || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-sm" title={encounter.internalObservation}>
                        {encounter.internalObservation || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{encounter.medicalAptitude?.name || "-"}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <Link prefetch={false} href={`/patients/${encounter.patientId}/encounters/${encounter.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span>Ver Detalle</span>
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DocumentActionMenuItem 
                            encounterId={encounter.id} 
                            documentTypeCode="MEDICAL_CERTIFICATE"
                            label="Constancia Médica"
                            initialPdfUrl={medCert?.pdfUrl}
                          />
                          <DocumentActionMenuItem 
                            encounterId={encounter.id} 
                            documentTypeCode="ILLNESS_CERTIFICATE"
                            label="Constancia de Enf."
                            initialPdfUrl={illnessCert?.pdfUrl}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination controls */}
        {encounters.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-muted-foreground">
              Mostrando {encounters.length} de {meta.totalCount} resultados
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/encounters?page=${page - 1}`}>
                  <Button variant="outline" size="sm">
                    Anterior
                  </Button>
                </Link>
              )}
              {page < meta.totalPages && (
                <Link href={`/encounters?page=${page + 1}`}>
                  <Button variant="outline" size="sm">
                    Siguiente
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
