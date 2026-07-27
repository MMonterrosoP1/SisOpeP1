import { getEncountersByPatient } from "../queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";

export async function EncounterList({ patientId }: { patientId: number }) {
  // Fetch the last 10 encounters
  const { data: encounters } = await getEncountersByPatient(patientId, { page: 1, pageSize: 10 });

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
          <TableHead>Diagnóstico Principal</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {encounters.map((encounter) => {
          // findPrimaryDiagnosis
          const primaryDx = encounter.diagnoses?.[0]; // Our repository filter only includes isPrimary: true
          
          return (
            <TableRow key={encounter.id}>
              <TableCell className="font-medium">
                {new Intl.DateTimeFormat('es-ES', { 
                  day: '2-digit', month: 'short', year: 'numeric', 
                  hour: '2-digit', minute: '2-digit' 
                }).format(new Date(encounter.createdAt))}
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
                    {primaryDx.icd10Code.code} - {primaryDx.icd10Code.description.substring(0, 30)}
                    {primaryDx.icd10Code.description.length > 30 ? '...' : ''}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">Sin diagnóstico</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/patients/${patientId}/encounters/${encounter.id}`}>
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Detalle
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
