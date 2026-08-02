import { getEncountersByPatient } from "../queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Calendar, Clock, Stethoscope, Activity, MoreHorizontal, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DocumentActionMenuItem } from "@/features/document/components/document-action-button";

export async function EncounterList({ 
  patientId,
  encountersPromise 
}: { 
  patientId: number;
  encountersPromise?: Promise<any>;
}) {
  // Fetch the last 10 encounters
  const promise = encountersPromise || getEncountersByPatient(patientId, { page: 1, pageSize: 10 });
  const { data: encounters } = await promise;

  if (encounters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed">
        <p className="text-muted-foreground">No hay consultas registradas para este paciente.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo de Consulta</TableHead>
          <TableHead>Médico Tratante</TableHead>
          <TableHead>Meds. Administrados</TableHead>
          <TableHead>Observación</TableHead>
          <TableHead>Aptitud</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {encounters.map((encounter) => {
          // findPrimaryDiagnosis
          const primaryDx = encounter.diagnoses?.[0]; // Our repository filter only includes isPrimary: true
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
                    <Link href={`/patients/${patientId}/encounters/${encounter.id}`}>
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
  );
}
