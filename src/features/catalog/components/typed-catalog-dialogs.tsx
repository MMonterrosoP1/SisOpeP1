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
import { CatalogType } from "../types";

interface CatalogItem {
  id: number;
  name: string;
  type?: string | null;
}

export function TypedCatalogAddDialog({
  open,
  onOpenChange,
  onSuccess,
  catalogType,
  title,
  allowAll = false,
  initialType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: CatalogItem) => void;
  catalogType: CatalogType;
  title: string;
  allowAll?: boolean;
  initialType?: string;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("OFICINA");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setType(initialType || (allowAll ? "TODOS" : "OFICINA"));
      setIsPending(false);
    } else {
      setName("");
      setType("OFICINA");
      setIsPending(false);
    }
  }, [open, allowAll, initialType]);

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
  };

  const handleSave = async () => {
    const nameVal = name.trim();
    if (!nameVal) return;

    setIsPending(true);
    try {
      const data = { name: nameVal, type: type === "TODOS" ? null : type };
      const res = await createCatalogItem(catalogType, data);
      if (res.success) {
        toast.success(`${title} creado`);
        onSuccess(res.data);
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
          <DialogTitle>Agregar {title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
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
                {allowAll && <SelectItem value="TODOS">Todos (Aplica a cualquiera)</SelectItem>}
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

export function TypedCatalogEditDialog({
  item,
  onClose,
  catalogType,
  title,
  allowAll = false,
}: {
  item: CatalogItem | null;
  onClose: () => void;
  catalogType: CatalogType;
  title: string;
  allowAll?: boolean;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("OFICINA");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type || (allowAll ? "TODOS" : "OFICINA"));
    }
  }, [item, allowAll]);

  const handleSave = async () => {
    if (!item) return;
    const nameVal = name.trim();
    if (!nameVal) return;

    setIsPending(true);
    try {
      const data = { name: nameVal, type: type === "TODOS" ? null : type };
      const res = await updateCatalogItem(catalogType, item.id, data);
      if (res.success) {
        toast.success(`${title} actualizado`);
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
          <DialogTitle>Editar {title}</DialogTitle>
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
                {allowAll && <SelectItem value="TODOS">Todos (Aplica a cualquiera)</SelectItem>}
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

export function SimpleCatalogAddDialog({
  open,
  onOpenChange,
  onSuccess,
  catalogType,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: CatalogItem) => void;
  catalogType: CatalogType;
  title: string;
}) {
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleClose = () => {
    setName("");
    setIsPending(false);
    onOpenChange(false);
  };

  const handleSave = async () => {
    const nameVal = name.trim();
    if (!nameVal) return;

    setIsPending(true);
    try {
      const res = await createCatalogItem(catalogType, { name: nameVal });
      if (res.success) {
        toast.success(`${title} creado`);
        onSuccess(res.data);
        handleClose();
      } else {
        toast.error(res.error || "Error al crear");
      }
    } catch {
      toast.error("Error al crear");
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar {title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Nombre del ${title.toLowerCase()}`}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !name.trim()}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
