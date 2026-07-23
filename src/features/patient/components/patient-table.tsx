"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Edit2, ShieldAlert, ShieldCheck } from "lucide-react";
import { PatientListItem } from "../types";
import Link from "next/link";
import { TogglePatientModal } from "./toggle-patient-modal";

interface PatientTableProps {
  data: PatientListItem[];
  totalCount: number;
}

const columns = [
  { id: "identityDocument", name: "Documento" },
  { id: "fullName", name: "Nombre Completo" },
  { id: "companyName", name: "Empresa" },
  { id: "workplaceName", name: "Sede" },
  { id: "active", name: "Estado" },
  { id: "actions", name: "Acciones" },
];

export function PatientTable({ data, totalCount }: PatientTableProps) {
  const [selectedPatient, setSelectedPatient] = useState<PatientListItem | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{patient.identityDocument}</span>
                    <span className="text-xs text-muted-foreground">
                      {patient.documentType}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {patient.givenNames} {patient.familyNames}
                </TableCell>
                <TableCell>{patient.companyAcronym || patient.companyName || "-"}</TableCell>
                <TableCell>{patient.workplaceName || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={patient.active ? "default" : "destructive"}
                    className="font-normal"
                  >
                    {patient.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Link href={`/patients/${patient.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        }
                      />
                      <TooltipContent>Ver detalles</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Link href={`/patients/${patient.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </Link>
                        }
                      />
                      <TooltipContent>Editar paciente</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger
                        render={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsToggleModalOpen(true);
                          }}
                        >
                          {patient.active ? (
                            <ShieldAlert className="w-4 h-4 text-destructive" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        }
                      />
                      <TooltipContent>
                        {patient.active ? "Desactivar" : "Activar"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TogglePatientModal
        isOpen={isToggleModalOpen}
        onOpenChange={setIsToggleModalOpen}
        patient={selectedPatient}
      />
    </>
  );
}
