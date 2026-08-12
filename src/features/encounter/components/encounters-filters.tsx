"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSavedFilters } from "@/shared/hooks/use-saved-filters";

interface EncountersFiltersProps {
  currentPractitionerId?: string;
  currentSearch?: string;
}

export function EncountersFilters({ currentPractitionerId, currentSearch = "" }: EncountersFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [prevSearchParam, setPrevSearchParam] = useState(currentSearch);

  useSavedFilters("cookie_encounters_filters");


  if (currentSearch !== prevSearchParam) {
    setPrevSearchParam(currentSearch);
    setSearchTerm(currentSearch);
  }

  const saveFiltersCookie = (paramsString: string) => {
    document.cookie = `cookie_encounters_filters=${paramsString}; path=/;`;
  };

  const debouncedSearch = useDebounce((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1 on new search
    const paramsString = params.toString();
    saveFiltersCookie(paramsString);
    router.push(`${pathname}?${paramsString}`);
  }, 400);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== null && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    const paramsString = params.toString();
    saveFiltersCookie(paramsString);
    router.push(`${pathname}?${paramsString}`);
  };

  const hasActiveFilters = !!searchParams.get("search") || searchParams.get("practitionerId") === "all";

  const clearFilters = () => {
    setSearchTerm("");
    const params = new URLSearchParams();
    // Default for practitioner is "mine", which means no param.
    const paramsString = params.toString();
    saveFiltersCookie(paramsString);
    router.push(`${pathname}?${paramsString}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-center gap-3 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
          <Input
            placeholder="Buscar por DPI, nombres o apellidos del paciente..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 h-10 bg-transparent border-transparent focus-visible:ring-0 focus-visible:border-transparent rounded-xl shadow-none placeholder:text-foreground/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-medium text-foreground/80 px-1 hidden md:block whitespace-nowrap">Médico:</label>
          <Select
            value={currentPractitionerId === "all" ? "all" : "mine"}
            onValueChange={(val) => handleFilterChange("practitionerId", val === "all" ? "all" : null)}
          >
            <SelectTrigger className="w-full md:w-[180px] h-10 rounded-2xl bg-input/50 border-transparent">
              <span className="flex flex-1 text-left truncate text-foreground/90">
                {currentPractitionerId === "all" ? "Todos los médicos" : "Mis consultas"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mine">Mis consultas</SelectItem>
              <SelectItem value="all">Todos los médicos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground w-full md:w-auto"
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
