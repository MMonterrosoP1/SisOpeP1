"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Plus } from "lucide-react";
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
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { createCatalogItem } from "../actions";
import { CatalogQuickAddDialog } from "./catalog-quick-add-dialog";
import { toast } from "sonner";

interface CatalogItem {
  id: number;
  name: string;
}

export interface AllergenItem extends CatalogItem {
  allergyCategory?: { name: string };
}

interface AllergenQuickAddDialogProps {
  open: boolean;
  allergyCategories: CatalogItem[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: AllergenItem) => void;
}

export function AllergenQuickAddDialog({
  open,
  allergyCategories: initialCategories,
  onOpenChange,
  onSuccess,
}: AllergenQuickAddDialogProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  const [localCategories, setLocalCategories] = useState<CatalogItem[]>(initialCategories);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarItems, setSimilarItems] = useState<AllergenItem[]>([]);

  useEffect(() => {
    // Keep local categories in sync if props change
    setLocalCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    if (!open) {
      setName("");
      setCategoryId("");
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

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setSimilarLoading(true);
      try {
        const res = await fetch(`/api/search/catalog?type=allergenCatalog&q=${encodeURIComponent(name)}`).then(r => r.json());
        if (!isCancelled && res.success && res.data) {
          setSimilarItems(res.data);
        }
      } catch (error) {
        if (!isCancelled) console.error("Error finding similar items:", error);
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
    if (!name.trim() || !categoryId) return;

    setLoading(true);
    try {
      const res = await createCatalogItem("allergenCatalog", { 
        name: name.trim(),
        allergyCategoryId: Number(categoryId)
      });
      
      if (res.success) {
        toast.success(`Alergeno creado correctamente`);
        onSuccess(res.data as AllergenItem);
        onOpenChange(false);
      } else {
        toast.error(res.error || `Error al crear alergeno`);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = (item: AllergenItem) => {
    onSuccess(item);
    onOpenChange(false);
  };

  const categoryOptions = localCategories.map(c => ({
    key: String(c.id),
    label: c.name
  }));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Alergia</DialogTitle>
            <DialogDescription>
              Ingrese el nombre y seleccione la categoría de la nueva alergia.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Categoría <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <ComboboxSelect
                    id="allergy-category"
                    value={categoryId}
                    options={categoryOptions}
                    placeholder="Seleccione categoría"
                    searchPlaceholder="Buscar categoría..."
                    onValueChange={setCategoryId}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowCategoryDialog(true)}
                  title="Agregar nueva categoría"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="catalog-name">Nombre <span className="text-destructive">*</span></Label>
              <Input
                id="catalog-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Penicilina"
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
                  Revisa si la alergia que intentas crear ya existe:
                </p>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
                  {similarItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border text-sm"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-medium" title={item.name}>{item.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          Categoría: {item.allergyCategory?.name || "Otras"}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUseExisting(item)}
                        className="h-7 text-xs flex-shrink-0 ml-2"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading || !name.trim() || !categoryId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CatalogQuickAddDialog
        type="allergyCategory"
        title="Categoría de Alergia"
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onSuccess={(newItem) => {
          setLocalCategories(prev => [...prev, newItem]);
          setCategoryId(String(newItem.id));
        }}
      />
    </>
  );
}
