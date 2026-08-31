"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { CollapsibleSection } from "@/components/ui/collapsible-section";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEncounter, updateEncounter } from "../actions";
import { Icd10SearchModal } from "./icd10-search-modal";
import { AllergenSearchModal, AllergenOption } from "./allergen-search-modal";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { calculateBmi, classifyBmi } from "../domain/bmi-calculator";
import { CatalogQuickAddDialog } from "@/features/catalog/components/catalog-quick-add-dialog";
import { AllergenQuickAddDialog } from "@/features/catalog/components/allergen-quick-add-dialog";
import { CatalogType } from "@/features/catalog/types";
import { NewEncounterModal } from "@/features/encounter/components/new-encounter-modal";
import { PatientListItem } from "@/features/patient/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw, RotateCcw, History, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function SectionDivider({ title, icon: Icon }: { title: string, icon?: any }) {
  return (
    <div className="flex items-center gap-4 py-2 mt-2 mb-0 w-full">
      <div className="h-px bg-border flex-1" />
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {title}
      </h2>
      <div className="h-px bg-border flex-1" />
    </div>
  );
}

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

function CatalogSelectFieldWithAdd({
  name, label, value, options, placeholder, isRequired, error, onChange, onAddClick
}: CatalogSelectFieldProps & { onAddClick: () => void }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Label htmlFor={name}>
        {label} {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex items-center gap-2">
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
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={onAddClick}
          title={`Agregar nuevo ${label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
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




interface EncounterFormProps {
  patientId: number;
  patientSex: "MALE" | "FEMALE";
  catalogs: Record<string, CatalogItem[]>;
  patientSummary?: {
    fullName: string;
    age: number;
    identityDocument: string;
    phone?: string | null;
    jobPosition?: string;
    workplace?: string;
  };
  previousDefaults?: Partial<EncounterFormState>;
  isFollowUp?: boolean;
  previousEncounterDate?: string;
  patientHistory?: any;
  mode?: "create" | "edit";
  encounterId?: number;
  initialData?: EncounterFormState;
}

type EncounterFormState = {
  patientId: number;
  encounterTypeId: string;
  isFirstVisit: boolean;
  symptomatology: string;
  illnessHistory: string;
  physicalExam: string;
  gynecologicalHistory: string;
  pregnancyStatus: string;
  sleepHours: string;
  medicationsAdministered: string;
  suspensionHourId: string;
  referralLevelId: string;
  medicalAptitudeId: string;
  internalObservation: string;
  employerObservation: string;
  followUpDate: string;
  vitalSign: { systolicBP: string; diastolicBP: string; heartRate: string; respiratoryRate: string; oxygenSaturation: string; glucose: string; temperature: string; };
  anthropometry: { weight: string; height: string; abdominalCircumference: string; };
  diagnoses: { icd10CodeId: number | null; diseaseTypeId: string; observations: string; isPrimary: boolean; }[];
  allergies: { allergenCatalogId: string; detail: string; }[];
  habits: { habitCatalogId: string; duration: string; quantity: string; frequency: string; observations: string; }[];
  exercises: { exerciseCatalogId: string; timesPerWeek: string; }[];
  medicalHistory: { icd10CodeId: number | null; observations: string; }[];
  surgicalHistory: { surgicalProcedureId: string; observations: string; }[];
  traumaHistory: { icd10CodeId: number | null; observations: string; }[];
  familyHistory: { icd10CodeId: number | null; observations: string; }[];
  occupationalExposures: { occupationalExposureId: string; observations: string; }[];
  workDisabilities: { workDisabilityId: string; observations: string; }[];
};

import { PatientHistoryFormSection } from "@/features/patient-history/components/patient-history-form-section";

export function EncounterForm({ 
  patientId, patientSex, catalogs, patientSummary, previousDefaults, isFollowUp, previousEncounterDate, patientHistory,
  mode = "create", encounterId, initialData
}: EncounterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [localCatalogs, setLocalCatalogs] = useState<Record<string, CatalogItem[]>>(catalogs);

  // Sync localCatalogs when server-refreshed catalogs prop arrives with new items.
  // This fixes the issue where a newly created catalog item doesn't appear until
  // a full page reload — router.refresh() re-renders the RSC and sends updated props,
  // but useState ignores them after the initial render.
  useEffect(() => {
    setLocalCatalogs((prev) => {
      const merged: Record<string, CatalogItem[]> = { ...prev };
      for (const key of Object.keys(catalogs)) {
        const serverItems = catalogs[key] ?? [];
        const localItems = prev[key] ?? [];
        // If server now has more items than local, prefer server list
        // (it already contains the newly persisted item).
        if (serverItems.length >= localItems.length) {
          merged[key] = serverItems;
        }
      }
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogs]);
  const [quickAddDialog, setQuickAddDialog] = useState<{
    open: boolean;
    type: CatalogType;
    title: string;
    field: string;
    arrayName?: string;
    arrayIndex?: number;
  }>({
    open: false,
    type: "encounterType" as CatalogType,
    title: "",
    field: "",
  });

  const [allergenDialog, setAllergenDialog] = useState<{
    open: boolean;
    arrayIndex: number;
  }>({ open: false, arrayIndex: 0 });

  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [pendingPatient, setPendingPatient] = useState<PatientListItem | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handlePatientSelect = (patient: PatientListItem) => {
    setPendingPatient(patient);
    setConfirmDialogOpen(true);
  };

  const confirmPatientChange = () => {
    if (pendingPatient) {
      router.push(`/patients/${pendingPatient.id}/encounters/new`);
    }
  };

  const defaultFormData: EncounterFormState = {
    patientId,
    encounterTypeId: "",
    isFirstVisit: false,
    symptomatology: "",
    illnessHistory: "",
    physicalExam: "",
    gynecologicalHistory: "",
    pregnancyStatus: "NOT_APPLICABLE",
    sleepHours: "",
    medicationsAdministered: "",
    suspensionHourId: "",
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
    allergies: patientHistory?.allergies?.map((a: any) => ({ allergenCatalogId: String(a.allergenCatalogId), detail: a.detail || "" })) || [],
    habits: patientHistory?.habits?.map((h: any) => ({ habitCatalogId: String(h.habitCatalogId), duration: h.duration || "", quantity: String(h.quantity || ""), frequency: h.frequency || "", observations: h.observations || "" })) || [],
    exercises: patientHistory?.exercises?.map((e: any) => ({ exerciseCatalogId: String(e.exerciseCatalogId), timesPerWeek: String(e.timesPerWeek || "") })) || [],
    medicalHistory: patientHistory?.medicalHistory?.map((h: any) => ({ icd10CodeId: h.icd10CodeId, observations: h.observations || "" })) || [],
    surgicalHistory: patientHistory?.surgicalHistory?.map((h: any) => ({ surgicalProcedureId: String(h.surgicalProcedureId), observations: h.observations || "" })) || [],
    traumaHistory: patientHistory?.traumaHistory?.map((h: any) => ({ icd10CodeId: h.icd10CodeId, observations: h.observations || "" })) || [],
    familyHistory: patientHistory?.familyHistory?.map((h: any) => ({ icd10CodeId: h.icd10CodeId, observations: h.observations || "" })) || [],
    occupationalExposures: [],
    workDisabilities: []
  };

  const [formData, setFormData] = useState<EncounterFormState>(() => {
    if (mode === "edit" && initialData) {
      return initialData;
    }
    if (!previousDefaults) return defaultFormData;
    // En modo reconsulta: los campos clínicos de la consulta vienen de previousDefaults,
    // pero los antecedentes (allergies, habits, exercises, historial médico/quirúrgico/traumático/familiar)
    // siempre se toman del historial actualizado del paciente (defaultFormData).
    return {
      ...defaultFormData,          // base con antecedentes de patientHistory
      ...previousDefaults,         // sobreescribe con datos de la consulta anterior
      // Antecedentes: forzar los del historial del paciente (no los de la consulta previa)
      allergies: defaultFormData.allergies,
      habits: defaultFormData.habits,
      exercises: defaultFormData.exercises,
      medicalHistory: defaultFormData.medicalHistory,
      surgicalHistory: defaultFormData.surgicalHistory,
      traumaHistory: defaultFormData.traumaHistory,
      familyHistory: defaultFormData.familyHistory,
    } as EncounterFormState;
  });

  const handleClearData = () => {
    setFormData(defaultFormData);
    toast.success("Formulario limpiado. Puede ingresar datos nuevos.");
  };

  const getFieldError = (path: string): string | undefined => fieldErrors[path]?.join(", ");
  const getCatalogOptions = (catalogKey: string): SelectOption[] => {
    return (localCatalogs[catalogKey] ?? []).map((item) => ({ key: String(item.id), label: item.name }));
  };

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: string, field: string, value: unknown) => {
    setFormData((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleArrayChange = (section: string, index: number, field: string, value: unknown) => {
    const uniqueFields: Record<string, string> = {
      diagnoses: "icd10CodeId",
      allergies: "allergenCatalogId",
      habits: "habitCatalogId",
      exercises: "exerciseCatalogId",
      medicalHistory: "icd10CodeId",
      surgicalHistory: "surgicalProcedureId",
      traumaHistory: "icd10CodeId",
      familyHistory: "icd10CodeId",
      occupationalExposures: "occupationalExposureId",
      workDisabilities: "workDisabilityId"
    };

    if (uniqueFields[section] === field && value !== null && value !== "") {
      const isDuplicate = (formData[section as keyof typeof formData] as any[]).some(
        (item: any, i: number) => i !== index && String(item[field]) === String(value)
      );

      if (isDuplicate) {
        toast.error("Este elemento ya ha sido agregado a la lista.");
        return;
      }
    }

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
    const validDiagnoses = formData.diagnoses.filter((d) => d.icd10CodeId);
    if (validDiagnoses.length > 0 && !validDiagnoses.some((d) => d.isPrimary)) {
      clientErrors["diagnoses"] = ["Al menos un diagnóstico debe estar marcado como principal"];
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
        suspensionHourId: toOptionalNumber(formData.suspensionHourId),
        referralLevelId: toOptionalNumber(formData.referralLevelId),
        medicalAptitudeId: toOptionalNumber(formData.medicalAptitudeId),
        physicalExam: formData.physicalExam || undefined,
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

        diagnoses: formData.diagnoses.map((d) => ({
          icd10CodeId: toOptionalNumber(d.icd10CodeId),
          diseaseTypeId: toOptionalNumber(d.diseaseTypeId),
          observations: d.observations || undefined,
          isPrimary: d.isPrimary
        })).filter((d) => d.icd10CodeId),

        allergies: formData.allergies.map((a) => ({
          allergenCatalogId: toOptionalNumber(a.allergenCatalogId),
          detail: a.detail || undefined
        })).filter((a) => a.allergenCatalogId),

        habits: formData.habits.map((h) => ({
          habitCatalogId: toOptionalNumber(h.habitCatalogId),
          duration: h.duration || undefined,
          quantity: toOptionalNumber(h.quantity),
          frequency: h.frequency || undefined,
          observations: h.observations || undefined
        })).filter((h) => h.habitCatalogId),

        exercises: formData.exercises.map((e: any) => ({
          exerciseCatalogId: toOptionalNumber(e.exerciseCatalogId),
          timesPerWeek: toOptionalNumber(e.timesPerWeek)
        })).filter((e: any) => e.exerciseCatalogId),

        medicalHistory: formData.medicalHistory.map((h) => ({
          icd10CodeId: toOptionalNumber(h.icd10CodeId),
          observations: h.observations || undefined
        })).filter((h) => h.icd10CodeId),

        surgicalHistory: formData.surgicalHistory.map((s) => ({
          surgicalProcedureId: toOptionalNumber(s.surgicalProcedureId),
          observations: s.observations || undefined
        })).filter((s) => s.surgicalProcedureId),

        traumaHistory: formData.traumaHistory.map((h) => ({
          icd10CodeId: toOptionalNumber(h.icd10CodeId),
          observations: h.observations || undefined
        })).filter((h) => h.icd10CodeId),

        familyHistory: formData.familyHistory.map((h) => ({
          icd10CodeId: toOptionalNumber(h.icd10CodeId),
          observations: h.observations || undefined
        })).filter((h) => h.icd10CodeId),

        occupationalExposures: formData.occupationalExposures.map((e) => ({
          occupationalExposureId: toOptionalNumber(e.occupationalExposureId),
          observations: e.observations || undefined
        })).filter((e) => e.occupationalExposureId),

        workDisabilities: formData.workDisabilities.map((w) => ({
          workDisabilityId: toOptionalNumber(w.workDisabilityId),
          observations: w.observations || undefined
        })).filter((w) => w.workDisabilityId),
      };

      const res = mode === "edit" && encounterId 
        ? await updateEncounter({ ...payload, id: encounterId })
        : await createEncounter(payload);

      if (res.success) {
        toast.success(mode === "edit" ? "Consulta actualizada correctamente" : "Consulta creada correctamente");
        if (mode === "edit" && encounterId) {
          router.push(`/patients/${patientId}/encounters/${encounterId}`);
        } else {
          router.push(`/patients/${patientId}`);
        }
      } else {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
          toast.error("Por favor, revisa los campos marcados en rojo.");
          scrollToFirstError(res.fieldErrors);
        } else {
          toast.error(res.error || `Ocurrió un error al ${mode === "edit" ? "actualizar" : "crear"} la consulta`);
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
      {/* 1. Contexto del Paciente */}
      {patientSummary && (
        <Card className="bg-muted/10">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg leading-none">{patientSummary.fullName}</h3>
                {isFollowUp && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                    Reconsulta
                  </Badge>
                )}
                {mode === "edit" && (
                  <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                    Editando
                  </Badge>
                )}
                {mode === "create" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setPatientSearchOpen(true)}
                    className="sm:hidden h-6 w-6"
                    title="Cambiar Paciente"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {patientSummary.identityDocument} • {patientSummary.age} años {patientSummary.phone ? `• Tel: ${patientSummary.phone}` : ''}
              </p>
              {isFollowUp && previousEncounterDate && (
                <p className="text-xs text-muted-foreground mt-1 text-blue-600">
                  Datos precargados de la consulta del {new Intl.DateTimeFormat('es-ES', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  }).format(new Date(previousEncounterDate))}
                </p>
              )}
            </div>
            {mode === "create" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPatientSearchOpen(true)}
                className="hidden sm:flex"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Cambiar Paciente
              </Button>
            )}
            <div className="text-left md:text-right text-sm text-muted-foreground flex flex-col items-start md:items-end gap-2">
              <div>
                {patientSummary.jobPosition && <p>Puesto: <span className="font-medium text-foreground">{patientSummary.jobPosition}</span></p>}
                {patientSummary.workplace && <p>Lugar: <span className="font-medium text-foreground">{patientSummary.workplace}</span></p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Motivo de Consulta</CardTitle>
          <CardDescription>Información principal de la consulta.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogSelectFieldWithAdd
            name="encounterTypeId"
            label="Tipo de Consulta"
            value={formData.encounterTypeId}
            options={getCatalogOptions("encounterType")}
            placeholder="Seleccione el tipo de consulta"
            isRequired
            error={getFieldError("encounterTypeId")}
            onChange={(val) => handleFieldChange("encounterTypeId", val)}
            onAddClick={() => setQuickAddDialog({
              open: true,
              type: "encounterType",
              title: "Tipo de Consulta",
              field: "encounterTypeId"
            })}
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
          <div className="col-span-2 flex flex-col gap-2">
            <Label>Examen físico</Label>
            <Textarea
              className={getFieldError("physicalExam") ? "border-destructive ring-1 ring-destructive" : ""}
              aria-invalid={!!getFieldError("physicalExam")}
              value={formData.physicalExam || ""}
              onChange={(e) => handleFieldChange("physicalExam", e.target.value)}
              placeholder="Describa el examen físico..."
            />
            <FieldError error={getFieldError("physicalExam")} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Antecedentes  */}
      <SectionDivider title="Antecedentes" />

      <PatientHistoryFormSection
        formData={formData}
        handleArrayChange={handleArrayChange}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
        catalogs={localCatalogs}
        patientHistory={patientHistory}
      />

      {/* 4. Exploración y Diagnósticos */}
      <SectionDivider title="Datos de la Consulta" />

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
            { field: "systolicBP", label: "Presión arterial sistólica (mmHg)" },
            { field: "diastolicBP", label: "Presión arterial diastólica (mmHg)" },
            { field: "heartRate", label: "Frecuencia cardiaca (lpm)" },
            { field: "respiratoryRate", label: "Frecuencia respiratoria (rpm)" },
            { field: "oxygenSaturation", label: "Saturación de oxígeno (%)" },
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
                  value={(formData.vitalSign as any)[field]}
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
                value={(formData.anthropometry as any)[field]}
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
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{bmi}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Clasificación: </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{bmiCategoryEs[category]}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </CollapsibleSection>


      <CollapsibleSection title="Diagnósticos (Obligatorio)" defaultExpanded>
        {getFieldError("diagnoses") && <FieldError error={getFieldError("diagnoses")} />}
        <div className="flex flex-col gap-4">
          {formData.diagnoses.map((d, index: number) => (
            <div key={index} className="flex flex-col gap-4 p-4 border rounded-lg relative">
              {index > 0 && (
                <Button
                  type="button"
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
                <CatalogSelectFieldWithAdd
                  name={`dx-type-${index}`}
                  label="Tipo de Enfermedad"
                  value={String(d.diseaseTypeId || "")}
                  options={getCatalogOptions("diseaseType")}
                  placeholder="Seleccione..."
                  onChange={(val) => handleArrayChange("diagnoses", index, "diseaseTypeId", val)}
                  onAddClick={() => setQuickAddDialog({
                    open: true,
                    type: "diseaseType",
                    title: "Tipo de Enfermedad",
                    field: "diseaseTypeId",
                    arrayName: "diagnoses",
                    arrayIndex: index
                  })}
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
                      setFormData((prev) => ({ ...prev, diagnoses: arr }));
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
            {formData.occupationalExposures.map((e, index: number) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <CatalogSelectFieldWithAdd
                    name={`occ-${index}`}
                    label="Exposición"
                    value={String(e.occupationalExposureId || "")}
                    options={getCatalogOptions("occupationalExposure")}
                    placeholder="Seleccione..."
                    onChange={(val) => handleArrayChange("occupationalExposures", index, "occupationalExposureId", val)}
                    onAddClick={() => setQuickAddDialog({
                      open: true,
                      type: "occupationalExposure",
                      title: "Exposición Laboral",
                      field: "occupationalExposureId",
                      arrayName: "occupationalExposures",
                      arrayIndex: index
                    })}
                  />
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
                <Button type="button" variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeArrayItem("occupationalExposures", index)}>
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
            {formData.workDisabilities.map((w, index: number) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <CatalogSelectFieldWithAdd
                    name={`dis-${index}`}
                    label="Discapacidad"
                    value={String(w.workDisabilityId || "")}
                    options={getCatalogOptions("workDisability")}
                    placeholder="Seleccione..."
                    onChange={(val) => handleArrayChange("workDisabilities", index, "workDisabilityId", val)}
                    onAddClick={() => setQuickAddDialog({
                      open: true,
                      type: "workDisability",
                      title: "Discapacidad Laboral",
                      field: "workDisabilityId",
                      arrayName: "workDisabilities",
                      arrayIndex: index
                    })}
                  />
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
                <Button type="button" variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeArrayItem("workDisabilities", index)}>
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
          "suspensionHourId", "sleepHours", "followUpDate",
          "internalObservation", "employerObservation"
        ].some((f) => !!getFieldError(f))}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogSelectFieldWithAdd
            name="referralLevelId"
            label="Nivel de Referencia"
            value={String(formData.referralLevelId || "")}
            options={getCatalogOptions("referralLevel")}
            placeholder="Seleccione..."
            onChange={(val) => handleFieldChange("referralLevelId", val)}
            onAddClick={() => setQuickAddDialog({
              open: true,
              type: "referralLevel",
              title: "Nivel de Referencia",
              field: "referralLevelId"
            })}
          />
          <CatalogSelectFieldWithAdd
            name="medicalAptitudeId"
            label="Aptitud Médica"
            value={String(formData.medicalAptitudeId || "")}
            options={getCatalogOptions("medicalAptitude")}
            placeholder="Seleccione..."
            onChange={(val) => handleFieldChange("medicalAptitudeId", val)}
            onAddClick={() => setQuickAddDialog({
              open: true,
              type: "medicalAptitude",
              title: "Aptitud Médica",
              field: "medicalAptitudeId"
            })}
          />

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
          <CatalogSelectFieldWithAdd
            name="suspensionHourId"
            label="Horas de Suspensión (Descanso)"
            value={String(formData.suspensionHourId || "")}
            options={getCatalogOptions("suspensionHour")}
            placeholder="Seleccione..."
            onChange={(val) => handleFieldChange("suspensionHourId", val)}
            onAddClick={() => setQuickAddDialog({
              open: true,
              type: "suspensionHour",
              title: "Horas de Suspensión (Descanso)",
              field: "suspensionHourId"
            })}
          />
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
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.followUpDate && "text-muted-foreground",
                      getFieldError("followUpDate") && "border-destructive ring-1 ring-destructive"
                    )}
                  />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.followUpDate ? format(new Date(formData.followUpDate + "T12:00:00"), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.followUpDate ? new Date(formData.followUpDate + "T12:00:00") : undefined}
                  onSelect={(date) => {
                    handleFieldChange("followUpDate", date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
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

      <div className="flex justify-end gap-4 mt-6">
          {mode === "create" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClearData}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Limpiar Formulario
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Guardando..." : mode === "edit" ? "Guardar Cambios" : "Crear Consulta"}
          </Button>
        </div>

      <CatalogQuickAddDialog
        type={quickAddDialog.type as CatalogType}
        title={quickAddDialog.title}
        open={quickAddDialog.open}
        onOpenChange={(open) => setQuickAddDialog((prev) => ({ ...prev, open }))}
        onSuccess={(item) => {
          setLocalCatalogs((prev) => ({
            ...prev,
            [quickAddDialog.type]: [...(prev[quickAddDialog.type] || []), item],
          }));
          if (quickAddDialog.arrayName && quickAddDialog.arrayIndex !== undefined) {
            handleArrayChange(quickAddDialog.arrayName, quickAddDialog.arrayIndex, quickAddDialog.field, String(item.id));
          } else {
            handleFieldChange(quickAddDialog.field, String(item.id));
          }
        }}
      />

      <AllergenQuickAddDialog
        open={allergenDialog.open}
        allergyCategories={localCatalogs["allergyCategory"] || []}
        onOpenChange={(open) => setAllergenDialog((prev) => ({ ...prev, open }))}
        onSuccess={(item) => {
          setLocalCatalogs((prev) => ({
            ...prev,
            allergenCatalog: [...(prev["allergenCatalog"] || []), item],
          }));
          handleArrayChange("allergies", allergenDialog.arrayIndex, "allergenCatalogId", String(item.id));
        }}
      />

      <NewEncounterModal
        open={patientSearchOpen}
        onOpenChange={setPatientSearchOpen}
        onSelect={handlePatientSelect}
      />

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar de paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de cambiar de paciente. Cualquier dato que hayas ingresado en este formulario se perderá y no podrá recuperarse. ¿Deseas continuar y registrar la consulta para el nuevo paciente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPatientChange} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, cambiar paciente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
