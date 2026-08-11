"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Calendar as CalendarIcon, Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSavedFilters } from "@/shared/hooks/use-saved-filters";

const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "EXPORT"
];

// Common entity types to show in the dropdown (you can add more)
const COMMON_ENTITIES = [
  "user",
  "patient",
  "encounter",
  "document",
  "company",
  "workplace"
];

export function AuditFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State from URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [action, setAction] = useState(searchParams.get("action") || "all");
  const [entityType, setEntityType] = useState(searchParams.get("entityType") || "all");
  
  // Date state
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : undefined,
    to: searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : undefined,
  });

  useSavedFilters("cookie_audit_filters");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const saveFiltersCookie = (paramsString: string) => {
    document.cookie = `cookie_audit_filters=${paramsString}; path=/;`;
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 on new filter
    params.set("page", "1");

    if (search) params.set("search", search);
    else params.delete("search");

    if (action && action !== "all") params.set("action", action);
    else params.delete("action");

    if (entityType && entityType !== "all") params.set("entityType", entityType);
    else params.delete("entityType");

    if (date.from) params.set("startDate", date.from.toISOString());
    else params.delete("startDate");

    if (date.to) params.set("endDate", date.to.toISOString());
    else params.delete("endDate");

    const paramsString = params.toString();
    saveFiltersCookie(paramsString);
    router.push(`${pathname}?${paramsString}`);
  };

  const resetFilters = () => {
    setSearch("");
    setAction("all");
    setEntityType("all");
    setDate({ from: undefined, to: undefined });
    saveFiltersCookie("");
    router.push(pathname);
  };

  const activeFilterCount = 
    (search ? 1 : 0) + 
    (action !== "all" ? 1 : 0) + 
    (entityType !== "all" ? 1 : 0) + 
    (date.from || date.to ? 1 : 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar en descripción..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Action Select */}
        <Select value={action} onValueChange={(val) => setAction(val || "all")}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            {AUDIT_ACTIONS.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Entity Select */}
        <Select value={entityType} onValueChange={(val) => setEntityType(val || "all")}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Entidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las entidades</SelectItem>
            {COMMON_ENTITIES.map(e => (
              <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Popover */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              />
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: es })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: es })
              )
            ) : (
              <span>Rango de fechas</span>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={{ from: date.from, to: date.to }}
              onSelect={(range: any) => setDate(range || { from: undefined, to: undefined })}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>

        {/* Apply Button */}
        <Button type="submit" className="w-full sm:w-auto">
          Aplicar
        </Button>
      </form>
    </div>
  );
}
