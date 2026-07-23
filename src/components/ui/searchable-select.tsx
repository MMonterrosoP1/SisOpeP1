"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type SearchableSelectOption = {
  key: string;
  label: string;
};

type SearchableSelectProps = {
  id: string;
  value: string;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  onValueChange: (value: string) => void;
};

export function SearchableSelect({
  id,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage = "No se encontraron resultados.",
  disabled,
  invalid,
  className,
  onValueChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((option) => option.key === value);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const handleSelect = (selectedKey: string) => {
    onValueChange(selectedKey);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Button
        id={id}
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "h-10 w-full justify-between rounded-2xl border-transparent bg-input/50 px-3 text-sm font-normal",
          !selectedOption && "text-muted-foreground",
          invalid && "border-destructive ring-3 ring-destructive/20",
          className
        )}
      >
        <span className="truncate text-left">{selectedOption?.label ?? placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Selecciona una opcion</DialogTitle>
            <DialogDescription>Busca y elige una opcion del catalogo.</DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder ?? "Escribe para buscar..."}
              className="h-10 pl-9"
            />
          </div>

          <div className="max-h-80 overflow-y-auto rounded-2xl border border-border/60 bg-background p-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option) => {
                  const isSelected = option.key === value;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelect(option.key)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                        isSelected && "bg-muted"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 text-primary",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
