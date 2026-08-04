"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreHorizontal, Shield, UserCog, UserX, UserCheck, Key, LogOut, ShieldAlert, MonitorPlay } from "lucide-react";
import { UserListItem, UserListResponse } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SetRoleDialog } from "./set-role-dialog";
import { BanUserDialog } from "./ban-user-dialog";
import { SetPasswordDialog } from "./set-password-dialog";
import { toast } from "sonner";
import { toggleUserActive, revokeAllUserSessions } from "../actions";
import { authClient } from "@/lib/auth-client";

interface UsersTableProps {
  data: UserListResponse;
}

export function UsersTable({ data }: UsersTableProps) {
  const { data: session } = authClient.useSession();
  
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const currentUserId = session?.user?.id;

  const handleToggleActive = async (user: UserListItem) => {
    if (user.id === currentUserId) return;
    
    const promise = toggleUserActive(user.id);
    toast.promise(promise, {
      loading: "Actualizando estado...",
      success: (res) => res.success ? "Estado actualizado" : `Error: ${res.error}`,
      error: "Error al actualizar estado",
    });
  };

  const handleRevokeSessions = async (user: UserListItem) => {
    if (user.id === currentUserId) return;
    if (!confirm(`¿Estás seguro de revocar todas las sesiones de ${user.name}?`)) return;

    const promise = revokeAllUserSessions(user.id);
    toast.promise(promise, {
      loading: "Revocando sesiones...",
      success: (res) => res.success ? "Sesiones revocadas" : `Error: ${res.error}`,
      error: "Error al revocar sesiones",
    });
  };

  const handleImpersonate = async (user: UserListItem) => {
    if (user.id === currentUserId) return;
    if (user.role === "ADMIN") {
      toast.error("No se puede impersonar a un administrador");
      return;
    }
    
    try {
      const { data, error } = await authClient.admin.impersonateUser({
        userId: user.id
      });
      if (error) {
        toast.error(error.message || "Error al impersonar");
      } else {
        toast.success(`Impersonando a ${user.name}`);
        window.location.href = "/dashboard";
      }
    } catch (e) {
      toast.error("Error inesperado");
    }
  };

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              data.users.map((user) => {
                const isSelf = user.id === currentUserId;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name} {isSelf && "(Tú)"}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {user.email} 
                            {user.emailVerified && <UserCheck className="w-3 h-3 text-green-500" />}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Baneado</Badge>
                      ) : user.active ? (
                        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">Activo</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              disabled={isSelf}
                              onClick={() => { setSelectedUser(user); setRoleDialogOpen(true); }}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Cambiar Rol
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              disabled={isSelf}
                              onClick={() => { setSelectedUser(user); setPasswordDialogOpen(true); }}
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Cambiar Contraseña
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              disabled={isSelf || user.role === "ADMIN"}
                              onClick={() => handleImpersonate(user)}
                            >
                              <MonitorPlay className="w-4 h-4 mr-2" />
                              Impersonar
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />

                            <DropdownMenuItem 
                              disabled={isSelf}
                              onClick={() => handleToggleActive(user)}
                            >
                              {user.active ? (
                                <><UserX className="w-4 h-4 mr-2" /> Desactivar</>
                              ) : (
                                <><UserCheck className="w-4 h-4 mr-2" /> Activar</>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem 
                              disabled={isSelf}
                              onClick={() => handleRevokeSessions(user)}
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Revocar Sesiones
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem 
                              disabled={isSelf}
                              className={user.banned ? "text-green-600 focus:text-green-600" : "text-destructive focus:text-destructive"}
                              onClick={() => { setSelectedUser(user); setBanDialogOpen(true); }}
                            >
                              {user.banned ? (
                                <><UserCheck className="w-4 h-4 mr-2" /> Desbanear</>
                              ) : (
                                <><ShieldAlert className="w-4 h-4 mr-2" /> Banear</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <>
          <SetRoleDialog 
            open={roleDialogOpen} 
            onOpenChange={setRoleDialogOpen} 
            user={selectedUser} 
          />
          <BanUserDialog 
            open={banDialogOpen} 
            onOpenChange={setBanDialogOpen} 
            user={selectedUser} 
          />
          <SetPasswordDialog 
            open={passwordDialogOpen} 
            onOpenChange={setPasswordDialogOpen} 
            user={selectedUser} 
          />
        </>
      )}
    </>
  );
}
