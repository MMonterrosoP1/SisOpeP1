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
import { CatalogType } from "../types";
import { createCatalogItem, findSimilarCatalogItemsAction } from "../actions";
import { toast } from "sonner";

interface CatalogItem {
  id: number;
  name: string;
}

interface CatalogQuickAddDialogProps {
  type: CatalogType;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: CatalogItem) => void;
}

export function CatalogQuickAddDialog({
  type,
  title,
  open,
  onOpenChange,
  onSuccess,
}: CatalogQuickAddDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarItems, setSimilarItems] = useState<CatalogItem[]>([]);

  useEffect(() => {
    if (!open) {
      setName("");
      setSimilarItems([]);
      setLoading(false);
      setSimilarLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (name.trim().length < 3) {
      setSimilarItems([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSimilarLoading(true);
      try {
        const res = await findSimilarCatalogItemsAction(type, name);
        if (res.success && res.data) {
          setSimilarItems(res.data);
        }
      } catch (error) {
        console.error("Error finding similar items:", error);
      } finally {
        setSimilarLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, type]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await createCatalogItem(type, { name: name.trim() });
      if (res.success) {
        toast.success(`${title} creado correctamente`);
        onSuccess(res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error || `Error al crear ${title.toLowerCase()}`);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = (item: CatalogItem) => {
    onSuccess(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar {title}</DialogTitle>
          <DialogDescription>
            Ingrese el nombre del nuevo {title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="catalog-name">Nombre</Label>
            <Input
              id="catalog-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Ej. Nuevo ${title.toLowerCase()}`}
              autoFocus
            />
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
              <p className="text-xs text-muted-foreground">
                Revisa si el elemento que intentas crear ya existe:
              </p>
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
                {similarItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border text-sm"
                  >
                    <span className="truncate" title={item.name}>{item.name}</span>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !name.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
