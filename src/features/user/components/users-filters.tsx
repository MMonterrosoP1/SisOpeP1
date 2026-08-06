"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/shared/hooks/use-debounce";

export function UsersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "1"); // Reset pagination on new filter
      return params.toString();
    },
    [searchParams]
  );

  const saveFiltersCookie = (paramsString: string) => {
    document.cookie = `cookie_users_filters=${paramsString}; path=/;`;
  };

  const debouncedSearch = useDebounce((value: string) => {
    const paramsString = createQueryString("search", value);
    saveFiltersCookie(paramsString);
    router.push(`${pathname}?${paramsString}`);
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const clearFilters = () => {
    setSearch("");
    saveFiltersCookie("");
    router.push(pathname);
  };

  const currentRole = searchParams.get("role") || "ALL";
  const currentStatus = searchParams.get("status") || "ALL";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          className="pl-9"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex gap-4 w-full sm:w-auto">
        <Select
          value={currentRole}
          onValueChange={(val) => {
            const paramsString = createQueryString("role", val === "ALL" || !val ? "" : val);
            saveFiltersCookie(paramsString);
            router.push(`${pathname}?${paramsString}`);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="DOCTOR">Doctor</SelectItem>
            <SelectItem value="VIEWER">Viewer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentStatus}
          onValueChange={(val) => {
            const paramsString = createQueryString("status", val === "ALL" || !val ? "" : val);
            saveFiltersCookie(paramsString);
            router.push(`${pathname}?${paramsString}`);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="ACTIVE">Activo</SelectItem>
            <SelectItem value="INACTIVE">Inactivo</SelectItem>
            <SelectItem value="BANNED">Baneado</SelectItem>
          </SelectContent>
        </Select>

        {(search || currentRole !== "ALL" || currentStatus !== "ALL") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            title="Limpiar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
