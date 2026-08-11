"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
export type FilterSelectOption = { key: string; label: string; };
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useSavedFilters } from "@/shared/hooks/use-saved-filters";

interface PatientFiltersProps {
  companies: FilterSelectOption[];
  workplaces: FilterSelectOption[];
  workAreas: FilterSelectOption[];
  jobPositions: FilterSelectOption[];
}

export function PatientFilters({ companies, workplaces, workAreas, jobPositions }: PatientFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(searchParamValue);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamValue);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useSavedFilters("cookie_patients_filters");


  if (searchParamValue !== prevSearchParam) {
    setPrevSearchParam(searchParamValue);
    setSearchValue(searchParamValue);
  }

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }
      
      // Always reset to page 1 when filtering
      newSearchParams.set("page", "1");
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const saveFiltersCookie = (paramsString: string) => {
    document.cookie = `cookie_patients_filters=${paramsString}; path=/;`;
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const newParams = createQueryString({ [key]: value });
    saveFiltersCookie(newParams);
    router.push(`?${newParams}`);
  };

  const debouncedSearch = useDebounce((value: string) => {
    let newParams = "";
    if (value) {
      newParams = createQueryString({ search: value });
    } else {
      newParams = createQueryString({ search: null });
    }
    saveFiltersCookie(newParams);
    router.push(`?${newParams}`);
  }, 400);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "page" && searchParams.get(key)
  );

  const clearFilters = () => {
    setSearchValue("");
    const params = new URLSearchParams();
    const paramsString = params.toString();
    saveFiltersCookie(paramsString);
    router.push(`${pathname}?${paramsString}`);
    setShowMobileFilters(false);
  };

  const getLabel = (val: string | null, options: FilterSelectOption[], fallback: string) => {
    if (!val || val === "all") return fallback;
    const opt = options.find((o) => o.key === val);
    return opt ? opt.label : fallback;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full">
          <div className="flex items-center gap-2 w-full flex-1">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Buscar por DPI, nombres o apellidos del paciente..."
                aria-label="Buscar por DPI, nombres o apellidos del paciente"
                className="w-full pl-9 h-10 bg-transparent border-transparent focus-visible:ring-0 focus-visible:border-transparent rounded-xl shadow-none"
              />
            </div>
            <Button 
              variant={showMobileFilters ? "secondary" : "ghost"}
              className="md:hidden h-10 rounded-xl px-3 shrink-0 text-muted-foreground"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              aria-label={showMobileFilters ? "Ocultar filtros de búsqueda" : "Mostrar filtros de búsqueda"}
            >
              {showMobileFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            </Button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="hidden md:flex h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground w-full md:w-auto"
            >
              Limpiar
            </Button>
          )}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-2 pb-2 ${showMobileFilters ? "grid" : "hidden md:grid"}`}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-company" className="text-xs font-medium text-muted-foreground px-1">Empresa</label>
            <Select
              value={searchParams.get("company") || undefined}
              onValueChange={(val) => handleFilterChange("company", val === "all" ? null : val)}
            >
              <SelectTrigger id="filter-company" className="w-full h-10 rounded-2xl bg-input/50 border-transparent">
                <span className="flex flex-1 text-left truncate">
                  {getLabel(searchParams.get("company"), companies, "Todas las Empresas")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Empresas</SelectItem>
                {companies.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-workplace" className="text-xs font-medium text-muted-foreground px-1">Sede</label>
            <Select
              value={searchParams.get("workplace") || undefined}
              onValueChange={(val) => handleFilterChange("workplace", val === "all" ? null : val)}
            >
              <SelectTrigger id="filter-workplace" className="w-full h-10 rounded-2xl bg-input/50 border-transparent">
                <span className="flex flex-1 text-left truncate">
                  {getLabel(searchParams.get("workplace"), workplaces, "Todas las Sedes")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Sedes</SelectItem>
                {workplaces.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-workarea" className="text-xs font-medium text-muted-foreground px-1">Área de Trabajo</label>
            <Select
              value={searchParams.get("workArea") || undefined}
              onValueChange={(val) => handleFilterChange("workArea", val === "all" ? null : val)}
            >
              <SelectTrigger id="filter-workarea" className="w-full h-10 rounded-2xl bg-input/50 border-transparent">
                <span className="flex flex-1 text-left truncate">
                  {getLabel(searchParams.get("workArea"), workAreas, "Todas las Áreas")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Áreas</SelectItem>
                {workAreas.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-jobposition" className="text-xs font-medium text-muted-foreground px-1">Puesto Laboral</label>
            <Select
              value={searchParams.get("jobPosition") || undefined}
              onValueChange={(val) => handleFilterChange("jobPosition", val === "all" ? null : val)}
            >
              <SelectTrigger id="filter-jobposition" className="w-full h-10 rounded-2xl bg-input/50 border-transparent">
                <span className="flex flex-1 text-left truncate">
                  {getLabel(searchParams.get("jobPosition"), jobPositions, "Todos los Puestos")}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Puestos</SelectItem>
                {jobPositions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-col gap-1.5 justify-end sm:col-span-2 lg:hidden mt-2">
              <Button 
                variant="ghost" 
                onClick={clearFilters}
                className="h-10 px-4 rounded-xl w-full text-muted-foreground hover:text-foreground"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
