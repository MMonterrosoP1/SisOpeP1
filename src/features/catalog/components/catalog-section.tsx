"use client";

import { useState } from "react";
import { Plus, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CatalogType } from "../types";
import { updateCatalogItem, toggleCatalogActive } from "../actions";
import { toast } from "sonner";
import { CatalogQuickAddDialog } from "./catalog-quick-add-dialog";

export interface CatalogItem {
  id: number;
  name: string;
  active?: boolean;
  acronym?: string;
}

interface CatalogSectionProps {
  type: CatalogType;
  title: string;
  description?: string;
  items: CatalogItem[];
  hasActiveField?: boolean;
  /** Optional custom add dialog. Receives open state and a close callback. Defaults to CatalogQuickAddDialog. */
  renderAddDialog?: (open: boolean, onClose: () => void) => React.ReactNode;
  /** Optional custom edit dialog. When provided, the edit icon opens it instead of the inline input. */
  renderEditDialog?: (item: CatalogItem, onClose: () => void) => React.ReactNode;
}

export function CatalogSection({ type, title, description, items, hasActiveField = true, renderAddDialog, renderEditDialog }: CatalogSectionProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogItem, setEditDialogItem] = useState<CatalogItem | null>(null);

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) return;
    
    setIsUpdating(id);
    try {
      const res = await updateCatalogItem(type, id, { name: editName.trim() });
      if (res.success) {
        toast.success("Catálogo actualizado correctamente");
        setEditingId(null);
      } else {
        toast.error(res.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error al actualizar el catálogo");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    setIsUpdating(id);
    try {
      const res = await toggleCatalogActive(type, id);
      if (res.success) {
        toast.success(`Catálogo ${currentActive ? "desactivado" : "activado"}`);
      } else {
        toast.error(res.error || "Error al cambiar el estado");
      }
    } catch (error) {
      toast.error("Error al cambiar el estado");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="flex flex-col border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b gap-4 bg-muted/20">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="text-xs font-normal">
              {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
            </Badge>
          </h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Agregar
        </Button>
      </div>

      {/* List */}
      <div className="flex flex-col max-h-[400px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
            <p>No hay elementos registrados en este catálogo.</p>
            <Button variant="link" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
              Crear el primero
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 sm:px-4 hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(item.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleSaveEdit(item.id)} disabled={isUpdating === item.id}>
                        {isUpdating === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={cancelEdit} disabled={isUpdating === item.id}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-sm truncate">{item.name}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {editingId !== item.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => renderEditDialog ? setEditDialogItem(item) : startEdit(item)}
                      disabled={isUpdating === item.id}
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  
                  {hasActiveField && item.active !== undefined && (
                    <div className="flex items-center gap-2" title={item.active ? "Desactivar" : "Activar"}>
                      <Switch
                        checked={item.active}
                        onCheckedChange={() => handleToggleActive(item.id, item.active!)}
                        disabled={isUpdating === item.id || editingId === item.id}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {renderAddDialog ? (
        renderAddDialog(isAddDialogOpen, () => setIsAddDialogOpen(false))
      ) : (
        <CatalogQuickAddDialog
          type={type}
          title={title}
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={() => {}}
        />
      )}

      {renderEditDialog && editDialogItem &&
        renderEditDialog(editDialogItem, () => setEditDialogItem(null))
      }
    </div>
  );
}
