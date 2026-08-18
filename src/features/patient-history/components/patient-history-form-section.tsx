"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icd10SearchModal } from "@/features/encounter/components/icd10-search-modal";
import { SimpleCatalogAddDialog } from "@/features/catalog/components/typed-catalog-dialogs";
import { AllergenQuickAddDialog } from "@/features/catalog/components/allergen-quick-add-dialog";
import { CatalogType } from "@/features/catalog/types";

type CatalogItem = { id: number; name: string };

type QuickAddState = {
  open: boolean;
  catalogType: CatalogType;
  title: string;
  catalogKey: string;
  onSelect: (item: CatalogItem) => void;
};

// Audit stamp component — hidden per requirements
function AuditStamps(_: { record: unknown }) {
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HistoryItem = Record<string, any>;

type PatientHistoryFormSectionProps = {
  formData: {
    allergies: HistoryItem[];
    habits: HistoryItem[];
    exercises: HistoryItem[];
    medicalHistory: HistoryItem[];
    surgicalHistory: HistoryItem[];
    traumaHistory: HistoryItem[];
    familyHistory: HistoryItem[];
  };
  handleArrayChange: (section: string, index: number, field: string, value: unknown) => void;
  addArrayItem: (section: string, item: HistoryItem) => void;
  removeArrayItem: (section: string, index: number) => void;
  catalogs: Record<string, CatalogItem[]>;
  patientHistory?: Record<string, HistoryItem[]>;
};

export function PatientHistoryFormSection({ 
  formData, 
  handleArrayChange, 
  addArrayItem, 
  removeArrayItem,
  catalogs,
  patientHistory 
}: PatientHistoryFormSectionProps) {
  const [localCatalogs, setLocalCatalogs] = useState<Record<string, CatalogItem[]>>(catalogs ?? {});
  const [quickAdd, setQuickAdd] = useState<QuickAddState>({
    open: false,
    catalogType: "allergenCatalog",
    title: "",
    catalogKey: "",
    onSelect: () => {},
  });

  const openQuickAdd = (
    catalogType: CatalogType,
    title: string,
    catalogKey: string,
    onSelect: (item: CatalogItem) => void
  ) => {
    setQuickAdd({ open: true, catalogType, title, catalogKey, onSelect });
  };

  const handleQuickAddSuccess = (item: CatalogItem) => {
    setLocalCatalogs((prev) => ({
      ...prev,
      [quickAdd.catalogKey]: [...(prev[quickAdd.catalogKey] ?? []), item],
    }));
    quickAdd.onSelect(item);
  };

  const findOriginal = (type: string, matchFn: (item: HistoryItem) => boolean) => {
    return patientHistory?.[type]?.find(matchFn);
  };

  return (
    <div className="space-y-4">
      {/* ALERGIAS */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-muted/20">
          <CardTitle className="text-sm font-semibold uppercase">Alergias</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {formData.allergies.map((a, index) => {
            const original = findOriginal("allergies", (orig) => String(orig.allergenCatalogId) === String(a.allergenCatalogId));
            return (
              <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg relative bg-card">
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive h-6 w-6" onClick={() => removeArrayItem("allergies", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <Label>Alergeno</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select value={a.allergenCatalogId} onValueChange={(val) => handleArrayChange("allergies", index, "allergenCatalogId", val)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione...">
                              {() => localCatalogs.allergenCatalog?.find((c) => String(c.id) === String(a.allergenCatalogId))?.name ?? "Seleccione..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {localCatalogs.allergenCatalog?.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        title="Agregar nuevo alergeno"
                        onClick={() => openQuickAdd("allergenCatalog", "Alergeno", "allergenCatalog", (item) =>
                          handleArrayChange("allergies", index, "allergenCatalogId", String(item.id))
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Detalle</Label>
                    <Input value={a.detail || ""} onChange={(e) => handleArrayChange("allergies", index, "detail", e.target.value)} />
                  </div>
                </div>
                <AuditStamps record={original} />
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("allergies", { allergenCatalogId: "", detail: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Alergia
          </Button>
        </CardContent>
      </Card>

      {/* ANTECEDENTES MEDICOS */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-muted/20">
          <CardTitle className="text-sm font-semibold uppercase">Antecedentes Médicos</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {formData.medicalHistory.map((m, index) => {
            const original = findOriginal("medicalHistory", (orig) => orig.icd10CodeId === m.icd10CodeId);
            return (
              <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg relative bg-card">
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive h-6 w-6" onClick={() => removeArrayItem("medicalHistory", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <Label>Diagnóstico (CIE-10)</Label>
                    <Icd10SearchModal
                      id={`med-hx-icd10-${index}`}
                      value={m.icd10CodeId}
                      onValueChange={(val) => handleArrayChange("medicalHistory", index, "icd10CodeId", val)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Observaciones</Label>
                    <Input value={m.observations || ""} onChange={(e) => handleArrayChange("medicalHistory", index, "observations", e.target.value)} />
                  </div>
                </div>
                <AuditStamps record={original} />
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("medicalHistory", { icd10CodeId: null, observations: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Ant. Médico
          </Button>
        </CardContent>
      </Card>

      {/* ANTECEDENTES QUIRURGICOS */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-muted/20">
          <CardTitle className="text-sm font-semibold uppercase">Antecedentes Quirúrgicos</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {formData.surgicalHistory.map((s, index) => {
            const original = findOriginal("surgicalHistory", (orig) => String(orig.surgicalProcedureId) === String(s.surgicalProcedureId));
            return (
              <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg relative bg-card">
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive h-6 w-6" onClick={() => removeArrayItem("surgicalHistory", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <Label>Procedimiento</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select value={s.surgicalProcedureId} onValueChange={(val) => handleArrayChange("surgicalHistory", index, "surgicalProcedureId", val)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione...">
                              {() => localCatalogs.surgicalProcedure?.find((c) => String(c.id) === String(s.surgicalProcedureId))?.name ?? "Seleccione..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {localCatalogs.surgicalProcedure?.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        title="Agregar nuevo procedimiento"
                        onClick={() => openQuickAdd("surgicalProcedure", "Procedimiento quirúrgico", "surgicalProcedure", (item) =>
                          handleArrayChange("surgicalHistory", index, "surgicalProcedureId", String(item.id))
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Observaciones</Label>
                    <Input value={s.observations || ""} onChange={(e) => handleArrayChange("surgicalHistory", index, "observations", e.target.value)} />
                  </div>
                </div>
                <AuditStamps record={original} />
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("surgicalHistory", { surgicalProcedureId: "", observations: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Ant. Quirúrgico
          </Button>
        </CardContent>
      </Card>

      {/* ANTECEDENTES TRAUMATICOS */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-muted/20">
          <CardTitle className="text-sm font-semibold uppercase">Antecedentes Traumáticos</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {formData.traumaHistory.map((t, index) => {
            const original = findOriginal("traumaHistory", (orig) => orig.icd10CodeId === t.icd10CodeId);
            return (
              <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg relative bg-card">
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive h-6 w-6" onClick={() => removeArrayItem("traumaHistory", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <Label>Diagnóstico (CIE-10)</Label>
                    <Icd10SearchModal
                      id={`trauma-hx-icd10-${index}`}
                      value={t.icd10CodeId}
                      onValueChange={(val) => handleArrayChange("traumaHistory", index, "icd10CodeId", val)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Observaciones</Label>
                    <Input value={t.observations || ""} onChange={(e) => handleArrayChange("traumaHistory", index, "observations", e.target.value)} />
                  </div>
                </div>
                <AuditStamps record={original} />
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("traumaHistory", { icd10CodeId: null, observations: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Ant. Traumático
          </Button>
        </CardContent>
      </Card>

      {/* HABITOS */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-muted/20">
          <CardTitle className="text-sm font-semibold uppercase">Hábitos</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {formData.habits.map((h, index) => {
            const original = findOriginal("habits", (orig) => String(orig.habitCatalogId) === String(h.habitCatalogId));
            return (
              <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg relative bg-card">
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive h-6 w-6" onClick={() => removeArrayItem("habits", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <Label>Hábito</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select value={h.habitCatalogId} onValueChange={(val) => handleArrayChange("habits", index, "habitCatalogId", val)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione...">
                              {() => localCatalogs.habitCatalog?.find((c) => String(c.id) === String(h.habitCatalogId))?.name ?? "Seleccione..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {localCatalogs.habitCatalog?.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
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
                        onClick={() => openQuickAdd("habitCatalog", "Hábito", "habitCatalog", (item) =>
                          handleArrayChange("habits", index, "habitCatalogId", String(item.id))
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Frecuencia</Label>
                    <Select value={h.frequency} onValueChange={(val) => handleArrayChange("habits", index, "frequency", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione...">
                          {() => ({ DAILY: "Diario", WEEKLY: "Semanal", MONTHLY: "Mensual", OCCASIONAL: "Ocasional" }[h.frequency as string] ?? "Seleccione...")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Diario</SelectItem>
                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                        <SelectItem value="MONTHLY">Mensual</SelectItem>
                        <SelectItem value="OCCASIONAL">Ocasional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Cantidad</Label>
                    <Input type="number" value={h.quantity || ""} onChange={(e) => handleArrayChange("habits", index, "quantity", e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Duración</Label>
                    <Input value={h.duration || ""} onChange={(e) => handleArrayChange("habits", index, "duration", e.target.value)} />
                  </div>
                </div>
                <AuditStamps record={original} />
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("habits", { habitCatalogId: "", duration: "", quantity: "", frequency: "", observations: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Hábito
          </Button>
        </CardContent>
      </Card>

      {/* ANTECEDENTES FAMILIARES */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-muted/20">
          <CardTitle className="text-sm font-semibold uppercase">Antecedentes Familiares</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {formData.familyHistory.map((f, index) => {
            const original = findOriginal("familyHistory", (orig) => orig.icd10CodeId === f.icd10CodeId);
            return (
              <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg relative bg-card">
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive h-6 w-6" onClick={() => removeArrayItem("familyHistory", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <Label>Diagnóstico (CIE-10)</Label>
                    <Icd10SearchModal
                      id={`fam-hx-icd10-${index}`}
                      value={f.icd10CodeId}
                      onValueChange={(val) => handleArrayChange("familyHistory", index, "icd10CodeId", val)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Observaciones / Parentesco</Label>
                    <Input value={f.observations || ""} onChange={(e) => handleArrayChange("familyHistory", index, "observations", e.target.value)} />
                  </div>
                </div>
                <AuditStamps record={original} />
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("familyHistory", { icd10CodeId: null, observations: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Ant. Familiar
          </Button>
        </CardContent>
      </Card>

      {/* EJERCICIOS */}
      <Card className="overflow-hidden">
        <CardHeader className="py-4 bg-muted/20">
          <CardTitle className="text-sm font-semibold uppercase">Actividad Física</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {formData.exercises.map((e, index) => {
            const original = findOriginal("exercises", (orig) => String(orig.exerciseCatalogId) === String(e.exerciseCatalogId));
            return (
              <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg relative bg-card">
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive h-6 w-6" onClick={() => removeArrayItem("exercises", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <Label>Actividad</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select value={e.exerciseCatalogId} onValueChange={(val) => handleArrayChange("exercises", index, "exerciseCatalogId", val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione...">
                              {() => localCatalogs.exerciseCatalog?.find((c) => String(c.id) === String(e.exerciseCatalogId))?.name ?? "Seleccione..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {localCatalogs.exerciseCatalog?.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
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
                        onClick={() => openQuickAdd("exerciseCatalog", "Tipo de ejercicio", "exerciseCatalog", (item) =>
                          handleArrayChange("exercises", index, "exerciseCatalogId", String(item.id))
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Frecuencia (Veces por semana)</Label>
                    <Input type="number" min="1" max="28" value={e.timesPerWeek || ""} onChange={(e) => handleArrayChange("exercises", index, "timesPerWeek", e.target.value)} />
                  </div>
                </div>
                <AuditStamps record={original} />
              </div>
            );
          })}
          <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("exercises", { exerciseCatalogId: "", timesPerWeek: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Actividad
          </Button>
        </CardContent>
      </Card>

      {/* Quick Add Dialogs */}
      {quickAdd.catalogType === "allergenCatalog" ? (
        <AllergenQuickAddDialog
          open={quickAdd.open}
          allergyCategories={catalogs.allergyCategory ?? []}
          onOpenChange={(open) => setQuickAdd((prev) => ({ ...prev, open }))}
          onSuccess={handleQuickAddSuccess}
        />
      ) : (
        <SimpleCatalogAddDialog
          open={quickAdd.open}
          onOpenChange={(open) => setQuickAdd((prev) => ({ ...prev, open }))}
          catalogType={quickAdd.catalogType}
          title={quickAdd.title}
          onSuccess={handleQuickAddSuccess}
        />
      )}
    </div>
  );
}
