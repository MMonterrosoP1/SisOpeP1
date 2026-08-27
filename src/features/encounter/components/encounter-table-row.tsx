"use client";

import { useRouter } from "next/navigation";
import { TableRow, TableCell } from "@/components/ui/table";
import { Calendar, Clock, MoreHorizontal, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DocumentActionMenuItem } from "@/features/document/components/document-action-button";
import { Button } from "@/components/ui/button";


export function EncounterTableRow({ encounter }: { encounter: any }) {

  const router = useRouter();
  
  const medCert = encounter.documents?.find((d: any) => d.documentType.code === 'MEDICAL_CERTIFICATE');
  const illnessCert = encounter.documents?.find((d: any) => d.documentType.code === 'ILLNESS_CERTIFICATE');

  // Prevent row click from triggering when clicking on links
  const handleRowClick = (e: React.MouseEvent) => {
    // If the click is on an anchor or a button, don't trigger programmatic navigation
    // because the anchor/button will handle its own action.
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button') || target.closest('[role="menuitem"]')) {
      return;
    }
    router.push(`/patients/${encounter.patientId}/encounters/${encounter.id}`);
  };

  return (
    <TableRow 
      className="group hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
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
          <Link prefetch={false} href={`/patients/${encounter.patientId}`} className="font-medium hover:underline text-blue-600 dark:text-blue-400">
            {encounter.patient?.person?.givenNames} {encounter.patient?.person?.familyNames}
          </Link>
          <span className="text-xs text-muted-foreground">{encounter.patient?.person?.identityDocument || "Sin DPI"}</span>
        </div>
      </TableCell>
      <TableCell>
        {encounter.encounterType?.name || "N/A"}
      </TableCell>
      <TableCell>
        {encounter.practitioner ? `${encounter.practitioner.givenNames} ${encounter.practitioner.familyNames}` : "N/A"}
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
      <TableCell className="text-right sticky right-0 z-10 bg-background group-hover:bg-muted/40 transition-colors shadow-[-1px_0_0_0_hsl(var(--border))]">
        <div className="flex items-center justify-end gap-1">
          <Link 
            prefetch={false} 
            href={`/patients/${encounter.patientId}/encounters/${encounter.id}`}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
            title="Ver Detalle"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Ver Detalle</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
              title="Documentos"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push(`/patients/${encounter.patientId}/encounters/${encounter.id}/edit`)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                <span>Editar Consulta</span>
              </DropdownMenuItem>
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
        </div>
      </TableCell>
    </TableRow>
  );
}
