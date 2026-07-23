"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Chip,
  Tooltip,
} from "@heroui/react";
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

  const renderCell = (patient: PatientListItem, columnId: string) => {
    switch (columnId) {
      case "identityDocument":
        return (
          <div className="flex flex-col">
            <span className="font-medium">{patient.identityDocument}</span>
            <span className="text-tiny text-default-400">{patient.documentType}</span>
          </div>
        );
      case "fullName":
        return (
          <span className="font-medium">
            {patient.givenNames} {patient.familyNames}
          </span>
        );
      case "companyName":
        return patient.companyName || "-";
      case "workplaceName":
        return patient.workplaceName || "-";
      case "active":
        return (
          <Chip
            color={patient.active ? "success" : "danger"}
            variant="soft"
            size="sm"
          >
            {patient.active ? "Activo" : "Inactivo"}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Tooltip>
              <Tooltip.Trigger>
                <Link href={`/patients/${patient.id}`}>
                  <Button isIconOnly variant="ghost" size="sm">
                    <Eye className="w-4 h-4 text-default-500" />
                  </Button>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content placement="top">Ver detalles</Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger>
                <Link href={`/patients/${patient.id}/edit`}>
                  <Button isIconOnly variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4 text-default-500" />
                  </Button>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content placement="top">Editar paciente</Tooltip.Content>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  className={patient.active ? "text-danger" : "text-success"}
                  onPress={() => {
                    setSelectedPatient(patient);
                    setIsToggleModalOpen(true);
                  }}
                >
                  {patient.active ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content placement="top">
                {patient.active ? "Desactivar" : "Activar"}
              </Tooltip.Content>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Tabla de pacientes">
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column isRowHeader={column.id === "identityDocument"}>
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body items={data}>
              {(patient) => (
                <Table.Row id={patient.id}>
                  <Table.Collection items={columns}>
                    {(column) => (
                      <Table.Cell>{renderCell(patient, column.id)}</Table.Cell>
                    )}
                  </Table.Collection>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <TogglePatientModal
        isOpen={isToggleModalOpen}
        onOpenChange={setIsToggleModalOpen}
        patient={selectedPatient}
      />
    </>
  );
}
