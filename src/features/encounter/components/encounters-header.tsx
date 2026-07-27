"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewEncounterModal } from "./new-encounter-modal";

export function EncountersHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Consultas</h1>
          <p className="text-muted-foreground text-sm">Visualiza el historial global de todas las consultas realizadas.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Consulta
        </Button>
      </div>
      
      <NewEncounterModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
