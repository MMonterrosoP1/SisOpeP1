"use client";

import { useState, useMemo, useRef } from "react";
import { Search, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type AllergenOption = {
  id: number;
  name: string;
  allergyCategory?: { name: string };
};

type AllergenSearchModalProps = {
  id: string;
  value: number | null;
  options: AllergenOption[];
  invalid?: boolean;
  className?: string;
  onValueChange: (value: number | null) => void;
};

export function AllergenSearchModal({
  id,
  value,
  options,
  invalid,
  className,
  onValueChange,
}: AllergenSearchModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const selectedItem = useMemo(() => options.find((o) => o.id === value), [options, value]);

  const filteredOptions = useMemo(() => {
    const term = search.toLowerCase().trim();
    
    // Filter
    const filtered = term 
      ? options.filter((o) => o.name.toLowerCase().includes(term) || (o.allergyCategory?.name || "otras").toLowerCase().includes(term))
      : options;

    // Sort by category, then by name
    return filtered.sort((a, b) => {
      const catA = (a.allergyCategory?.name || "Otras").toUpperCase();
      const catB = (b.allergyCategory?.name || "Otras").toUpperCase();
      const catCompare = catA.localeCompare(catB);
      if (catCompare !== 0) return catCompare;
      return a.name.localeCompare(b.name);
    });
  }, [options, search]);

  const handleSelect = (itemId: number) => {
    onValueChange(itemId);
    setOpen(false);
  };

  // Effect to clear search when closed
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setTimeout(() => setSearch(""), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            className={cn(
              "w-full justify-between font-normal",
              invalid && "border-destructive ring-1 ring-destructive",
              !selectedItem && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <span className="truncate">
          {selectedItem?.name || "Seleccione un alérgeno..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden" showCloseButton={true}>
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>Catálogo de Alérgenos</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b bg-muted/20 shrink-0">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alérgeno o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-0 min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-background z-10 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-primary underline">Categoría</th>
                <th className="px-6 py-4 font-semibold text-primary underline">Nombre</th>
              </tr>
            </thead>
            <tbody>
              {filteredOptions.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                    No hay resultados para "{search}"
                  </td>
                </tr>
              ) : (
                filteredOptions.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "border-b cursor-pointer transition-colors hover:bg-muted/50 even:bg-muted/30",
                      value === item.id ? "bg-primary/10 border-primary" : "bg-background"
                    )}
                  >
                    <td className="px-6 py-3 text-muted-foreground">
                      {item.allergyCategory?.name || "Otras"}
                    </td>
                    <td className="px-6 py-3 font-medium flex items-center justify-between">
                      <span className="hover:underline">{item.name}</span>
                      {value === item.id && <Check className="h-4 w-4 text-primary" />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
