"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxSelectOption = {
  key: string;
  label: string;
};

type ComboboxSelectProps = {
  id: string;
  value: string;
  options: ComboboxSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  onValueChange: (value: string) => void;
};

export function ComboboxSelect({
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
}: ComboboxSelectProps) {
  const selectedOption = options.find((option) => option.key === value) ?? null;

  return (
    <ComboboxPrimitive.Root
      items={options}
      value={selectedOption}
      disabled={disabled}
      openOnInputClick
      autoHighlight
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.key}
      isItemEqualToValue={(item, selected) => item.key === selected.key}
      onValueChange={(selected) => onValueChange(selected?.key ?? "")}
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
          <ChevronsUpDown className="h-4 w-4" />
        </ComboboxPrimitive.Trigger>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner className="isolate z-50 outline-none" sideOffset={4}>
          <ComboboxPrimitive.Popup className="z-50 w-[var(--anchor-width)] overflow-hidden rounded-2xl bg-popover/90 p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/5 backdrop-blur-2xl backdrop-saturate-150">
            <ComboboxPrimitive.Empty>
              <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
            </ComboboxPrimitive.Empty>

            <ComboboxPrimitive.List className="max-h-[min(18rem,var(--available-height))] overflow-y-auto py-1 outline-0 data-empty:p-0">
              {(item: ComboboxSelectOption) => (
                <ComboboxPrimitive.Item
                  key={item.key}
                  value={item}
                  className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-xl px-2 py-2 text-sm outline-hidden select-none data-highlighted:bg-muted"
                >
                  <ComboboxPrimitive.ItemIndicator className="col-start-1">
                    <Check className="h-4 w-4" />
                  </ComboboxPrimitive.ItemIndicator>
                  <span className="col-start-2 truncate">{item.label}</span>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
