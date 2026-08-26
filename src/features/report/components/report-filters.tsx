"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Workplace } from "@/generated/prisma/client";

interface ReportFiltersProps {
  workplaces: Workplace[];
  currentFilters: {
    year: string;
    month: string; // "annual" or "1"-"12"
    workplaceId: string; // "all" or id
  };
}

const MONTHS = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export function ReportFilters({ workplaces, currentFilters }: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 }, (_, i) => (2024 + i).toString());

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
      <Select
        value={currentFilters.year}
        onValueChange={(value) => updateFilters("year", value)}
      >
        <SelectTrigger className="w-full sm:w-[120px] bg-background">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.month}
        onValueChange={(value) => updateFilters("month", value)}
      >
        <SelectTrigger className="w-full sm:w-[160px] bg-background">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="annual" className="font-semibold">Acumulado Anual</SelectItem>
          {MONTHS.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.workplaceId}
        onValueChange={(value) => updateFilters("workplaceId", value)}
      >
        <SelectTrigger className="w-full sm:w-[200px] bg-background">
          <SelectValue placeholder="Lugar de Trabajo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-semibold">Todos los lugares</SelectItem>
          {workplaces.map((wp) => (
            <SelectItem key={wp.id} value={wp.id.toString()}>
              {wp.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
