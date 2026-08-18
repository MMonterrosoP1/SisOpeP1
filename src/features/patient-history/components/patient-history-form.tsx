"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icd10SearchModal } from "@/features/encounter/components/icd10-search-modal";
import { SimpleCatalogAddDialog } from "@/features/catalog/components/typed-catalog-dialogs";
import { upsertPatientHistoryAction } from "../actions";
import { CatalogType } from "@/features/catalog/types";

export type SelectOption = {
  key: string;
  label: string;
};

type CatalogItem = {
  id: number;
  name: string;
};

type QuickAddDialog = {
  open: boolean;
  catalogType: CatalogType;
  title: string;
  onSuccess: (item: CatalogItem) => void;
};

export function PatientHistoryForm({ 
  patientId, 
  catalogs, 
  initialData = {} 
}: { 
  patientId: number; 
  catalogs: Record<string, any[]>;
  initialData?: any;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultFormData = {
    allergies: initialData?.allergies || [],
    habits: initialData?.habits || [],
    exercises: initialData?.exercises?.length > 0 ? initialData.exercises : [],
    medicalHistory: initialData?.medicalHistory || [],
    surgicalHistory: initialData?.surgicalHistory || [],
    traumaHistory: initialData?.traumaHistory || [],
    familyHistory: initialData?.familyHistory || [],
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [localCatalogs, setLocalCatalogs] = useState<Record<string, CatalogItem[]>>(catalogs);
  const [quickAddDialog, setQuickAddDialog] = useState<QuickAddDialog>({
    open: false,
    catalogType: "allergenCatalog",
    title: "",
    onSuccess: () => {},
  });

  const getCatalogOptions = (catalogKey: string): SelectOption[] => {
    return (localCatalogs[catalogKey] ?? []).map((item) => ({ key: String(item.id), label: item.name }));
  };

  const handleArrayChange = (section: string, index: number, field: string, value: unknown) => {
    setFormData((prev: any) => {
      const arr = [...prev[section]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addArrayItem = (section: string, defaultItem: unknown) => {
    setFormData((prev: any) => ({ ...prev, [section]: [...prev[section], defaultItem] }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setFormData((prev: any) => ({ ...prev, [section]: prev[section].filter((_: any, i: number) => i !== index) }));
  };

  const toOptionalNumber = (val: string | number | null | undefined) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  };

  const openQuickAdd = (catalogType: CatalogType, title: string, catalogKey: string, fieldToUpdate?: { section: string; index: number; field: string }) => {
    setQuickAddDialog({
      open: true,
      catalogType,
      title,
      onSuccess: (item) => {
        setLocalCatalogs((prev) => ({
          ...prev,
          [catalogKey]: [...(prev[catalogKey] || []), item],
        }));
        if (fieldToUpdate) {
          handleArrayChange(fieldToUpdate.section, fieldToUpdate.index, fieldToUpdate.field, String(item.id));
        }
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        patientId,
        allergies: formData.allergies.map((a: any) => ({
          allergenCatalogId: toOptionalNumber(a.allergenCatalogId),
          detail: a.detail || undefined,
        })).filter((a: any) => a.allergenCatalogId),

        habits: formData.habits.map((h: any) => ({
          habitCatalogId: toOptionalNumber(h.habitCatalogId),
          duration: h.duration || undefined,
          quantity: toOptionalNumber(h.quantity),
          frequency: h.frequency || undefined,
          observations: h.observations || undefined,
        })).filter((h: any) => h.habitCatalogId),

        exercises: formData.exercises.map((e: any) => ({
          exerciseCatalogId: toOptionalNumber(e.exerciseCatalogId),
          timesPerWeek: toOptionalNumber(e.timesPerWeek)
        })).filter((e: any) => e.exerciseCatalogId),

        medicalHistory: formData.medicalHistory.map((m: any) => ({
          icd10CodeId: toOptionalNumber(m.icd10CodeId),
          observations: m.observations || undefined,
        })).filter((m: any) => m.icd10CodeId),

        surgicalHistory: formData.surgicalHistory.map((s: any) => ({
          surgicalProcedureId: toOptionalNumber(s.surgicalProcedureId),
          observations: s.observations || undefined,
        })).filter((s: any) => s.surgicalProcedureId),

        traumaHistory: formData.traumaHistory.map((t: any) => ({
          icd10CodeId: toOptionalNumber(t.icd10CodeId),
          observations: t.observations || undefined,
        })).filter((t: any) => t.icd10CodeId),

        familyHistory: formData.familyHistory.map((f: any) => ({
          icd10CodeId: toOptionalNumber(f.icd10CodeId),
          observations: f.observations || undefined,
        })).filter((f: any) => f.icd10CodeId),
      };

      const result = await upsertPatientHistoryAction(payload);
      if (result.success) {
        toast.success("Antecedentes guardados exitosamente");
        router.push(`/patients/${patientId}`);
        router.refresh();
      } else {
        toast.error(result.error || "Error al guardar los antecedentes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 2. ANTECEDENTES Y ALERGIAS */}
      <Card>
        <CardHeader>
          <CardTitle>2. Antecedentes y Alergias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Allergies */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-base">Alergias</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("allergies", { allergenCatalogId: "", detail: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
            {formData.allergies.length === 0 && <p className="text-sm text-muted-foreground italic">No refiere alergias.</p>}
            {formData.allergies.map((allergy: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start border p-3 rounded-md bg-muted/20">
                <div className="space-y-1">
                  <Label>Tipo de Alergia <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={String(allergy.allergenCatalogId || "")} onValueChange={(val) => handleArrayChange("allergies", index, "allergenCatalogId", val)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                        <SelectContent>
                          {getCatalogOptions("allergenCatalog").map(opt => (
                            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      title="Agregar nuevo tipo de alergia"
                      onClick={() => openQuickAdd("allergenCatalog", "Tipo de alergia", "allergenCatalog", { section: "allergies", index, field: "allergenCatalogId" })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Detalle (Opcional)</Label>
                  <Input value={allergy.detail || ""} onChange={(e) => handleArrayChange("allergies", index, "detail", e.target.value)} placeholder="Ej. Penicilina" />
                </div>
                <div className="pt-6">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("allergies", index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          {/* Medical History */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-base">Antecedentes Médicos</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("medicalHistory", { icd10CodeId: null, observations: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
            {formData.medicalHistory.length === 0 && <p className="text-sm text-muted-foreground italic">No refiere antecedentes médicos.</p>}
            {formData.medicalHistory.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start border p-3 rounded-md bg-muted/20">
                <div className="space-y-1">
                  <Label>Diagnóstico (CIE-10) <span className="text-destructive">*</span></Label>
                  <Icd10SearchModal
                    id={`medical-history-icd10-${index}`}
                    value={item.icd10CodeId}
                    onValueChange={(val) => handleArrayChange("medicalHistory", index, "icd10CodeId", val)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Observaciones (Opcional)</Label>
                  <Input value={item.observations || ""} onChange={(e) => handleArrayChange("medicalHistory", index, "observations", e.target.value)} placeholder="Detalles, fecha aproximada..." />
                </div>
                <div className="pt-6">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("medicalHistory", index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          {/* Surgical History */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-base">Antecedentes Quirúrgicos</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("surgicalHistory", { surgicalProcedureId: "", observations: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
            {formData.surgicalHistory.length === 0 && <p className="text-sm text-muted-foreground italic">No refiere antecedentes quirúrgicos.</p>}
            {formData.surgicalHistory.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start border p-3 rounded-md bg-muted/20">
                <div className="space-y-1">
                  <Label>Procedimiento <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={String(item.surgicalProcedureId || "")} onValueChange={(val) => handleArrayChange("surgicalHistory", index, "surgicalProcedureId", val)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                        <SelectContent>
                          {getCatalogOptions("surgicalProcedure").map(opt => (
                            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      title="Agregar nuevo procedimiento quirúrgico"
                      onClick={() => openQuickAdd("surgicalProcedure", "Procedimiento quirúrgico", "surgicalProcedure", { section: "surgicalHistory", index, field: "surgicalProcedureId" })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Observaciones (Opcional)</Label>
                  <Input value={item.observations || ""} onChange={(e) => handleArrayChange("surgicalHistory", index, "observations", e.target.value)} placeholder="Detalles, fecha aproximada..." />
                </div>
                <div className="pt-6">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("surgicalHistory", index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          {/* Trauma History */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-base">Antecedentes Traumáticos</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("traumaHistory", { icd10CodeId: null, observations: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
            {formData.traumaHistory.length === 0 && <p className="text-sm text-muted-foreground italic">No refiere antecedentes traumáticos.</p>}
            {formData.traumaHistory.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start border p-3 rounded-md bg-muted/20">
                <div className="space-y-1">
                  <Label>Diagnóstico (CIE-10) <span className="text-destructive">*</span></Label>
                  <Icd10SearchModal
                    id={`trauma-history-icd10-${index}`}
                    value={item.icd10CodeId}
                    onValueChange={(val) => handleArrayChange("traumaHistory", index, "icd10CodeId", val)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Observaciones (Opcional)</Label>
                  <Input value={item.observations || ""} onChange={(e) => handleArrayChange("traumaHistory", index, "observations", e.target.value)} placeholder="Detalles, fecha aproximada..." />
                </div>
                <div className="pt-6">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("traumaHistory", index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          {/* Family History */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-base">Antecedentes Familiares</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("familyHistory", { icd10CodeId: null, observations: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
            {formData.familyHistory.length === 0 && <p className="text-sm text-muted-foreground italic">No refiere antecedentes familiares relevantes.</p>}
            {formData.familyHistory.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start border p-3 rounded-md bg-muted/20">
                <div className="space-y-1">
                  <Label>Enfermedad (CIE-10) <span className="text-destructive">*</span></Label>
                  <Icd10SearchModal
                    id={`family-history-icd10-${index}`}
                    value={item.icd10CodeId}
                    onValueChange={(val) => handleArrayChange("familyHistory", index, "icd10CodeId", val)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Parentesco / Observaciones (Opcional)</Label>
                  <Input value={item.observations || ""} onChange={(e) => handleArrayChange("familyHistory", index, "observations", e.target.value)} placeholder="Ej. Padre, Madre..." />
                </div>
                <div className="pt-6">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("familyHistory", index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. HABITOS Y ESTILO DE VIDA */}
      <Card>
        <CardHeader>
          <CardTitle>3. Hábitos y Estilo de Vida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-base">Hábitos (Alcohol, Tabaco, etc.)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("habits", { habitCatalogId: "", quantity: "", frequency: "", duration: "", observations: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Agregar Hábito
              </Button>
            </div>
            {formData.habits.length === 0 && <p className="text-sm text-muted-foreground italic">No refiere hábitos tóxicos.</p>}
            {formData.habits.map((habit: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-start border p-3 rounded-md bg-muted/20">
                <div className="space-y-1">
                  <Label>Hábito <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={String(habit.habitCatalogId || "")} onValueChange={(val) => handleArrayChange("habits", index, "habitCatalogId", val)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                        <SelectContent>
                          {getCatalogOptions("habitCatalog").map(opt => (
                            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      title="Agregar nuevo hábito"
                      onClick={() => openQuickAdd("habitCatalog", "Hábito", "habitCatalog", { section: "habits", index, field: "habitCatalogId" })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Cantidad/Frecuencia</Label>
                  <Input type="number" step="0.1" value={habit.quantity || ""} onChange={(e) => handleArrayChange("habits", index, "quantity", e.target.value)} placeholder="Cant..." />
                </div>
                <div className="space-y-1">
                  <Label>Frecuencia</Label>
                  <Select value={habit.frequency || ""} onValueChange={(val) => handleArrayChange("habits", index, "frequency", val)}>
                    <SelectTrigger><SelectValue placeholder="Periodo..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Diario</SelectItem>
                      <SelectItem value="WEEKLY">Semanal</SelectItem>
                      <SelectItem value="MONTHLY">Mensual</SelectItem>
                      <SelectItem value="OCCASIONAL">Ocasional</SelectItem>
                      <SelectItem value="FORMER">Ex-consumidor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Tiempo (Años/Meses)</Label>
                  <Input value={habit.duration || ""} onChange={(e) => handleArrayChange("habits", index, "duration", e.target.value)} placeholder="Ej. 5 años" />
                </div>
                <div className="pt-6">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("habits", index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-2" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-base">Actividad Física</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("exercises", { exerciseCatalogId: "", timesPerWeek: "" })}>
                <Plus className="w-4 h-4 mr-2" /> Agregar Ejercicio
              </Button>
            </div>
            
            {formData.exercises.length === 0 && (
              <p className="text-sm text-muted-foreground">No realiza actividad física.</p>
            )}

            {formData.exercises.map((exercise: any, index: number) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-end gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="w-full sm:w-1/2 space-y-1">
                  <Label>Tipo de Ejercicio</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select value={String(exercise.exerciseCatalogId || "")} onValueChange={(val) => handleArrayChange("exercises", index, "exerciseCatalogId", val)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                        <SelectContent>
                          {getCatalogOptions("exerciseCatalog").map(opt => (
                            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      title="Agregar nuevo tipo de ejercicio"
                      onClick={() => openQuickAdd("exerciseCatalog", "Tipo de ejercicio", "exerciseCatalog", { section: "exercises", index, field: "exerciseCatalogId" })}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-full sm:w-1/4 space-y-1">
                  <Label>Veces / Semana</Label>
                  <Input
                    type="number"
                    min="0"
                    max="28"
                    value={exercise.timesPerWeek || ""}
                    onChange={(e) => handleArrayChange("exercises", index, "timesPerWeek", e.target.value)}
                    placeholder="0-28"
                  />
                </div>
                <div className="pt-6">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("exercises", index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mt-6 sticky bottom-6 bg-background/95 p-4 rounded-lg shadow-sm border backdrop-blur-sm z-10">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Guardando..." : "Guardar Antecedentes"}
        </Button>
      </div>

      {/* Quick Add Dialog */}
      <SimpleCatalogAddDialog
        open={quickAddDialog.open}
        onOpenChange={(open) => setQuickAddDialog((prev) => ({ ...prev, open }))}
        catalogType={quickAddDialog.catalogType}
        title={quickAddDialog.title}
        onSuccess={(item) => {
          quickAddDialog.onSuccess(item);
        }}
      />
    </form>
  );
}
