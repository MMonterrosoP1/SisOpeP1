"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuditLogDto } from "../types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AuditDetailDialogProps {
  log: AuditLogDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailDialog({ log, open, onOpenChange }: AuditDetailDialogProps) {
  if (!log) return null;

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    LOGIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    LOGOUT: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    EXPORT: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  };

  const badgeClass = actionColors[log.action] || "bg-gray-100 text-gray-800";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-3">
              Detalle de Auditoría
              <Badge variant="outline" className={badgeClass}>
                {log.action}
              </Badge>
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Log ID: {log.id} • Registrado el {format(new Date(log.createdAt), "PPP 'a las' p", { locale: es })}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            
            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Entidad</p>
                <p className="font-medium capitalize">{log.entityType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">ID Entidad</p>
                <p className="font-medium">{log.entityId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Usuario</p>
                <p className="font-medium">{log.user.name}</p>
                <p className="text-xs text-muted-foreground truncate" title={log.user.email}>{log.user.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">IP / Origen</p>
                <p className="font-medium">{log.ipAddress || "N/A"}</p>
              </div>
            </div>

            {log.description && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Descripción</h4>
                <p className="text-sm text-foreground bg-muted p-3 rounded-md border border-border/50">
                  {log.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Data Diff Area */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                Datos
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Previous Data */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Estado Anterior</span>
                    {log.previousData && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400">
                        Eliminado/Anterior
                      </Badge>
                    )}
                  </div>
                  <div className="bg-[#1E1E1E] rounded-md p-4 overflow-auto border border-border h-[300px]">
                    {log.previousData ? (
                      <pre className="text-xs font-mono text-red-300">
                        {JSON.stringify(log.previousData, null, 2)}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                        Sin datos anteriores
                      </div>
                    )}
                  </div>
                </div>

                {/* New Data */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Estado Nuevo</span>
                    {log.newData && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400">
                        Agregado/Nuevo
                      </Badge>
                    )}
                  </div>
                  <div className="bg-[#1E1E1E] rounded-md p-4 overflow-auto border border-border h-[300px]">
                    {log.newData ? (
                      <pre className="text-xs font-mono text-green-300">
                        {JSON.stringify(log.newData, null, 2)}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                        Sin datos nuevos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {log.userAgent && (
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">User Agent: {log.userAgent}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
