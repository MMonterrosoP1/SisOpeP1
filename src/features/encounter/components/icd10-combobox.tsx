"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { searchIcd10Action } from "@/features/catalog/actions";

export type Icd10Option = {
  id: number;
  code: string;
  description: string;
};

type Icd10ComboboxProps = {
  id: string;
  value: number | null;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  onValueChange: (value: number | null) => void;
};

export function Icd10Combobox({
  id,
  value,
  placeholder = "Seleccione un diagnóstico",
  searchPlaceholder = "Buscar por código o nombre...",
  emptyMessage = "No se encontraron resultados.",
  disabled,
  invalid,
  className,
  onValueChange,
}: Icd10ComboboxProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Icd10Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Icd10Option | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      if (!query && selectedOption) {
        setOptions([selectedOption]);
      } else {
        setOptions(selectedOption ? [selectedOption] : []);
      }
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchIcd10Action(query);
        if (res.success) {
          const results = res.data as Icd10Option[];
          if (selectedOption && !results.some(r => r.id === selectedOption.id)) {
            setOptions([selectedOption, ...results]);
          } else {
            setOptions(results);
          }
        }
      } catch (error) {
        console.error("Error searching ICD10:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedOption]);

  useEffect(() => {
    if (value === null) {
      setSelectedOption(null);
    }
  }, [value]);

  return (
    <ComboboxPrimitive.Root
      items={options}
      value={selectedOption}
      disabled={disabled}
      openOnInputClick
      autoHighlight
      itemToStringLabel={(item) => item ? `${item.code} - ${item.description}` : ""}
      itemToStringValue={(item) => item ? String(item.id) : ""}
      isItemEqualToValue={(item, selected) => item.id === selected.id}
      onValueChange={(selected) => {
        setSelectedOption(selected);
        onValueChange(selected?.id ?? null);
      }}
      onInputValueChange={(val) => {
        setQuery(val);
      }}
    >
      <ComboboxPrimitive.InputGroup
        className={cn(
          "relative h-10 w-full rounded-2xl border border-transparent bg-input/50 pr-9 transition-[color,box-shadow] duration-200 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
          invalid && "border-destructive ring-3 ring-destructive/20",
          className
        )}
      >
        <ComboboxPrimitive.Input
          id={id}
          placeholder={searchPlaceholder ?? placeholder}
          className="h-full w-full border-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <ComboboxPrimitive.Trigger
          aria-label="Abrir opciones"
          className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronsUpDown className="h-4 w-4" />
          )}
        </ComboboxPrimitive.Trigger>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner className="isolate z-50 outline-none" sideOffset={4}>
          <ComboboxPrimitive.Popup className="z-50 w-[var(--anchor-width)] overflow-hidden rounded-2xl bg-popover/90 p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/5 backdrop-blur-2xl backdrop-saturate-150">
            <ComboboxPrimitive.Empty>
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {query.length < 2 ? "Escribe al menos 2 letras para buscar..." : emptyMessage}
              </div>
            </ComboboxPrimitive.Empty>

            <ComboboxPrimitive.List className="max-h-[min(18rem,var(--available-height))] overflow-y-auto py-1 outline-0 data-empty:p-0">
              {(item: Icd10Option) => (
                <ComboboxPrimitive.Item
                  key={item.id}
                  value={item}
                  className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-xl px-2 py-2 text-sm outline-hidden select-none data-highlighted:bg-muted"
                >
                  <ComboboxPrimitive.ItemIndicator className="col-start-1">
                    <Check className="h-4 w-4" />
                  </ComboboxPrimitive.ItemIndicator>
                  <span className="col-start-2 truncate">{item.code} - {item.description}</span>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
