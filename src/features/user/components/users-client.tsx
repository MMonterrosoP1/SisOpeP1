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
    <>
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <UsersStats data={data} />
      
      <UsersFilters />
      
      <UsersTable data={data} />

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
