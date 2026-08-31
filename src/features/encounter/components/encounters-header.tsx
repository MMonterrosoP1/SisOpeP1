"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewEncounterModal } from "./new-encounter-modal";
import { authClient } from "@/lib/auth-client";

export function EncountersHeader() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const role = (session?.user as any)?.role || "VIEWER";

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Consultas</h1>
          <p className="text-muted-foreground text-sm">Visualiza el historial global de todas las consultas realizadas.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {role !== "VIEWER" && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Consulta
            </Button>
          )}
        </div>
      </div>
      
      <NewEncounterModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
