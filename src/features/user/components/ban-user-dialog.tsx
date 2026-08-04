"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { banUser, unbanUser } from "../actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem;
}

export function BanUserDialog({ open, onOpenChange, user }: BanUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<string>("0"); // 0 = permanent

  const handleBan = async () => {
    setLoading(true);
    try {
      const expiresIn = duration === "0" ? undefined : parseInt(duration, 10);
      const res = await banUser({ 
        userId: user.id, 
        banReason: reason || undefined, 
        banExpiresIn: expiresIn 
      });
      
      if (res.success) {
        toast.success(`${user.name} ha sido baneado`);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Error al banear usuario");
      }
    } catch (e) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    setLoading(true);
    try {
      const res = await unbanUser(user.id);
      
      if (res.success) {
        toast.success(`El ban de ${user.name} ha sido removido`);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Error al desbanear usuario");
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
          <DialogTitle>{user.banned ? "Remover Ban" : "Banear Usuario"}</DialogTitle>
          <DialogDescription>
            {user.banned 
              ? `¿Estás seguro que deseas restaurar el acceso a ${user.name}?` 
              : `Esto impedirá que ${user.name} inicie sesión y revocará todas sus sesiones activas.`
            }
          </DialogDescription>
        </DialogHeader>

        {!user.banned && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Razón (Opcional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Violación de términos, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración</Label>
              <Select value={duration} onValueChange={(val) => val && setDuration(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Permanente</SelectItem>
                  <SelectItem value="86400">1 Día</SelectItem>
                  <SelectItem value="604800">7 Días</SelectItem>
                  <SelectItem value="2592000">30 Días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {user.banned && user.banReason && (
          <div className="py-4 space-y-2">
            <Label className="text-muted-foreground">Razón actual del ban:</Label>
            <p className="text-sm font-medium">{user.banReason}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={user.banned ? handleUnban : handleBan} 
            variant={user.banned ? "default" : "destructive"}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user.banned ? "Remover Ban" : "Banear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
