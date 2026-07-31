import { getEncounters } from "@/features/encounter/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";
import { EncountersHeader } from "@/features/encounter/components/encounters-header";
import { DocumentActionButton } from "@/features/document/components/document-action-button";

export default async function GlobalEncountersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const pageSize = 20;

  const { data: encounters, meta } = await getEncounters({}, { page, pageSize });

  return (
    <div className="flex flex-col gap-6 p-6">
      <EncountersHeader />

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
                <TableHead>DPI</TableHead>
                <TableHead>Tipo de Consulta</TableHead>
                <TableHead>Médico Tratante</TableHead>
                <TableHead>Diagnóstico Principal</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encounters.map((encounter: any) => {
                const primaryDx = encounter.diagnoses?.[0];
                const medCert = encounter.documents?.find((d: any) => d.documentType.code === 'MEDICAL_CERTIFICATE');
                const illnessCert = encounter.documents?.find((d: any) => d.documentType.code === 'ILLNESS_CERTIFICATE');
                return (
                  <TableRow key={encounter.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {new Intl.DateTimeFormat("es-ES", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      }).format(new Date(encounter.createdAt))}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/patients/${encounter.patientId}`} className="hover:underline text-primary">
                        {encounter.patient?.givenNames} {encounter.patient?.familyNames}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {encounter.patient?.identityDocument}
                    </TableCell>
                    <TableCell>
                      {encounter.encounterType?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {encounter.practitioner?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      {primaryDx ? (
                        <span title={primaryDx.icd10Code.description}>
                          {primaryDx.icd10Code.code} - {primaryDx.icd10Code.description.substring(0, 25)}
                          {primaryDx.icd10Code.description.length > 25 ? '...' : ''}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Sin diagnóstico</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DocumentActionButton 
                          encounterId={encounter.id} 
                          documentTypeCode="MEDICAL_CERTIFICATE"
                          label="Constancia Médica"
                          initialPdfUrl={medCert?.pdfUrl}
                        />
                        <DocumentActionButton 
                          encounterId={encounter.id} 
                          documentTypeCode="ILLNESS_CERTIFICATE"
                          label="Constancia de Enfermedad"
                          initialPdfUrl={illnessCert?.pdfUrl}
                        />
                        <Link href={`/patients/${encounter.patientId}/encounters/${encounter.id}`}>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Detalle
                          </Button>
                        </Link>
                      </div>
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
