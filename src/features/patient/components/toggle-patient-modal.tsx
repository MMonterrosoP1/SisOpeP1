"use client";

import { Modal, Button } from "@heroui/react";
import { PatientListItem } from "../types";
import { useState } from "react";
import { togglePatientActive } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TogglePatientModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientListItem | null;
}

export function TogglePatientModal({ isOpen, onOpenChange, patient }: TogglePatientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!patient) return null;

  const handleToggle = async () => {
    setIsLoading(true);
    const res = await togglePatientActive(patient.id);
    setIsLoading(false);

    if (res.success) {
      toast.success(
        `Paciente ${patient.active ? "desactivado" : "activado"} correctamente`
      );
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(res.error || "Ocurrió un error al cambiar el estado");
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
              <Modal.Header className="flex flex-col gap-1">
                <Modal.Heading>{patient.active ? "Desactivar Paciente" : "Activar Paciente"}</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>
                  ¿Estás seguro de que deseas {patient.active ? "desactivar" : "activar"} al paciente{" "}
                  <strong>{patient.givenNames} {patient.familyNames}</strong>?
                </p>
                {patient.active && (
                  <p className="text-sm text-default-500">
                    Al desactivarlo, el paciente no aparecerá en los listados activos.
                  </p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  className={patient.active ? "bg-danger text-white" : "bg-success text-white"}
                  onPress={handleToggle}
                >
                  {patient.active ? "Desactivar" : "Activar"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
    </Modal>
  );
}
