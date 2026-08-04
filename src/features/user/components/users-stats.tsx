"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, ShieldAlert } from "lucide-react";
import { UserListResponse } from "../types";

interface UsersStatsProps {
  data: UserListResponse;
}

export function UsersStats({ data }: UsersStatsProps) {
  const total = data.total;
  
  // These are stats based on the current fetched data.
  // If paginated, this only reflects the current page.
  // For global stats, we'd need a separate query like audit stats, but for now this is okay.
  // Let's assume total represents total matching the filter.
  // Actually, we can just calculate stats for the currently visible users to give some context, 
  // or if we want global stats, we would need a separate `getUsersStats` query.
  // For simplicity, we'll just show the total count, active count, banned count from the current array.
  // It's a rough approximation if paginated.
  
  const activeCount = data.users.filter(u => u.active && !u.banned).length;
  const bannedCount = data.users.filter(u => u.banned).length;
  const adminCount = data.users.filter(u => u.role === "ADMIN").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          <UserCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">En esta página</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          <ShieldAlert className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{adminCount}</div>
          <p className="text-xs text-muted-foreground">En esta página</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Baneados</CardTitle>
          <UserX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bannedCount}</div>
          <p className="text-xs text-muted-foreground">En esta página</p>
        </CardContent>
      </Card>
    </div>
  );
}
