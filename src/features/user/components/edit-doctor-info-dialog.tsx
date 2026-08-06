"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateDoctorInfo } from "../actions";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sex } from "@/shared/schemas/enums";

interface EditDoctorInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
}

export function EditDoctorInfoDialog({ open, onOpenChange, user }: EditDoctorInfoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    givenNames: "",
    familyNames: "",
    sex: "" as Sex | "",
    preamble: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && open) {
      // Intenta extraer nombres/apellidos del nombre de display temporalmente
      // si el backend aún no manda givenNames/familyNames completos.
      // Como solo requerimos `sex` y `preamble`, llenamos con defaults
      // pero requerimos que el usuario los modifique si faltan.
      const parts = user.name.split(" ");
      const defaultGiven = parts[0] || "";
      const defaultFamily = parts.slice(1).join(" ") || "";

      setFormData({
        givenNames: defaultGiven,
        familyNames: defaultFamily,
        sex: user.sex || "",
        preamble: user.preamble || "",
      });
      setErrors({});
    }
  }, [user, open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.givenNames) newErrors.givenNames = "Los nombres son obligatorios";
    if (!formData.familyNames) newErrors.familyNames = "Los apellidos son obligatorios";
    if (!formData.sex) newErrors.sex = "El sexo es obligatorio";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await updateDoctorInfo({
        userId: user.id,
        ...formData,
        sex: formData.sex || undefined,
        preamble: formData.preamble || undefined,
      });

      if (res.success) {
        toast.success("Información del médico actualizada exitosamente");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Error al actualizar información");
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

  if (!user || user.role !== "DOCTOR") return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Información Clínica de Médico</DialogTitle>
          <DialogDescription>
            Actualiza los datos personales y el preámbulo clínico de <strong>{user.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="givenNames">Nombres</Label>
              <Input
                id="givenNames"
                value={formData.givenNames}
                onChange={(e) => setFormData({ ...formData, givenNames: e.target.value })}
                aria-invalid={!!errors.givenNames}
                aria-describedby={errors.givenNames ? "givenNames-error" : undefined}
              />
              {errors.givenNames && (
                <p id="givenNames-error" role="alert" className="text-sm text-destructive">{errors.givenNames}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyNames">Apellidos</Label>
              <Input
                id="familyNames"
                value={formData.familyNames}
                onChange={(e) => setFormData({ ...formData, familyNames: e.target.value })}
                aria-invalid={!!errors.familyNames}
                aria-describedby={errors.familyNames ? "familyNames-error" : undefined}
              />
              {errors.familyNames && (
                <p id="familyNames-error" role="alert" className="text-sm text-destructive">{errors.familyNames}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sexo</Label>
            <Select
              value={formData.sex}
              onValueChange={(val) => setFormData({ ...formData, sex: val as Sex })}
            >
              <SelectTrigger id="sex" aria-invalid={!!errors.sex} aria-describedby={errors.sex ? "sex-error" : undefined}>
                <SelectValue placeholder="Selecciona el sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Masculino</SelectItem>
                <SelectItem value="FEMALE">Femenino</SelectItem>
              </SelectContent>
            </Select>
            {errors.sex && (
              <p id="sex-error" role="alert" className="text-sm text-destructive">{errors.sex}</p>
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
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
