"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
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

export function PatientTable({ data }: PatientTableProps) {
  const [selectedPatient, setSelectedPatient] = useState<PatientListItem | null>(null);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);

  const columnHelper = createColumnHelper<PatientListItem>();

  const columns = [
    columnHelper.accessor((row) => `${row.givenNames} ${row.familyNames}`, {
      id: "fullName",
      header: "Nombre Completo",
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-medium">{info.getValue()}</span>
          <span className="text-xs text-muted-foreground">
            {info.row.original.documentType}: {info.row.original.identityDocument}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("phone", {
      header: "Teléfono",
      cell: (info) => info.getValue() || "-",
      meta: { className: "hidden sm:table-cell" },
    }),
    columnHelper.accessor((row) => row.companyAcronym || row.companyName || "-", {
      id: "company",
      header: "Empresa",
      cell: (info) => info.getValue(),
      meta: { className: "hidden lg:table-cell" },
    }),
    columnHelper.accessor("workplaceName", {
      header: "Lugar de trabajo",
      cell: (info) => info.getValue() || "-",
      meta: { className: "hidden xl:table-cell" },
    }),
    columnHelper.accessor("workAreaName", {
      header: "Área de trabajo",
      cell: (info) => info.getValue() || "-",
      meta: { className: "hidden xl:table-cell" },
    }),
    columnHelper.accessor("jobPositionName", {
      header: "Puesto laboral",
      cell: (info) => info.getValue() || "-",
      meta: { className: "hidden lg:table-cell" },
    }),
    columnHelper.display({
      id: "status_actions",
      header: "Estado y Acciones",
      cell: (info) => {
        const patient = info.row.original;
        return (
          <div className="flex items-center justify-between gap-4">
            <Badge
              variant={patient.active ? "default" : "destructive"}
              className="font-normal"
            >
              {patient.active ? "Activo" : "Inactivo"}
            </Badge>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link prefetch={false} href={`/patients/${patient.id}`}>
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
                    <Link prefetch={false} href={`/patients/${patient.id}/edit`}>
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
          </div>
        );
      },
    }),
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={(header.column.columnDef.meta as { className?: string })?.className}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={(cell.column.columnDef.meta as { className?: string })?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
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
