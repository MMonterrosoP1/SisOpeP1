"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Plus, Edit2, Trash2, LogIn } from "lucide-react";

interface AuditStatsProps {
  stats: {
    totalToday: number;
    breakdown: {
      creates: number;
      updates: number;
      deletes: number;
      logins: number;
    };
  };
}

export function AuditStats({ stats }: AuditStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Eventos Hoy</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalToday}</div>
          <p className="text-xs text-muted-foreground">
            Registros en las últimas 24h
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Creaciones</CardTitle>
          <Plus className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.breakdown.creates}</div>
          <p className="text-xs text-muted-foreground">
            Registros nuevos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actualizaciones</CardTitle>
          <Edit2 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{stats.breakdown.updates}</div>
          <p className="text-xs text-muted-foreground">
            Registros modificados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eliminaciones</CardTitle>
          <Trash2 className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{stats.breakdown.deletes}</div>
          <p className="text-xs text-muted-foreground">
            Registros eliminados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Logins</CardTitle>
          <LogIn className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">{stats.breakdown.logins}</div>
          <p className="text-xs text-muted-foreground">
            Inicios de sesión
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
