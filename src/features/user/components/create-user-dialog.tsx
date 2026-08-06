"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createUser } from "../actions";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, Sex } from "@/shared/schemas/enums";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER" as UserRole,
    // Doctor specific fields
    givenNames: "",
    familyNames: "",
    sex: "" as Sex | "",
    preamble: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.email) newErrors.email = "Correo electrónico inválido";
    if (formData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    
    if (formData.role === "DOCTOR") {
      if (!formData.givenNames) newErrors.givenNames = "Los nombres son obligatorios";
      if (!formData.familyNames) newErrors.familyNames = "Los apellidos son obligatorios";
      if (!formData.sex) newErrors.sex = "El sexo es obligatorio";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);
    try {
      const res = await createUser({
        ...formData,
        sex: formData.sex || undefined,
        preamble: formData.preamble || undefined,
      });
      
      if (res.success) {
        toast.success("Usuario creado exitosamente");
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "VIEWER",
          givenNames: "",
          familyNames: "",
          sex: "",
          preamble: "",
        });
        onOpenChange(false);
      } else {
        toast.error(res.error || "Error al crear usuario");
        if (res.fieldErrors) {
          const fieldErr: Record<string, string> = {};
          Object.entries(res.fieldErrors).forEach(([key, val]) => {
            fieldErr[key] = val[0];
          });
          setErrors(fieldErr);
        }
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Usuario</DialogTitle>
          <DialogDescription>
            Agrega un nuevo usuario al sistema. Se le otorgará acceso inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Display (Usuario)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Dr. Juan Pérez"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="juan@ejemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(val) => val && setFormData({ ...formData, role: val as UserRole })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          {formData.role === "DOCTOR" && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/50 mt-4">
              <h4 className="text-sm font-medium">Información Clínica (Requerida para Doctores)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="givenNames">Nombres Reales</Label>
                  <Input
                    id="givenNames"
                    value={formData.givenNames}
                    onChange={(e) => setFormData({ ...formData, givenNames: e.target.value })}
                  />
                  {errors.givenNames && (
                    <p className="text-sm text-destructive">{errors.givenNames}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="familyNames">Apellidos Reales</Label>
                  <Input
                    id="familyNames"
                    value={formData.familyNames}
                    onChange={(e) => setFormData({ ...formData, familyNames: e.target.value })}
                  />
                  {errors.familyNames && (
                    <p className="text-sm text-destructive">{errors.familyNames}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex">Sexo</Label>
                <Select
                  value={formData.sex}
                  onValueChange={(val) => setFormData({ ...formData, sex: val as Sex })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sex && (
                  <p className="text-sm text-destructive">{errors.sex}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preamble">Preámbulo (Títulos, Colegiado, etc.)</Label>
                <Textarea
                  id="preamble"
                  placeholder="Médico y Cirujano&#10;Col. 12345"
                  value={formData.preamble}
                  onChange={(e) => setFormData({ ...formData, preamble: e.target.value })}
                  rows={3}
                />
              </div>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Usuario
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
