"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Clock, MoreHorizontal, Download, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { PaginatedResponse } from "@/shared/schemas/pagination";

interface CertificatesTableProps {
  data: any[];
  meta: PaginatedResponse<any>["meta"];
}

export function CertificatesTable({ data, meta }: CertificatesTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha de Emisión</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Consulta Asociada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No se encontraron constancias.
                </TableCell>
              </TableRow>
            ) : (
              data.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(doc.issuedAt))}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date(doc.issuedAt))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link prefetch={false} href={`/patients/${doc.patientId}`} className="hover:underline font-medium">
                      {doc.patient?.person?.givenNames} {doc.patient?.person?.familyNames}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {doc.patient?.person?.identityDocument}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doc.documentType?.code === 'ILLNESS_CERTIFICATE' ? 'destructive' : 'default'} className="bg-opacity-90">
                      {doc.documentType?.code === 'ILLNESS_CERTIFICATE' ? 'Enfermedad' : 'Médica'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.encounter ? (
                      <Link prefetch={false} href={`/patients/${doc.patientId}/encounters/${doc.encounter.id}`} className="hover:underline text-sm flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(doc.encounter.date))}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {doc.pdfUrl ? (
                          <>
                            <DropdownMenuItem render={<a href={`/api/encounters/${doc.encounterId}/documents/${doc.documentType.code}`} target="_blank" rel="noreferrer" />}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Ver PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<a href={`/api/encounters/${doc.encounterId}/documents/${doc.documentType.code}`} download />}>
                              <Download className="mr-2 h-4 w-4" />
                              <span>Descargar</span>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem disabled>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Generando PDF...</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
