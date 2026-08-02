"use client";

import { useState, useEffect } from "react";
import { PatientListItem } from "@/features/patient/types";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


interface NewEncounterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (patient: PatientListItem) => void;
}

export function NewEncounterModal({ open, onOpenChange, onSelect }: NewEncounterModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const req = await fetch(`/api/search/patients?q=${encodeURIComponent(query)}`);
        const res = await req.json();
        if (res.success) {
          setResults(res.data);
        }
      } catch (error) {
        console.error("Error searching patients:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (patient: PatientListItem) => {
    onOpenChange(false);
    if (onSelect) {
      onSelect(patient);
    } else {
      router.push(`/patients/${patient.id}/encounters/new`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva Consulta</DialogTitle>
          <DialogDescription>
            Busque y seleccione el paciente para iniciar la consulta.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, apellido o documento..."
            className="h-10 pl-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto mt-4 space-y-2">
          {query.length >= 2 && results.length === 0 && !loading && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No se encontraron pacientes.
            </p>
          )}
          {results.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handleSelect(patient)}
              className="w-full flex flex-col items-start gap-1 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
            >
              <div className="font-medium text-sm">
                {patient.givenNames} {patient.familyNames}
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>DPI: {patient.identityDocument}</span>
                {patient.company && <span>• {patient.company.name}</span>}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
