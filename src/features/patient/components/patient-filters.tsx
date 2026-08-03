"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

interface PatientFiltersProps {
  companies: FilterSelectOption[];
  workplaces: FilterSelectOption[];
  workAreas: FilterSelectOption[];
  jobPositions: FilterSelectOption[];
}

export function PatientFilters({ companies, workplaces, workAreas, jobPositions }: PatientFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(searchParamValue);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamValue);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const handleFilterChange = (key: string, value: string | null) => {
    router.push(`?${createQueryString({ [key]: value })}`);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "page" && searchParams.get(key)
  );

  const getLabel = (val: string | null, options: FilterSelectOption[], fallback: string) => {
    if (!val || val === "all") return fallback;
    const opt = options.find((o) => o.key === val);
    return opt ? opt.label : fallback;
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg border flex flex-col gap-4">
      <div className="flex gap-2 w-full items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar paciente..."
            className="pl-10 h-10 rounded-2xl bg-input/50 border-transparent w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleFilterChange("search", searchValue);
              }
            }}
          />
        </div>
        <Button 
          variant={showMobileFilters ? "secondary" : "outline"}
          className="md:hidden h-10 rounded-2xl px-3 shrink-0"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          {showMobileFilters ? <X className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
          {showMobileFilters ? "Cerrar" : "Filtros"}
        </Button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${showMobileFilters ? "grid" : "hidden md:grid"}`}>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground px-1">Empresa</label>
          <Select
            value={searchParams.get("company") || undefined}
            onValueChange={(val) => handleFilterChange("company", val === "all" ? null : val)}
          >
            <SelectTrigger className="w-full h-10 rounded-2xl bg-input/50 border-transparent">
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
          <label className="text-xs font-medium text-muted-foreground px-1">Sede</label>
          <Select
            value={searchParams.get("workplace") || undefined}
            onValueChange={(val) => handleFilterChange("workplace", val === "all" ? null : val)}
          >
            <SelectTrigger className="w-full h-10 rounded-2xl bg-input/50 border-transparent">
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
          <label className="text-xs font-medium text-muted-foreground px-1">Área de Trabajo</label>
          <Select
            value={searchParams.get("workArea") || undefined}
            onValueChange={(val) => handleFilterChange("workArea", val === "all" ? null : val)}
          >
            <SelectTrigger className="w-full h-10 rounded-2xl bg-input/50 border-transparent">
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
          <label className="text-xs font-medium text-muted-foreground px-1">Puesto Laboral</label>
          <Select
            value={searchParams.get("jobPosition") || undefined}
            onValueChange={(val) => handleFilterChange("jobPosition", val === "all" ? null : val)}
          >
            <SelectTrigger className="w-full h-10 rounded-2xl bg-input/50 border-transparent">
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
          <div className="flex flex-col gap-1.5 justify-end lg:col-span-4 mt-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                router.push("/patients");
                setShowMobileFilters(false);
              }}
              className="h-10 px-4 text-xs rounded-2xl w-full md:w-auto self-end text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Limpiar todos los filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
