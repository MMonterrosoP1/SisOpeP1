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
import { Button } from "@/components/ui/button";
import { useSavedFilters } from "@/shared/hooks/use-saved-filters";

export function CertificatesFilters({ currentPractitionerId }: { currentPractitionerId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get("search") ?? "";
  const [searchValue, setSearchValue] = useState(searchParamValue);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParamValue);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useSavedFilters("cookie_certificates_filters");


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
    document.cookie = `cookie_certificates_filters=${paramsString}; path=/;`;
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const newParams = createQueryString({ [key]: value });
    saveFiltersCookie(newParams);
    router.push(`?${newParams}`);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== "page" && searchParams.get(key)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-center gap-3 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar paciente por nombre o documento..."
              className="w-full pl-9 h-10 bg-transparent border-transparent focus-visible:ring-0 focus-visible:border-transparent rounded-xl shadow-none placeholder:text-foreground/60"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFilterChange("search", searchValue);
                }
              }}
            />
          </div>
          <Button 
            variant={showMobileFilters ? "secondary" : "outline"}
            className="md:hidden h-10 rounded-xl px-3 shrink-0"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            {showMobileFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
          </Button>
        </div>

        <div className={`flex flex-col md:flex-row items-center gap-3 w-full md:w-auto ${showMobileFilters ? "flex" : "hidden md:flex"}`}>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-medium text-foreground/80 px-1 hidden md:block whitespace-nowrap">Tipo:</label>
            <Select
              value={searchParams.get("type") || "all"}
              onValueChange={(val) => handleFilterChange("type", val === "all" ? null : val)}
            >
              <SelectTrigger className="w-full md:w-[150px] h-10 rounded-2xl bg-input/50 border-transparent">
                <span className="flex flex-1 text-left truncate text-foreground/90">
                  {searchParams.get("type") === "MEDICAL_CERTIFICATE" 
                    ? "Médica" 
                    : searchParams.get("type") === "ILLNESS_CERTIFICATE" 
                      ? "Enfermedad" 
                      : "Todos los Tipos"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="MEDICAL_CERTIFICATE">Médica</SelectItem>
                <SelectItem value="ILLNESS_CERTIFICATE">Enfermedad</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-medium text-foreground/80 px-1 hidden md:block whitespace-nowrap">Médico:</label>
            <Select
              value={currentPractitionerId === "all" ? "all" : "mine"}
              onValueChange={(val) => handleFilterChange("practitionerId", val === "all" ? "all" : null)}
            >
              <SelectTrigger className="w-full md:w-[180px] h-10 rounded-2xl bg-input/50 border-transparent">
                <span className="flex flex-1 text-left truncate text-foreground/90">
                  {currentPractitionerId === "all" ? "Todos los Médicos" : "Mis Constancias"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">Mis Constancias</SelectItem>
                <SelectItem value="all">Todos los Médicos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={() => {
                saveFiltersCookie("");
                router.push("/certificates");
                setShowMobileFilters(false);
              }}
              className="h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground w-full md:w-auto"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
