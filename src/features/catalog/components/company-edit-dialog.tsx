"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateCatalogItem } from "../actions";
import { toast } from "sonner";
import { CatalogItem } from "./catalog-section";

interface CompanyEditDialogProps {
  item: CatalogItem;
  onClose: () => void;
}

export function CompanyEditDialog({ item, onClose }: CompanyEditDialogProps) {
  const [name, setName] = useState(item.name);
  const [acronym, setAcronym] = useState(item.acronym ?? "");
  const [isPending, setIsPending] = useState(false);

  // Keep fields in sync if item changes (e.g. re-opened for a different item)
  useEffect(() => {
    setName(item.name);
    setAcronym(item.acronym ?? "");
  }, [item.id]);

  const hasChanges =
    name.trim() !== item.name || acronym.trim() !== (item.acronym ?? "");

  const handleSave = async () => {
    if (!name.trim() || !hasChanges) return;

    setIsPending(true);
    try {
      const data: Record<string, unknown> = { name: name.trim() };
      // Send acronym always so it can be cleared (empty string → schema strips it to undefined)
      data.acronym = acronym.trim();

      const res = await updateCatalogItem("company", item.id, data);
      if (res.success) {
        toast.success("Empresa actualizada correctamente");
        onClose();
      } else {
        toast.error(res.error || "Error al actualizar la empresa");
      }
    } catch {
      toast.error("Error al actualizar la empresa");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>
            Modifica el nombre o el acrónimo de la empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-company-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") onClose();
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-company-acronym">Acrónimo</Label>
            <Input
              id="edit-company-acronym"
              value={acronym}
              onChange={(e) => setAcronym(e.target.value.toUpperCase())}
              placeholder="Ej. IDNSA"
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") onClose();
              }}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Déjalo vacío para eliminarlo.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !name.trim() || !hasChanges}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
