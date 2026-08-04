"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { setUserPassword } from "../actions";
import { UserListItem } from "../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem;
}

export function SetPasswordDialog({ open, onOpenChange, user }: SetPasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await setUserPassword({ userId: user.id, newPassword: password });
      if (res.success) {
        toast.success(`Contraseña actualizada para ${user.name}`);
        setPassword("");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Error al actualizar contraseña");
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
          <DialogTitle>Nueva Contraseña</DialogTitle>
          <DialogDescription>
            Establece una nueva contraseña para {user.name} ({user.email}).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la nueva contraseña"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Debe tener al menos 8 caracteres.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={loading || password.length < 8}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Contraseña
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
