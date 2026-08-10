"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCatalogItem, updateCatalogItem } from "../actions";
import { toast } from "sonner";

interface CatalogItem {
  id: number;
  name: string;
  type?: string | null;
}

export function WorkplaceAddDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("OFICINA");
  const [isPending, setIsPending] = useState(false);

  const resetForm = () => {
    setName("");
    setType("OFICINA");
    setIsPending(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  const handleSave = async () => {
    const nameVal = name.trim();
    if (!nameVal) return;

    setIsPending(true);
    try {
      const data = { name: nameVal, type };
      const res = await createCatalogItem("workplace", data);
      if (res.success) {
        toast.success("Centro de Trabajo creado");
        onSuccess();
        handleOpenChange(false);
      } else {
        toast.error(res.error || "Error al crear");
      }
    } catch {
      toast.error("Error al crear");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Centro de Trabajo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Planta Norte"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(val) => setType(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OBRA">Obra</SelectItem>
                <SelectItem value="OFICINA">Oficina</SelectItem>
                <SelectItem value="PLANTA">Planta</SelectItem>
                <SelectItem value="PLANTA_ADMINISTRATIVO">Planta Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !name.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WorkplaceEditDialog({
  item,
  onClose,
}: {
  item: CatalogItem | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("OFICINA");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type || "OFICINA");
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    const nameVal = name.trim();
    if (!nameVal) return;

    setIsPending(true);
    try {
      const data = { name: nameVal, type };
      const res = await updateCatalogItem("workplace", item.id, data);
      if (res.success) {
        toast.success("Actualizado");
        onClose();
      } else {
        toast.error(res.error || "Error al actualizar");
      }
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Centro de Trabajo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(val) => setType(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OBRA">Obra</SelectItem>
                <SelectItem value="OFICINA">Oficina</SelectItem>
                <SelectItem value="PLANTA">Planta</SelectItem>
                <SelectItem value="PLANTA_ADMINISTRATIVO">Planta Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !name.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
