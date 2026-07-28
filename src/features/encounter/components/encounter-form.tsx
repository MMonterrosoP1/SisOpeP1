"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEncounter } from "../actions";
import { Icd10SearchModal } from "./icd10-search-modal";
import { AllergenSearchModal, AllergenOption } from "./allergen-search-modal";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { calculateBmi, classifyBmi } from "../domain/bmi-calculator";

const bmiCategoryEs: Record<string, string> = {
  UNDERWEIGHT: "Bajo peso",
  NORMAL: "Normal",
  OVERWEIGHT: "Sobrepeso",
  OBESE_I: "Obesidad Tipo I",
  OBESE_II: "Obesidad Tipo II",
  OBESE_III: "Obesidad Tipo III",
};

type CatalogItem = { id: number; name: string; allergyCategory?: { name: string } };
type SelectOption = { key: string; label: string };

type CatalogSelectFieldProps = {
  name: string;
  label: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  isRequired?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-sm text-destructive mt-1">{error}</p>;
}

function CatalogSelectField({
  name, label, value, options, placeholder, isRequired, error, onChange,
}: CatalogSelectFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label htmlFor={name}>
        {label} {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value || ""} onValueChange={(v) => onChange(v || "")}>
        <SelectTrigger id={name} className={error ? "border-destructive ring-1 ring-destructive" : ""} aria-invalid={!!error}>
          <SelectValue placeholder={placeholder}>
            {() => {
              const selectedOption = options.find((o) => o.key === String(value));
              return selectedOption?.label ?? placeholder;
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError error={error} />
    </div>
  );
}

function CatalogComboboxField({
  name, label, value, options, placeholder, isRequired, error, onChange,
}: CatalogSelectFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label htmlFor={name}>
        {label} {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <ComboboxSelect
        id={name}
        value={value || ""}
        options={options}
        placeholder={placeholder}
        searchPlaceholder="Buscar..."
        invalid={!!error}
        onValueChange={onChange}
      />
      <FieldError error={error} />
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultExpanded = false,
  hasError = false,
  children,
}: {
  title: string;
  defaultExpanded?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded || hasError);

  // Auto-expand when errors appear (useEffect to avoid render side-effect)
  useEffect(() => {
    if (hasError) setExpanded(true);
  }, [hasError]);

  return (
    <Card className={`overflow-hidden ${hasError ? "ring-1 ring-destructive" : ""}`}>
      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className={`text-lg ${hasError ? "text-destructive" : ""}`}>{title}</CardTitle>
        <Button variant="ghost" size="icon" type="button">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>
      {expanded && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}


interface EncounterFormProps {
  patientId: number;
  patientSex: "MALE" | "FEMALE";
  catalogs: Record<string, CatalogItem[]>;
}

export function EncounterForm({ patientId, patientSex, catalogs }: EncounterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<any>({
    patientId,
    encounterTypeId: "",
    isFirstVisit: false,
    symptomatology: "",
    illnessHistory: "",
    gynecologicalHistory: "",
    pregnancyStatus: "NOT_APPLICABLE",
    sleepHours: "",
    medicationsAdministered: "",
    suspensionHours: "",
    referralLevelId: "",
    medicalAptitudeId: "",
    internalObservation: "",
    employerObservation: "",
    followUpDate: "",
    vitalSign: {
      systolicBP: "", diastolicBP: "", heartRate: "", respiratoryRate: "", oxygenSaturation: "", glucose: "", temperature: ""
    },
    anthropometry: { weight: "", height: "", abdominalCircumference: "" },
    diagnoses: [{ icd10CodeId: null, diseaseTypeId: "", observations: "", isPrimary: true }],
    allergies: [],
    habits: [],
    exercises: [{ doesExercise: false, sportType: "", timesPerWeek: "" }],
    medicalHistory: [],
    surgicalHistory: [],
    traumaHistory: [],
    familyHistory: [],
    occupationalExposures: [],
    workDisabilities: []
  });

  const getFieldError = (path: string): string | undefined => fieldErrors[path]?.join(", ");
  const getCatalogOptions = (catalogKey: string): SelectOption[] => {
    return (catalogs[catalogKey] ?? []).map((item) => ({ key: String(item.id), label: item.name }));
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleArrayChange = (section: string, index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const arr = [...prev[section]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addArrayItem = (section: string, defaultItem: any) => {
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

  const scrollToFirstError = (errors: Record<string, string[]>) => {
    setTimeout(() => {
      // Try to find a field with border-destructive or aria-invalid first
      let target: Element | null = document.querySelector('.border-destructive, [aria-invalid="true"]');
      // Fallback: find the first FieldError <p> element
      if (!target) {
        target = document.querySelector('p.text-destructive');
      }
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Client-side pre-validation ---
    const clientErrors: Record<string, string[]> = {};
    if (!formData.encounterTypeId) {
      clientErrors["encounterTypeId"] = ["Seleccione el tipo de consulta"];
    }
    const validDiagnoses = formData.diagnoses.filter((d: any) => d.icd10CodeId);
    if (validDiagnoses.length === 0) {
      clientErrors["diagnoses"] = ["Debe agregar al menos un diagnóstico con código ICD-10"];
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      const missing = [
        clientErrors["encounterTypeId"] ? "Tipo de Consulta" : null,
        clientErrors["diagnoses"] ? "Diagnóstico (ICD-10)" : null,
      ].filter(Boolean).join(", ");
      toast.error(`Campos requeridos: ${missing}`);
      scrollToFirstError(clientErrors);
      return;
    }
    // ----------------------------------

    setIsLoading(true);
    setFieldErrors({});

    try {
      const payload = {
        patientId,
        encounterTypeId: toOptionalNumber(formData.encounterTypeId),
        isFirstVisit: formData.isFirstVisit,
        symptomatology: formData.symptomatology || undefined,
        illnessHistory: formData.illnessHistory || undefined,
        gynecologicalHistory: formData.gynecologicalHistory || undefined,
        pregnancyStatus: formData.pregnancyStatus,
        sleepHours: toOptionalNumber(formData.sleepHours),
        medicationsAdministered: formData.medicationsAdministered || undefined,
        suspensionHours: toOptionalNumber(formData.suspensionHours),
        referralLevelId: toOptionalNumber(formData.referralLevelId),
        medicalAptitudeId: toOptionalNumber(formData.medicalAptitudeId),
        internalObservation: formData.internalObservation || undefined,
        employerObservation: formData.employerObservation || undefined,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,

        vitalSign: Object.values(formData.vitalSign).some(v => v !== "") ? {
          systolicBP: toOptionalNumber(formData.vitalSign.systolicBP),
          diastolicBP: toOptionalNumber(formData.vitalSign.diastolicBP),
          heartRate: toOptionalNumber(formData.vitalSign.heartRate),
          respiratoryRate: toOptionalNumber(formData.vitalSign.respiratoryRate),
          oxygenSaturation: toOptionalNumber(formData.vitalSign.oxygenSaturation),
          glucose: toOptionalNumber(formData.vitalSign.glucose),
          temperature: toOptionalNumber(formData.vitalSign.temperature),
        } : undefined,

        anthropometry: Object.values(formData.anthropometry).some(v => v !== "") ? {
          weight: toOptionalNumber(formData.anthropometry.weight),
          height: toOptionalNumber(formData.anthropometry.height),
          abdominalCircumference: toOptionalNumber(formData.anthropometry.abdominalCircumference),
        } : undefined,

        diagnoses: formData.diagnoses.map((d: any) => ({
          icd10CodeId: toOptionalNumber(d.icd10CodeId),
          diseaseTypeId: toOptionalNumber(d.diseaseTypeId),
          observations: d.observations || undefined,
          isPrimary: d.isPrimary
        })).filter((d: any) => d.icd10CodeId),

        allergies: formData.allergies.map((a: any) => ({
          allergenCatalogId: toOptionalNumber(a.allergenCatalogId),
          detail: a.detail || undefined
        })).filter((a: any) => a.allergenCatalogId),

        habits: formData.habits.map((h: any) => ({
          habitCatalogId: toOptionalNumber(h.habitCatalogId),
          duration: h.duration || undefined,
          quantity: toOptionalNumber(h.quantity),
          frequency: h.frequency || undefined,
          observations: h.observations || undefined
        })).filter((h: any) => h.habitCatalogId),

        exercises: formData.exercises.map((e: any) => ({
          doesExercise: e.doesExercise,
          sportType: e.sportType || undefined,
          timesPerWeek: toOptionalNumber(e.timesPerWeek)
        })).filter((e: any) => e.sportType || e.doesExercise),

        medicalHistory: formData.medicalHistory.map((h: any) => ({
          icd10CodeId: toOptionalNumber(h.icd10CodeId),
          observations: h.observations || undefined
        })).filter((h: any) => h.icd10CodeId),

        surgicalHistory: formData.surgicalHistory.map((s: any) => ({
          surgicalProcedureId: toOptionalNumber(s.surgicalProcedureId),
          observations: s.observations || undefined
        })).filter((s: any) => s.surgicalProcedureId),

        traumaHistory: formData.traumaHistory.map((h: any) => ({
          icd10CodeId: toOptionalNumber(h.icd10CodeId),
          observations: h.observations || undefined
        })).filter((h: any) => h.icd10CodeId),

        familyHistory: formData.familyHistory.map((h: any) => ({
          icd10CodeId: toOptionalNumber(h.icd10CodeId),
          observations: h.observations || undefined
        })).filter((h: any) => h.icd10CodeId),

        occupationalExposures: formData.occupationalExposures.map((e: any) => ({
          occupationalExposureId: toOptionalNumber(e.occupationalExposureId),
          observations: e.observations || undefined
        })).filter((e: any) => e.occupationalExposureId),

        workDisabilities: formData.workDisabilities.map((w: any) => ({
          workDisabilityId: toOptionalNumber(w.workDisabilityId),
          observations: w.observations || undefined
        })).filter((w: any) => w.workDisabilityId),
      };

      const res = await createEncounter(payload);

      if (res.success) {
        toast.success("Consulta creada correctamente");
        router.push(`/patients/${patientId}`);
        router.refresh();
      } else {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
          toast.error("Por favor, revisa los campos marcados en rojo.");
          scrollToFirstError(res.fieldErrors);
        } else {
          toast.error(res.error || "Ocurrió un error al crear la consulta");
        }
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full flex flex-col gap-6"
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          (e.target as HTMLElement).tagName !== "TEXTAREA" &&
          (e.target as HTMLElement).tagName !== "BUTTON"
        ) {
          e.preventDefault();
        }
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Datos Generales</CardTitle>
          <CardDescription>Información principal de la consulta.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogSelectField
            name="encounterTypeId"
            label="Tipo de Consulta"
            value={formData.encounterTypeId}
            options={getCatalogOptions("encounterType")}
            placeholder="Seleccione el tipo de consulta"
            isRequired
            error={getFieldError("encounterTypeId")}
            onChange={(val) => handleFieldChange("encounterTypeId", val)}
          />

          <div className="col-span-2 flex flex-col gap-2">
            <Label>Sintomatología</Label>
            <Textarea
              className={getFieldError("symptomatology") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("symptomatology")}
              value={formData.symptomatology}
              onChange={(e) => handleFieldChange("symptomatology", e.target.value)}
              placeholder="Describa los síntomas..."
            />
            <FieldError error={getFieldError("symptomatology")} />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <Label>Historia de Enfermedad</Label>
            <Textarea
              className={getFieldError("illnessHistory") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("illnessHistory")}
              value={formData.illnessHistory}
              onChange={(e) => handleFieldChange("illnessHistory", e.target.value)}
              placeholder="Describa ..."
            />
            <FieldError error={getFieldError("illnessHistory")} />
          </div>
        </CardContent>
      </Card>

      <CollapsibleSection
        title="Signos Vitales"
        defaultExpanded
        hasError={[
          "systolicBP", "diastolicBP", "heartRate",
          "respiratoryRate", "oxygenSaturation", "glucose", "temperature"
        ].some((f) => !!getFieldError(`vitalSign.${f}`))}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { field: "systolicBP", label: "Presión Arterial Sistólica" },
            { field: "diastolicBP", label: "Presión Arterial Diastólica" },
            { field: "heartRate", label: "Frecuencia Cardíaca (FC)" },
            { field: "respiratoryRate", label: "Frecuencia Respiratoria (FR)" },
            { field: "oxygenSaturation", label: "Saturación de Oxígeno (SpO2)" },
            { field: "glucose", label: "Glucosa (mg/dL)" },
            { field: "temperature", label: "Temperatura (°C)" }
          ].map(({ field, label }) => {
            const err = getFieldError(`vitalSign.${field}`);
            return (
              <div key={field} className="flex flex-col gap-2">
                <Label>{label}</Label>
                <Input
                  type="number"
                  className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none${err ? " border-destructive ring-1 ring-destructive" : ""
                    }`}
                  aria-invalid={!!err}
                  value={formData.vitalSign[field]}
                  onChange={(e) => handleNestedChange("vitalSign", field, e.target.value)}
                />
                <FieldError error={err} />
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Antropometría" defaultExpanded>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["weight", "height", "abdominalCircumference"].map((field) => (
            <div key={field} className="flex flex-col gap-2">
              <Label>{field === "weight" ? "Peso (lb)" : field === "height" ? "Talla (cm)" : "Circ. Abdominal (cm)"}</Label>
              <Input
                type="number" step="0.1"
                className={getFieldError(`anthropometry.${field}`) ? "border-destructive ring-1 ring-destructive" : ""}
                aria-invalid={!!getFieldError(`anthropometry.${field}`)}
                value={formData.anthropometry[field]}
                onChange={(e) => handleNestedChange("anthropometry", field, e.target.value)}
              />
              <FieldError error={getFieldError(`anthropometry.${field}`)} />
            </div>
          ))}
          {formData.anthropometry.weight && formData.anthropometry.height && (() => {
            const bmi = calculateBmi(Number(formData.anthropometry.weight), Number(formData.anthropometry.height));
            const category = classifyBmi(bmi);
            return (
              <div className="col-span-1 md:col-span-3 mt-2 p-3 bg-muted/50 rounded-lg flex flex-col md:flex-row gap-2 md:gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">IMC Estimado: </span>
                  <span className="font-semibold text-primary">{bmi}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Clasificación: </span>
                  <span className="font-semibold text-primary">{bmiCategoryEs[category]}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Diagnósticos (Obligatorio)" defaultExpanded>
        {getFieldError("diagnoses") && <FieldError error={getFieldError("diagnoses")} />}
        <div className="flex flex-col gap-4">
          {formData.diagnoses.map((d: any, index: number) => (
            <div key={index} className="flex flex-col gap-4 p-4 border rounded-lg relative">
              {index > 0 && (
                <Button
                  variant="ghost" size="icon"
                  className="absolute right-2 top-2 text-destructive"
                  onClick={() => removeArrayItem("diagnoses", index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-[95%]">
                <div className="flex flex-col gap-2">
                  <Label>Código ICD-10 <span className="text-destructive">*</span></Label>
                  <Icd10SearchModal
                    id={`dx-icd10-${index}`}
                    value={d.icd10CodeId}
                    invalid={!!getFieldError(`diagnoses.${index}.icd10CodeId`)}
                    onValueChange={(val) => handleArrayChange("diagnoses", index, "icd10CodeId", val)}
                  />
                  <FieldError error={getFieldError(`diagnoses.${index}.icd10CodeId`)} />
                </div>
                <CatalogSelectField
                  name={`dx-type-${index}`}
                  label="Tipo de Enfermedad"
                  value={String(d.diseaseTypeId || "")}
                  options={getCatalogOptions("diseaseType")}
                  placeholder="Seleccione..."
                  onChange={(val) => handleArrayChange("diagnoses", index, "diseaseTypeId", val)}
                />
                <div className="col-span-2 flex flex-col gap-2">
                  <Label>Observaciones</Label>
                  <Input
                    className={getFieldError(`diagnoses.${index}.observations`) ? "border-destructive ring-1 ring-destructive" : ""}
                    aria-invalid={!!getFieldError(`diagnoses.${index}.observations`)}
                    value={d.observations}
                    onChange={(e) => handleArrayChange("diagnoses", index, "observations", e.target.value)}
                  />
                  <FieldError error={getFieldError(`diagnoses.${index}.observations`)} />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Checkbox
                    checked={d.isPrimary}
                    onCheckedChange={(c) => {
                      const arr = [...formData.diagnoses];
                      if (c) arr.forEach(item => item.isPrimary = false); // Solo uno puede ser primario
                      arr[index].isPrimary = !!c;
                      setFormData((prev: any) => ({ ...prev, diagnoses: arr }));
                    }}
                  />
                  <Label className="cursor-pointer">Diagnóstico Principal</Label>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addArrayItem("diagnoses", { icd10CodeId: null, diseaseTypeId: "", observations: "", isPrimary: formData.diagnoses.length === 0 })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Diagnóstico
          </Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Alergias"
        defaultExpanded
        hasError={Object.keys(fieldErrors).some(k => k.startsWith("allergies."))}
      >
        <div className="flex flex-col gap-4">
          {formData.allergies.map((a: any, index: number) => (
            <div key={index} className="flex flex-col gap-4 p-4 border rounded-lg relative">
              <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive" onClick={() => removeArrayItem("allergies", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-[95%]">
                <div className="flex flex-col gap-2 w-full">
                  <Label>Alérgeno <span className="text-destructive">*</span></Label>
                  <AllergenSearchModal
                    id={`allergy-${index}`}
                    value={a.allergenCatalogId ? Number(a.allergenCatalogId) : null}
                    options={(catalogs["allergenCatalog"] || []) as AllergenOption[]}
                    onValueChange={(val) => handleArrayChange("allergies", index, "allergenCatalogId", val)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Detalle</Label>
                  <Input
                    className={getFieldError(`allergies.${index}.detail`) ? "border-destructive ring-1 ring-destructive" : ""}
                    aria-invalid={!!getFieldError(`allergies.${index}.detail`)}
                    value={a.detail}
                    onChange={(e) => handleArrayChange("allergies", index, "detail", e.target.value)}
                  />
                  <FieldError error={getFieldError(`allergies.${index}.detail`)} />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addArrayItem("allergies", { allergenCatalogId: "", detail: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Alergia
          </Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Hábitos y Estilo de Vida"
        defaultExpanded
        hasError={Object.keys(fieldErrors).some(k => k.startsWith("exercises.") || k.startsWith("habits."))}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 border p-4 rounded-lg">
            <h4 className="font-semibold text-sm">Ejercicio</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 mt-8">
                <Checkbox
                  checked={formData.exercises[0]?.doesExercise ?? false}
                  onCheckedChange={(c) => {
                    handleArrayChange("exercises", 0, "doesExercise", !!c);
                    if (!c) {
                      handleArrayChange("exercises", 0, "sportType", "");
                      handleArrayChange("exercises", 0, "timesPerWeek", "");
                    }
                  }}
                />
                <Label>¿Realiza Ejercicio?</Label>
              </div>
              <FieldError error={getFieldError("exercises")} />
              {formData.exercises[0]?.doesExercise && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>Tipo de Deporte</Label>
                    <Input
                      className={getFieldError("exercises.0.sportType") ? "border-destructive ring-1 ring-destructive" : ""}
                      aria-invalid={!!getFieldError("exercises.0.sportType")}
                      value={formData.exercises[0]?.sportType || ""}
                      onChange={(e) => handleArrayChange("exercises", 0, "sportType", e.target.value)}
                    />
                    <FieldError error={getFieldError("exercises.0.sportType")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Veces por Semana</Label>
                    <Input
                      type="number"
                      className={getFieldError("exercises.0.timesPerWeek") ? "border-destructive ring-1 ring-destructive" : ""}
                      aria-invalid={!!getFieldError("exercises.0.timesPerWeek")}
                      value={formData.exercises[0]?.timesPerWeek || ""}
                      onChange={(e) => handleArrayChange("exercises", 0, "timesPerWeek", e.target.value)}
                    />
                    <FieldError error={getFieldError("exercises.0.timesPerWeek")} />
                  </div>
                </>
              )}
            </div>
          </div>

          <h4 className="font-semibold text-sm mt-2">Otros Hábitos (Fumar, Beber, etc.)</h4>
          {formData.habits.map((h: any, index: number) => (
            <div key={index} className="flex flex-col gap-4 p-4 border rounded-lg relative">
              <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-destructive" onClick={() => removeArrayItem("habits", index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-[95%]">
                <CatalogSelectField
                  name={`habits.${index}.habitCatalogId`}
                  label="Hábito"
                  value={h.habitCatalogId}
                  options={getCatalogOptions("habitCatalog")}
                  placeholder="Seleccione el hábito"
                  error={getFieldError(`habits.${index}.habitCatalogId`)}
                  onChange={(val) => handleArrayChange("habits", index, "habitCatalogId", val)}
                />
                <div className="flex flex-col gap-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    className={getFieldError(`habits.${index}.quantity`) ? "border-destructive ring-1 ring-destructive" : ""}
                    aria-invalid={!!getFieldError(`habits.${index}.quantity`)}
                    value={h.quantity}
                    onChange={(e) => handleArrayChange("habits", index, "quantity", e.target.value)}
                  />
                  <FieldError error={getFieldError(`habits.${index}.quantity`)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Frecuencia</Label>
                  <Select value={h.frequency || ""} onValueChange={(v) => handleArrayChange("habits", index, "frequency", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Diario</SelectItem>
                      <SelectItem value="WEEKLY">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Duración</Label>
                  <Input
                    className={getFieldError(`habits.${index}.duration`) ? "border-destructive ring-1 ring-destructive" : ""}
                    aria-invalid={!!getFieldError(`habits.${index}.duration`)}
                    value={h.duration}
                    onChange={(e) => handleArrayChange("habits", index, "duration", e.target.value)}
                    placeholder="Ej. 5 años"
                  />
                  <FieldError error={getFieldError(`habits.${index}.duration`)} />
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <Label>Observaciones</Label>
                  <Input
                    className={getFieldError(`habits.${index}.observations`) ? "border-destructive ring-1 ring-destructive" : ""}
                    aria-invalid={!!getFieldError(`habits.${index}.observations`)}
                    value={h.observations}
                    onChange={(e) => handleArrayChange("habits", index, "observations", e.target.value)}
                  />
                  <FieldError error={getFieldError(`habits.${index}.observations`)} />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addArrayItem("habits", { habitCatalogId: "", duration: "", quantity: "", frequency: "", observations: "" })}>
            <Plus className="h-4 w-4 mr-2" /> Agregar Hábito
          </Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Antecedentes Personales (Médicos, Trauma, Familiares)"
        defaultExpanded
        hasError={Object.keys(fieldErrors).some(k =>
          k.startsWith("medicalHistory.") ||
          k.startsWith("traumaHistory.") ||
          k.startsWith("familyHistory.") ||
          k.startsWith("surgicalHistory.")
        )}
      >
        <div className="flex flex-col gap-6">
          {[{ key: "medicalHistory", title: "Médicos" }, { key: "traumaHistory", title: "Traumáticos" }, { key: "familyHistory", title: "Familiares" }].map((section) => (
            <div key={section.key} className="flex flex-col gap-2">
              <h4 className="font-semibold text-sm">{section.title}</h4>
              {formData[section.key].map((h: any, index: number) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 flex flex-col gap-2">
                    <Label>Código ICD-10</Label>
                    <Icd10SearchModal id={`${section.key}-icd10-${index}`} value={h.icd10CodeId} onValueChange={(val) => handleArrayChange(section.key, index, "icd10CodeId", val)} />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <Label>Observaciones</Label>
                    <Input
                      className={getFieldError(`${section.key}.${index}.observations`) ? "border-destructive ring-1 ring-destructive" : ""}
                      aria-invalid={!!getFieldError(`${section.key}.${index}.observations`)}
                      value={h.observations}
                      onChange={(e) => handleArrayChange(section.key, index, "observations", e.target.value)}
                    />
                    <FieldError error={getFieldError(`${section.key}.${index}.observations`)} />
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeArrayItem(section.key, index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-fit" onClick={() => addArrayItem(section.key, { icd10CodeId: null, observations: "" })}>
                <Plus className="h-4 w-4 mr-2" /> Agregar
              </Button>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-sm">Quirúrgicos</h4>
            {formData.surgicalHistory.map((s: any, index: number) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <CatalogSelectField name={`surg-${index}`} label="Procedimiento" value={String(s.surgicalProcedureId || "")} options={getCatalogOptions("surgicalProcedure")} placeholder="Seleccione..." onChange={(val) => handleArrayChange("surgicalHistory", index, "surgicalProcedureId", val)} />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label>Observaciones</Label>
                  <Input
                    className={getFieldError(`surgicalHistory.${index}.observations`) ? "border-destructive ring-1 ring-destructive" : ""}
                    aria-invalid={!!getFieldError(`surgicalHistory.${index}.observations`)}
                    value={s.observations}
                    onChange={(e) => handleArrayChange("surgicalHistory", index, "observations", e.target.value)}
                  />
                  <FieldError error={getFieldError(`surgicalHistory.${index}.observations`)} />
                </div>
                <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeArrayItem("surgicalHistory", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-fit" onClick={() => addArrayItem("surgicalHistory", { surgicalProcedureId: "", observations: "" })}>
              <Plus className="h-4 w-4 mr-2" /> Agregar
            </Button>
          </div>
        </div>
      </CollapsibleSection>

      {patientSex === "FEMALE" && (
        <CollapsibleSection title="Ginecología" defaultExpanded>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Estado de Embarazo</Label>
              <Select value={formData.pregnancyStatus} onValueChange={(val) => handleFieldChange("pregnancyStatus", val)}>
                <SelectTrigger>
                  <span className="flex flex-1 text-left">
                    {{
                      NOT_APPLICABLE: "No Aplica",
                      NOT_PREGNANT: "No Embarazada",
                      PREGNANT: "Embarazada",
                      POSTPARTUM: "Postparto"
                    }[formData.pregnancyStatus as string] || "Seleccione..."}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_APPLICABLE">No Aplica</SelectItem>
                  <SelectItem value="NOT_PREGNANT">No Embarazada</SelectItem>
                  <SelectItem value="PREGNANT">Embarazada</SelectItem>
                  <SelectItem value="POSTPARTUM">Postparto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label>Historia Ginecológica</Label>
              <Textarea
                className={getFieldError("gynecologicalHistory") ? "border-destructive ring-1 ring-destructive" : ""}
                aria-invalid={!!getFieldError("gynecologicalHistory")}
                value={formData.gynecologicalHistory}
                onChange={(e) => handleFieldChange("gynecologicalHistory", e.target.value)}
              />
              <FieldError error={getFieldError("gynecologicalHistory")} />
            </div>
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="Laboral (Exposiciones y Discapacidades)"
        defaultExpanded
        hasError={Object.keys(fieldErrors).some(k =>
          k.startsWith("occupationalExposures.") ||
          k.startsWith("workDisabilities.")
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Exposiciones Laborales</h4>
            </div>
            <FieldError error={getFieldError("occupationalExposures")} />
            {formData.occupationalExposures.map((e: any, index: number) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <CatalogSelectField name={`occ-${index}`} label="Exposición" value={String(e.occupationalExposureId || "")} options={getCatalogOptions("occupationalExposure")} placeholder="Seleccione..." onChange={(val) => handleArrayChange("occupationalExposures", index, "occupationalExposureId", val)} />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label>Observaciones</Label>
                  <Input
                    className={getFieldError(`occupationalExposures.${index}.observations`) ? "border-destructive ring-1 ring-destructive" : ""}
                    aria-invalid={!!getFieldError(`occupationalExposures.${index}.observations`)}
                    value={e.observations}
                    onChange={(e) => handleArrayChange("occupationalExposures", index, "observations", e.target.value)}
                  />
                  <FieldError error={getFieldError(`occupationalExposures.${index}.observations`)} />
                </div>
                <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeArrayItem("occupationalExposures", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-fit" onClick={() => addArrayItem("occupationalExposures", { occupationalExposureId: "", observations: "" })}>
              <Plus className="h-4 w-4 mr-2" /> Agregar
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Discapacidades Laborales</h4>
            </div>
            <FieldError error={getFieldError("workDisabilities")} />
            {formData.workDisabilities.map((w: any, index: number) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <CatalogSelectField name={`dis-${index}`} label="Discapacidad" value={String(w.workDisabilityId || "")} options={getCatalogOptions("workDisability")} placeholder="Seleccione..." onChange={(val) => handleArrayChange("workDisabilities", index, "workDisabilityId", val)} />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Label>Observaciones</Label>
                  <Input
                    className={getFieldError(`workDisabilities.${index}.observations`) ? "border-destructive ring-1 ring-destructive" : ""}
                    aria-invalid={!!getFieldError(`workDisabilities.${index}.observations`)}
                    value={w.observations}
                    onChange={(e) => handleArrayChange("workDisabilities", index, "observations", e.target.value)}
                  />
                  <FieldError error={getFieldError(`workDisabilities.${index}.observations`)} />
                </div>
                <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeArrayItem("workDisabilities", index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-fit" onClick={() => addArrayItem("workDisabilities", { workDisabilityId: "", observations: "" })}>
              <Plus className="h-4 w-4 mr-2" /> Agregar
            </Button>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Plan y Observaciones Finales"
        defaultExpanded
        hasError={[
          "referralLevelId", "medicalAptitudeId", "medicationsAdministered",
          "suspensionHours", "sleepHours", "followUpDate",
          "internalObservation", "employerObservation"
        ].some((f) => !!getFieldError(f))}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogSelectField name="referralLevelId" label="Nivel de Referencia" value={String(formData.referralLevelId || "")} options={getCatalogOptions("referralLevel")} placeholder="Seleccione..." onChange={(val) => handleFieldChange("referralLevelId", val)} />
          <CatalogSelectField name="medicalAptitudeId" label="Aptitud Médica" value={String(formData.medicalAptitudeId || "")} options={getCatalogOptions("medicalAptitude")} placeholder="Seleccione..." onChange={(val) => handleFieldChange("medicalAptitudeId", val)} />

          <div className="flex flex-col gap-2">
            <Label>Medicamentos Administrados</Label>
            <Input
              className={getFieldError("medicationsAdministered") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("medicationsAdministered")}
              value={formData.medicationsAdministered}
              onChange={(e) => handleFieldChange("medicationsAdministered", e.target.value)}
            />
            <FieldError error={getFieldError("medicationsAdministered")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Horas de Suspensión (Descanso)</Label>
            <Input
              type="number"
              className={getFieldError("suspensionHours") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("suspensionHours")}
              value={formData.suspensionHours}
              onChange={(e) => handleFieldChange("suspensionHours", e.target.value)}
            />
            <FieldError error={getFieldError("suspensionHours")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Horas de Sueño</Label>
            <Input
              type="number" step="0.1"
              className={getFieldError("sleepHours") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("sleepHours")}
              value={formData.sleepHours}
              onChange={(e) => handleFieldChange("sleepHours", e.target.value)}
            />
            <FieldError error={getFieldError("sleepHours")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Fecha de Seguimiento</Label>
            <Input
              type="date"
              className={getFieldError("followUpDate") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("followUpDate")}
              value={formData.followUpDate}
              onChange={(e) => handleFieldChange("followUpDate", e.target.value)}
            />
            <FieldError error={getFieldError("followUpDate")} />
          </div>

          <div className="col-span-2 flex flex-col gap-2">
            <Label>Observación Interna (Médico)</Label>
            <Textarea
              className={getFieldError("internalObservation") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("internalObservation")}
              value={formData.internalObservation}
              onChange={(e) => handleFieldChange("internalObservation", e.target.value)}
            />
            <FieldError error={getFieldError("internalObservation")} />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <Label>Observación Patronal (Empresa)</Label>
            <Textarea
              className={getFieldError("employerObservation") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("employerObservation")}
              value={formData.employerObservation}
              onChange={(e) => handleFieldChange("employerObservation", e.target.value)}
            />
            <FieldError error={getFieldError("employerObservation")} />
          </div>
        </div>
      </CollapsibleSection>

      <div className="flex justify-end gap-2 sticky bottom-4 bg-background/80 backdrop-blur p-4 rounded-xl border">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : "Guardar Consulta"}</Button>
      </div>
    </form>
  );
}
