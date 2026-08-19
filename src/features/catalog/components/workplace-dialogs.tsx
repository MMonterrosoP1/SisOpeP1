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
  companyId?: number | null;
}

interface CompanyItem {
  id: number;
  name: string;
  acronym?: string | null;
}

export function WorkplaceAddDialog({
  open,
  onOpenChange,
  onSuccess,
  companies,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  companies: CompanyItem[];
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("OFICINA");
  const [companyId, setCompanyId] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  const resetForm = () => {
    setName("");
    setType("OFICINA");
    setCompanyId("");
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
      const data = {
        name: nameVal,
        type,
        companyId: companyId && companyId !== "none" ? parseInt(companyId) : null
      };
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
              placeholder="Ej. Planta , Proyecto X"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(val) => setType(val || "")}>
              <SelectTrigger>
                <span className="flex flex-1 text-left truncate">
                  {type === "OBRA" ? "Obra" : type === "OFICINA" ? "Oficina" : type === "PLANTA" ? "Planta" : <span className="text-muted-foreground">Seleccione tipo</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OBRA">Obra</SelectItem>
                <SelectItem value="OFICINA">Oficina</SelectItem>
                <SelectItem value="PLANTA">Planta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Empresa (Opcional para Oficina/Planta)</Label>
            <Select value={companyId} onValueChange={(val) => setCompanyId(val || "")}>
              <SelectTrigger>
                <span className="flex flex-1 text-left truncate">
                  {companyId && companyId !== "none"
                    ? (companies.find(c => c.id.toString() === companyId)?.acronym || companies.find(c => c.id.toString() === companyId)?.name)
                    : companyId === "none"
                      ? "Ninguna (Compartido)"
                      : <span className="text-muted-foreground">Seleccione empresa (compartido si está vacío)</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground">Ninguna (Compartido)</SelectItem>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.acronym || c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !name.trim() || (type === "OBRA" && (!companyId || companyId === "none"))}>
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
  companies,
}: {
  item: CatalogItem | null;
  onClose: () => void;
  companies: CompanyItem[];
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("OFICINA");
  const [companyId, setCompanyId] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type || "OFICINA");
      setCompanyId(item.companyId ? item.companyId.toString() : "none");
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    const nameVal = name.trim();
    if (!nameVal) return;

    setIsPending(true);
    try {
      const data = {
        name: nameVal,
        type,
        companyId: companyId && companyId !== "none" ? parseInt(companyId) : null
      };
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
                <span className="flex flex-1 text-left truncate">
                  {type === "OBRA" ? "Obra" : type === "OFICINA" ? "Oficina" : type === "PLANTA" ? "Planta" : <span className="text-muted-foreground">Seleccione tipo</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OBRA">Obra</SelectItem>
                <SelectItem value="OFICINA">Oficina</SelectItem>
                <SelectItem value="PLANTA">Planta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Empresa (Opcional para Oficina/Planta)</Label>
            <Select value={companyId} onValueChange={(val) => setCompanyId(val || "")}>
              <SelectTrigger>
                <span className="flex flex-1 text-left truncate">
                  {companyId && companyId !== "none"
                    ? (companies.find(c => c.id.toString() === companyId)?.acronym || companies.find(c => c.id.toString() === companyId)?.name)
                    : companyId === "none"
                      ? "Ninguna (Compartido)"
                      : <span className="text-muted-foreground">Seleccione empresa (compartido si está vacío)</span>}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground">Ninguna (Compartido)</SelectItem>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.acronym || c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleSave} disabled={isPending || !name.trim() || (type === "OBRA" && (!companyId || companyId === "none"))}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
