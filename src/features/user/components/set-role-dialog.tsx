"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setUserRole } from "../actions";
import { UserListItem } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "@/shared/schemas/enums";

interface SetRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem;
}

export function SetRoleDialog({ open, onOpenChange, user }: SetRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(user.role);

  const onSubmit = async () => {
    if (role === user.role) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      const res = await setUserRole({ userId: user.id, role });
      if (res.success) {
        toast.success(`Rol de ${user.name} actualizado`);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Error al cambiar rol");
      }
    } catch (e) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar Rol</DialogTitle>
          <DialogDescription>
            Actualiza el nivel de acceso para {user.name} ({user.email}).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={role} onValueChange={(val) => setRole(val as UserRole)}>
            <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted cursor-pointer" onClick={() => setRole("ADMIN")}>
              <RadioGroupItem value="ADMIN" id="r-admin" />
              <Label htmlFor="r-admin" className="cursor-pointer">
                Administrador
                <p className="text-xs text-muted-foreground mt-1">Acceso total al sistema y gestión de usuarios.</p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted cursor-pointer" onClick={() => setRole("DOCTOR")}>
              <RadioGroupItem value="DOCTOR" id="r-doctor" />
              <Label htmlFor="r-doctor" className="cursor-pointer">
                Doctor
                <p className="text-xs text-muted-foreground mt-1">Gestión de pacientes y consultas.</p>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted cursor-pointer" onClick={() => setRole("VIEWER")}>
              <RadioGroupItem value="VIEWER" id="r-viewer" />
              <Label htmlFor="r-viewer" className="cursor-pointer">
                Viewer
                <p className="text-xs text-muted-foreground mt-1">Acceso de solo lectura al dashboard.</p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={loading || role === user.role}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
