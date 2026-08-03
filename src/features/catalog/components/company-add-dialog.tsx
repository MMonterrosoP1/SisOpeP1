"use client";

import { useState, useEffect } from "react";
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
import { createCatalogItem } from "../actions";
import { toast } from "sonner";

interface CatalogItem {
  id: number;
  name: string;
}

interface CompanyAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: CatalogItem) => void;
}

export function CompanyAddDialog({
  open,
  onOpenChange,
  onSuccess,
}: CompanyAddDialogProps) {
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarItems, setSimilarItems] = useState<CatalogItem[]>([]);
  const [isPending, setIsPending] = useState(false);

  const resetForm = () => {
    setName("");
    setAcronym("");
    setSimilarItems([]);
    setSimilarLoading(false);
    setIsPending(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  // Duplicate detection
  useEffect(() => {
    if (name.trim().length < 3) {
      setSimilarItems([]);
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setSimilarLoading(true);
      try {
        const res = await fetch(
          `/api/search/catalog?type=company&q=${encodeURIComponent(name)}`
        ).then((r) => r.json());
        if (!isCancelled && res.success && res.data) {
          setSimilarItems(res.data);
        }
      } catch {
        // ignore
      } finally {
        if (!isCancelled) setSimilarLoading(false);
      }
    }, 800);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [name]);

  const handleSave = async () => {
    const nameVal = name.trim();
    if (!nameVal) return;

    setIsPending(true);
    try {
      const data: Record<string, unknown> = { name: nameVal };
      if (acronym.trim()) data.acronym = acronym.trim();

      const res = await createCatalogItem("company", data);
      if (res.success) {
        toast.success("Empresa creada correctamente");
        onSuccess(res.data);
        handleOpenChange(false);
      } else {
        toast.error(res.error || "Error al crear la empresa");
      }
    } catch {
      toast.error("Error al crear la empresa");
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
          <DialogTitle>Agregar Empresa</DialogTitle>
          <DialogDescription>
            Ingrese el nombre y, opcionalmente, el acrónimo de la empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Industrias del Norte"
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
            <Label htmlFor="company-acronym">Acrónimo</Label>
            <Input
              id="company-acronym"
              value={acronym}
              onChange={(e) => setAcronym(e.target.value.toUpperCase())}
              placeholder="Ej. IDNSA"
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Se guardará en mayúsculas.
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
                Se encontraron empresas similares
              </div>
              <p className="text-xs text-muted-foreground">
                Revisa si la empresa que intentas crear ya existe:
              </p>
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
                      Usar esta
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
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
