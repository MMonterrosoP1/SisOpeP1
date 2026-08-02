"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {patient.active ? "Desactivar Paciente" : "Activar Paciente"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col gap-2">
              <p>
                ¿Estás seguro de que deseas {patient.active ? "desactivar" : "activar"} al
                paciente <strong>{patient.givenNames} {patient.familyNames}</strong>?
              </p>
              {patient.active && (
                <p className="text-sm text-muted-foreground">
                  Al desactivarlo, el paciente no aparecerá en los listados activos.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleToggle} disabled={isLoading} className={patient.active ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}>
            {patient.active ? "Desactivar" : "Activar"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
