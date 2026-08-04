"use client";

import { UsersTable } from "./users-table";
import { UsersStats } from "./users-stats";
import { UsersFilters } from "./users-filters";
import { UserListResponse } from "../types";
import { CreateUserDialog } from "./create-user-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UsersClientProps {
  data: UserListResponse;
}

export function UsersClient({ data }: UsersClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administración de cuentas, roles y acceso al sistema.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <UsersStats data={data} />
      
      <UsersFilters />
      
      <UsersTable data={data} />

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
