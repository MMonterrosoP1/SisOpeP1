"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCatalogItem } from "../actions";
import { toast } from "sonner";

interface CatalogItem {
  id: number;
  name: string;
}

interface MaritalStatusAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: CatalogItem) => void;
}

export function MaritalStatusAddDialog({
  open,
  onOpenChange,
  onSuccess,
}: MaritalStatusAddDialogProps) {
  const [name, setName] = useState("");
  const [sex, setSex] = useState<"MALE" | "FEMALE" | "">("");
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarItems, setSimilarItems] = useState<CatalogItem[]>([]);
  const [isPending, setIsPending] = useState(false);

  const resetForm = () => {
    setName("");
    setSex("");
    setSimilarItems([]);
    setSimilarLoading(false);
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
      const data: Record<string, unknown> = { name: nameVal };
      if (sex) data.sex = sex;

      const res = await createCatalogItem("maritalStatus", data);
      if (res.success) {
        toast.success("Estado civil creado correctamente");
        onSuccess(res.data);
        handleOpenChange(false);
      } else {
        toast.error(res.error || "Error al crear el estado civil");
      }
    } catch {
      toast.error("Error al crear el estado civil");
    } finally {
      setIsPending(false);
    }
  };

  const handleUseExisting = (item: CatalogItem) => {
    onSuccess(item);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Estado Civil</DialogTitle>
          <DialogDescription>
            Ingrese el nombre y opcionalmente el sexo aplicable.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="marital-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="marital-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Soltero(a)"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="marital-sex">Aplica para</Label>
            <Select value={sex} onValueChange={(v) => setSex(v as "MALE" | "FEMALE" | "")}>
              <SelectTrigger id="marital-sex">
                <SelectValue placeholder="Ambos sexos (ninguno)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Solo hombres</SelectItem>
                <SelectItem value="FEMALE">Solo mujeres</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Déjalo vacío si aplica para ambos sexos.
            </p>
          </div>

          {similarLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando duplicados...
            </div>
          )}

          {!similarLoading && similarItems.length > 0 && (
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 space-y-3">
              <div className="flex items-center gap-2 text-warning-foreground font-medium text-sm">
                <AlertTriangle className="h-4 w-4" />
                Se encontraron elementos similares
              </div>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
                {similarItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border text-sm"
                  >
                    <span className="truncate">{item.name}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUseExisting(item)}
                      className="h-7 text-xs flex-shrink-0"
                    >
                      Usar este
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !name.trim()}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
