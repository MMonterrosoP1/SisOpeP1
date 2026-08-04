"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2, Search, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
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


export type Icd10Option = {
  id: number;
  code: string;
  description: string;
};

type Icd10SearchModalProps = {
  id: string;
  value: number | null;
  invalid?: boolean;
  className?: string;
  onValueChange: (value: number | null) => void;
};

export function Icd10SearchModal({
  id,
  value,
  invalid,
  className,
  onValueChange,
}: Icd10SearchModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Icd10Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  // Clear selected label if value is cleared externally
  useEffect(() => {
    if (value === null) {
      setSelectedLabel(null);
    }
  }, [value]);

  // Debounced search effect
  useEffect(() => {
    if (!open) return; // Only search when modal is open

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const req = await fetch(`/api/search/icd10?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
        const res = await req.json();
        if (res.success) {
          setResults(res.data.items as Icd10Option[]);
          setTotalCount(res.data.totalCount as number);
        }
      } catch (error) {
        console.error("Error searching ICD10:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, page, open]);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const handleSelect = useCallback((item: Icd10Option) => {
    setSelectedLabel(`${item.code} - ${item.description}`);
    onValueChange(item.id);
    setOpen(false);
  }, [onValueChange]);

  // Virtualization setup
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Estimated row height
    overscan: 5,
  });

  // Effect to reset query when modal is closed
  useEffect(() => {
    if (!open) {
      setQuery("");
      setPage(1);
      setResults([]);
      setTotalCount(0);
    }
  }, [open]);

  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Highlight matched text
  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search.trim()})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.trim().toLowerCase() ? 
            <strong key={i} className="text-primary font-bold">{part}</strong> : 
            part
        )}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              !selectedLabel && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <span className="truncate">
          {selectedLabel || "Seleccione un diagnóstico..."}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden" showCloseButton={true}>
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Búsqueda Avanzada CIE-10</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código (ej. E11) o descripción..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-11"
                autoFocus
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {totalCount > 0 ? (
                <>Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} de {totalCount} resultados</>
              ) : (
                <>Sin resultados</>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {results.length === 0 && !loading && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {query.length > 0 ? `No se encontraron resultados para "${query}"` : "No hay diagnósticos disponibles."}
            </div>
          )}

          {results.length > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
              <div className="grid grid-cols-[80px_1fr_80px] gap-4 px-4 py-3 border-b bg-muted/50 font-medium text-sm text-muted-foreground">
                <div>Código</div>
                <div>Descripción</div>
                <div className="text-right">Acción</div>
              </div>
              
              <div 
                ref={parentRef} 
                className="flex-1 overflow-auto"
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const item = results[virtualRow.index];
                    return (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="grid grid-cols-[80px_1fr_80px] gap-4 px-4 py-2 items-center cursor-pointer hover:bg-muted/50 transition-colors border-b"
                        onClick={() => handleSelect(item)}
                      >
                        <div className="font-medium text-sm">
                          {highlightMatch(item.code, query)}
                        </div>
                        <div className="text-sm leading-relaxed" title={item.description}>
                          {highlightMatch(item.description, query)}
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="ghost" onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(item);
                          }}>
                            Elegir
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
