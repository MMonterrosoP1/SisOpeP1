"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuditLogDto, AuditLogPaginatedResponse } from "../types";
import { AuditDetailDialog } from "./audit-detail-dialog";
import { Eye, ChevronLeft, ChevronRight, FileJson } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface AuditTableProps {
  data: AuditLogPaginatedResponse;
}

export function AuditTable({ data }: AuditTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    UPDATE: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    DELETE: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    LOGIN: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    LOGOUT: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    EXPORT: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > data.totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const openDetail = (log: AuditLogDto) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No se encontraron registros de auditoría con los filtros actuales.
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((log) => (
                  <TableRow 
                    key={log.id} 
                    className="hover:bg-muted/50 cursor-pointer group transition-colors"
                    onClick={() => openDetail(log)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{format(new Date(log.createdAt), "dd MMM yyyy", { locale: es })}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(log.createdAt), "HH:mm:ss")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={log.user.image || undefined} />
                          <AvatarFallback className="text-[10px]">{getInitials(log.user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{log.user.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={actionColors[log.action] || "bg-gray-100 text-gray-800"}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="capitalize text-sm font-medium">{log.entityType}</span>
                        <span className="text-xs text-muted-foreground">ID: {log.entityId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {log.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(log);
                        }}
                      >
                        {(log.newData || log.previousData) ? (
                          <FileJson className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">Ver detalle</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium">{(data.page - 1) * data.limit + 1}</span> a{" "}
            <span className="font-medium">{Math.min(data.page * data.limit, data.total)}</span> de{" "}
            <span className="font-medium">{data.total}</span> resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm font-medium px-2">
              Página {data.page} de {data.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= data.totalPages}
              className="h-8 px-2"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <AuditDetailDialog 
        log={selectedLog} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
}
