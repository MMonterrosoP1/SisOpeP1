"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PatientWithRelations } from "../types";
import { createPatient, updatePatient } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ComboboxSelect } from "@/components/ui/combobox-select";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { TypedCatalogAddDialog } from "@/features/catalog/components/typed-catalog-dialogs";
import { WorkplaceAddDialog } from "@/features/catalog/components/workplace-dialogs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type CatalogItem = {
  id: number;
  name: string;
  acronym?: string | null;
  sex?: "MALE" | "FEMALE" | null;
  type?: string | null;
  companyId?: number | null;
};

type SelectOption = {
  key: string;
  label: string;
};

type EmergencyContactFormData = {
  id?: number;
  fullName: string;
  phone: string;
  relationshipTypeId: string;
};

type PatientFormData = {
  givenNames: string;
  familyNames: string;
  documentType: "DPI" | "PASSPORT" | "OTHER";
  identityDocument: string;
  birthDate: string;
  sex: "MALE" | "FEMALE";
  phone: string;
  email: string;
  maritalStatusId: string;
  bloodTypeId: string;
  companyId: string;
  workplaceId: string;
  workAreaId: string;
  jobPositionId: string;
  employeeCode: string;
  emergencyContacts: EmergencyContactFormData[];
};

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

const EMPTY_CONTACT: EmergencyContactFormData = {
  fullName: "",
  phone: "",
  relationshipTypeId: "",
};

function buildInitialFormData(initialData?: PatientWithRelations): PatientFormData {
  return {
    givenNames: initialData?.person?.givenNames || "",
    familyNames: initialData?.person?.familyNames || "",
    documentType: initialData?.person?.documentType || "DPI",
    identityDocument: initialData?.person?.identityDocument || "",
    birthDate: formatDateInputValue(initialData?.person?.birthDate),
    sex: initialData?.person?.sex || "MALE",
    phone: initialData?.person?.phone || "",
    email: initialData?.person?.email || "",
    maritalStatusId: initialData?.maritalStatusId ? String(initialData.maritalStatusId) : "",
    bloodTypeId: initialData?.bloodTypeId ? String(initialData.bloodTypeId) : "",
    companyId: initialData?.companyId ? String(initialData.companyId) : "",
    workplaceId: initialData?.workplaceId ? String(initialData.workplaceId) : "",
    workAreaId: initialData?.workAreaId ? String(initialData.workAreaId) : "",
    jobPositionId: initialData?.jobPositionId ? String(initialData.jobPositionId) : "",
    employeeCode: initialData?.employeeCode || "",
    emergencyContacts:
      initialData?.emergencyContacts?.map((contact) => ({
        id: contact.id,
        fullName: contact.fullName,
        phone: contact.phone,
        relationshipTypeId: String(contact.relationshipTypeId),
      })) || [],
  };
}

function formatDateInputValue(value?: Date | string | null): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0] ?? "";
}

function toOptionalNumber(value: string): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-sm text-destructive mt-1">{error}</p>;
}

function CatalogSelectField({
  name,
  label,
  value,
  options,
  placeholder,
  isRequired,
  error,
  onChange,
}: CatalogSelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value || ""} onValueChange={(newValue) => onChange(newValue || "")}>
        <SelectTrigger id={name} className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder}>
            {(selectedValue) => {
              const selectedKey = String(selectedValue ?? "");
              const selectedOption = options.find((option) => option.key === selectedKey);
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
      {error && <FieldError error={error} />}
    </div>
  );
}

function CatalogComboboxField({
  name,
  label,
  value,
  options,
  placeholder,
  isRequired,
  error,
  onChange,
}: CatalogSelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <ComboboxSelect
        id={name}
        value={value || ""}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={`Buscar ${label.toLowerCase()}...`}
        invalid={!!error}
        onValueChange={(newValue) => onChange(newValue || "")}
      />
      {error && <FieldError error={error} />}
    </div>
  );
}

function CatalogComboboxFieldWithAdd({
  name,
  label,
  value,
  options,
  placeholder,
  isRequired,
  error,
  onChange,
  onAddClick,
}: CatalogSelectFieldProps & { onAddClick: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>
        {label}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <ComboboxSelect
            id={name}
            value={value || ""}
            options={options}
            placeholder={placeholder}
            searchPlaceholder={`Buscar ${label.toLowerCase()}...`}
            invalid={!!error}
            onValueChange={(newValue) => onChange(newValue || "")}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddClick}
          className="shrink-0"
          title={`Agregar nuevo ${label.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {error && <FieldError error={error} />}
    </div>
  );
}

interface PatientFormProps {
  initialData?: PatientWithRelations;
  catalogs: Record<string, CatalogItem[]>;
}

export function PatientForm({ initialData, catalogs }: PatientFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [localCatalogs, setLocalCatalogs] = useState<Record<string, CatalogItem[]>>(catalogs);

  useEffect(() => {
    setLocalCatalogs(catalogs);
  }, [catalogs]);

  const [quickAddDialog, setQuickAddDialog] = useState<{
    open: boolean;
    type: "workplace" | "workArea" | "jobPosition";
    title: string;
    field: keyof PatientFormData;
  }>({
    open: false,
    type: "workplace",
    title: "",
    field: "workplaceId",
  });

  const [formData, setFormData] = useState<PatientFormData>(() => buildInitialFormData(initialData));

  const getFieldError = (path: string): string | undefined => fieldErrors[path]?.join(", ");

  const getCatalogOptions = (catalogKey: string): SelectOption[] => {
    const items = (localCatalogs[catalogKey] ?? []) as CatalogItem[];
    return items.map((item) => {
      let label = item.name;
      if (catalogKey === "company" && item.acronym) {
        label = item.acronym; // The user requested to show the acronym for companies
      }
      return {
        key: String(item.id),
        label,
      };
    });
  };

  const handleChange = (field: keyof PatientFormData, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "sex" && next.maritalStatusId) {
        const currentMaritalStatus = localCatalogs.maritalStatus?.find(ms => String(ms.id) === next.maritalStatusId);
        if (currentMaritalStatus && currentMaritalStatus.sex && currentMaritalStatus.sex !== value) {
          next.maritalStatusId = "";
        }
      }

      if (field === "companyId") {
        next.workplaceId = "";
        next.workAreaId = "";
        next.jobPositionId = "";
      } else if (field === "workplaceId") {
        next.workAreaId = "";
        next.jobPositionId = "";
      }

      return next;
    });
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEmergencyChange = <K extends keyof EmergencyContactFormData>(
    index: number,
    field: K,
    value: EmergencyContactFormData[K]
  ) => {
    setFormData((prev) => {
      const nextContacts = [...prev.emergencyContacts];
      nextContacts[index] = { ...nextContacts[index], [field]: value };
      return {
        ...prev,
        emergencyContacts: nextContacts,
      };
    });
  };

  const addEmergencyContact = () => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { ...EMPTY_CONTACT }],
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    try {
      const normalizedEmergencyContacts = formData.emergencyContacts
        .filter(
          (contact) =>
            contact.fullName.trim() !== "" ||
            contact.phone.trim() !== "" ||
            contact.relationshipTypeId !== ""
        )
        .map((contact, index) => ({
          id: contact.id,
          fullName: contact.fullName.trim(),
          phone: contact.phone.trim(),
          relationshipTypeId: toOptionalNumber(contact.relationshipTypeId),
          isPrimary: index === 0,
        }));

      const payload = {
        givenNames: formData.givenNames.trim(),
        familyNames: formData.familyNames.trim(),
        documentType: formData.documentType,
        identityDocument: formData.identityDocument.trim(),
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
        sex: formData.sex,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        maritalStatusId: toOptionalNumber(formData.maritalStatusId),
        bloodTypeId: toOptionalNumber(formData.bloodTypeId),
        companyId: toOptionalNumber(formData.companyId),
        workplaceId: toOptionalNumber(formData.workplaceId),
        workAreaId: toOptionalNumber(formData.workAreaId),
        jobPositionId: toOptionalNumber(formData.jobPositionId),
        employeeCode: formData.employeeCode || undefined,
        emergencyContacts: normalizedEmergencyContacts.length > 0 ? normalizedEmergencyContacts : undefined,
      };

      const res = initialData
        ? await updatePatient(initialData.id, payload)
        : await createPatient(payload);

      if (res.success) {
        // Resetear el formulario antes de navegar para evitar que el router cache
        // de Next.js muestre los datos del paciente anterior al volver a /patients/new
        setFormData(buildInitialFormData(undefined));
        setFieldErrors({});

        if (!initialData && res.data && typeof res.data === "object" && "id" in res.data) {
          const newPatientId = (res.data as { id: string | number }).id;
          toast.success("Paciente registrado exitosamente", {
            description: "¿Deseas iniciar su primera consulta médica ahora?",
            position: "bottom-right",
            action: {
              label: "Iniciar consulta",
              onClick: () => router.push(`/patients/${newPatientId}/encounters/new`),
            },
            actionButtonStyle: {
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
            },

            duration: 5000,
          });
        } else {
          toast.success(`Paciente ${initialData ? "actualizado" : "creado"} correctamente`);
        }
        router.push("/patients");
      } else {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
          toast.error("Por favor, revisa los campos marcados en rojo.");
        } else {
          toast.error(res.error || "Revisa los campos del formulario");
        }
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const documentTypeOptions: SelectOption[] = [
    { key: "DPI", label: "DPI" },
    { key: "PASSPORT", label: "Pasaporte" },
    { key: "OTHER", label: "Otro" },
  ];

  const sexOptions: SelectOption[] = [
    { key: "MALE", label: "Masculino" },
    { key: "FEMALE", label: "Femenino" },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Información básica de identificación del paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="givenNames">
                Nombres <span className="text-destructive">*</span>
              </Label>
              <Input
                id="givenNames"
                value={formData.givenNames}
                onChange={(e) => handleChange("givenNames", e.target.value)}
                placeholder="Ej. Juan Carlos"
                className={getFieldError("givenNames") ? "border-destructive" : ""}
                required
              />
              {getFieldError("givenNames") && <FieldError error={getFieldError("givenNames")} />}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="familyNames">
                Apellidos <span className="text-destructive">*</span>
              </Label>
              <Input
                id="familyNames"
                value={formData.familyNames}
                onChange={(e) => handleChange("familyNames", e.target.value)}
                placeholder="Ej. Pérez López"
                className={getFieldError("familyNames") ? "border-destructive" : ""}
                required
              />
              {getFieldError("familyNames") && <FieldError error={getFieldError("familyNames")} />}
            </div>

            <CatalogSelectField
              name="documentType"
              label="Tipo de documento"
              value={formData.documentType}
              options={documentTypeOptions}
              placeholder="Seleccione tipo de documento"
              isRequired
              error={getFieldError("documentType")}
              onChange={(value) => handleChange("documentType", value as PatientFormData["documentType"])}
            />

            <div className="flex flex-col gap-2">
              <Label htmlFor="identityDocument">
                Documento de identidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="identityDocument"
                value={formData.identityDocument}
                onChange={(e) => handleChange("identityDocument", e.target.value)}
                placeholder="Ej. 1234567890123"
                className={getFieldError("identityDocument") ? "border-destructive" : ""}
                required
              />
              {getFieldError("identityDocument") && (
                <FieldError error={getFieldError("identityDocument")} />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="birthDate">
                Fecha de nacimiento <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.birthDate && "text-muted-foreground",
                        getFieldError("birthDate") && "border-destructive ring-1 ring-destructive"
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.birthDate ? format(new Date(formData.birthDate + "T12:00:00"), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.birthDate ? new Date(formData.birthDate + "T12:00:00") : undefined}
                    onSelect={(date) => {
                      handleChange("birthDate", date ? format(date, "yyyy-MM-dd") : "");
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              {getFieldError("birthDate") && <FieldError error={getFieldError("birthDate")} />}
            </div>

            <CatalogSelectField
              name="sex"
              label="Sexo"
              value={formData.sex}
              options={sexOptions}
              placeholder="Seleccione sexo"
              isRequired
              error={getFieldError("sex")}
              onChange={(value) => handleChange("sex", value as PatientFormData["sex"])}
            />

            <div className="flex flex-col gap-2">
              <CatalogComboboxField
                name="maritalStatusId"
                label="Estado Civil"
                value={formData.maritalStatusId}
                options={(localCatalogs.maritalStatus || [])
                  .filter(item => !item.sex || item.sex === formData.sex)
                  .map((item) => ({ key: String(item.id), label: item.name }))}
                placeholder="Seleccione estado civil"
                isRequired
                error={getFieldError("maritalStatusId")}
                onChange={(value) => handleChange("maritalStatusId", value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Ej. 5555-5555"
                className={getFieldError("phone") ? "border-destructive" : ""}
              />
              {getFieldError("phone") && <FieldError error={getFieldError("phone")} />}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Ej. correo@ejemplo.com"
                className={getFieldError("email") ? "border-destructive" : ""}
              />
              {getFieldError("email") && <FieldError error={getFieldError("email")} />}
            </div>

            <CatalogComboboxField
              name="bloodTypeId"
              label="Tipo de sangre"
              value={formData.bloodTypeId}
              options={getCatalogOptions("bloodType")}
              placeholder="Seleccione tipo de sangre"
              error={getFieldError("bloodTypeId")}
              onChange={(value) => handleChange("bloodTypeId", value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos laborales</CardTitle>
          <CardDescription>Empresa, sede y puesto actual del paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CatalogComboboxField
              name="companyId"
              label="Empresa en que trabaja"
              value={formData.companyId}
              options={getCatalogOptions("company")}
              placeholder="Seleccione empresa"
              isRequired
              error={getFieldError("companyId")}
              onChange={(value) => handleChange("companyId", value)}
            />

            <div className="flex flex-col gap-2">
              <CatalogComboboxFieldWithAdd
                name="workplaceId"
                label="Lugar de trabajo"
                value={formData.workplaceId}
                options={getCatalogOptions("workplace").filter(opt => {
                  const wp = localCatalogs.workplace?.find(w => String(w.id) === opt.key);
                  return !wp?.companyId || String(wp.companyId) === formData.companyId;
                })}
                placeholder="Seleccione lugar"
                isRequired
                error={getFieldError("workplaceId")}
                onChange={(value) => handleChange("workplaceId", value)}
                onAddClick={() => setQuickAddDialog({
                  open: true,
                  type: "workplace",
                  title: "Lugar de trabajo",
                  field: "workplaceId"
                })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <CatalogComboboxFieldWithAdd
                name="workAreaId"
                label="Área de trabajo"
                value={formData.workAreaId}
                options={getCatalogOptions("workArea").filter(opt => {
                  const selectedWorkplace = localCatalogs.workplace?.find(w => String(w.id) === formData.workplaceId);
                  const workplaceType = selectedWorkplace?.type;
                  if (!workplaceType) return false;
                  const item = localCatalogs.workArea?.find(w => String(w.id) === opt.key);
                  return !item?.type || item?.type === workplaceType;
                })}
                placeholder="Seleccione área"
                error={getFieldError("workAreaId")}
                onChange={(value) => handleChange("workAreaId", value)}
                onAddClick={() => setQuickAddDialog({
                  open: true,
                  type: "workArea",
                  title: "Área de trabajo",
                  field: "workAreaId"
                })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <CatalogComboboxFieldWithAdd
                name="jobPositionId"
                label="Puesto laboral"
                value={formData.jobPositionId}
                options={getCatalogOptions("jobPosition").filter(opt => {
                  const selectedWorkplace = localCatalogs.workplace?.find(w => String(w.id) === formData.workplaceId);
                  const workplaceType = selectedWorkplace?.type;
                  if (!workplaceType) return false;
                  const item = localCatalogs.jobPosition?.find(j => String(j.id) === opt.key);
                  return !item?.type || item?.type === workplaceType;
                })}
                placeholder="Seleccione puesto"
                isRequired
                error={getFieldError("jobPositionId")}
                onChange={(value) => handleChange("jobPositionId", value)}
                onAddClick={() => setQuickAddDialog({
                  open: true,
                  type: "jobPosition",
                  title: "Puesto laboral",
                  field: "jobPositionId"
                })}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="employeeCode" className="font-medium text-slate-700">
                Código de Empleado
              </Label>
              <Input
                id="employeeCode"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={(e) => handleChange("employeeCode", e.target.value)}
                placeholder="Ej. EMP123"
                className="w-full"
                maxLength={10}
              />
              {getFieldError("employeeCode") && (
                <p className="text-sm text-red-500">{getFieldError("employeeCode")}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Contactos de emergencia</CardTitle>
            <CardDescription>Agrega uno o más contactos con parentesco.</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={addEmergencyContact}>
            Agregar contacto
          </Button>
        </CardHeader>
        <CardContent>
          {formData.emergencyContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay contactos agregados.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {formData.emergencyContacts.map((contact, index) => (
                <Card key={`contact-${index}`} className="border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <p className="text-sm font-semibold">Contacto #{index + 1}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEmergencyContact(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Quitar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`contact-fullname-${index}`}>Nombre del contacto</Label>
                        <Input
                          id={`contact-fullname-${index}`}
                          value={contact.fullName}
                          onChange={(e) =>
                            handleEmergencyChange(index, "fullName", e.target.value)
                          }
                          placeholder="Ej. Ana Pérez"
                          className={
                            getFieldError(`emergencyContacts.${index}.fullName`)
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {getFieldError(`emergencyContacts.${index}.fullName`) && (
                          <FieldError
                            error={getFieldError(`emergencyContacts.${index}.fullName`)}
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`contact-phone-${index}`}>Teléfono</Label>
                        <Input
                          id={`contact-phone-${index}`}
                          value={contact.phone}
                          onChange={(e) => handleEmergencyChange(index, "phone", e.target.value)}
                          placeholder="Ej. 4444-4444"
                          className={
                            getFieldError(`emergencyContacts.${index}.phone`)
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {getFieldError(`emergencyContacts.${index}.phone`) && (
                          <FieldError error={getFieldError(`emergencyContacts.${index}.phone`)} />
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <CatalogComboboxField
                          name={`contact-relationship-${index}`}
                          label="Parentesco"
                          value={contact.relationshipTypeId}
                          options={getCatalogOptions("relationshipType")}
                          placeholder="Seleccione parentesco"
                          error={getFieldError(`emergencyContacts.${index}.relationshipTypeId`)}
                          onChange={(value) =>
                            handleEmergencyChange(index, "relationshipTypeId", value)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Paciente"}
        </Button>
      </div>

      {quickAddDialog.type === "workplace" ? (
        <WorkplaceAddDialog
          open={quickAddDialog.open}
          onOpenChange={(open) => setQuickAddDialog((prev) => ({ ...prev, open }))}
          onSuccess={() => {
            // Recargar catálogos no es trivial aquí sin invalidate, pero simularemos agregando al localCatalogs no es fácil porque onSuccess no devuelve el item.
            // Para mantener consistencia con el diseño actual, el usuario deberá refrescar o se requiere una recarga del servidor.
            // idealmente WorkplaceAddDialog debería devolver el item creado.
            router.refresh();
            setQuickAddDialog((prev) => ({ ...prev, open: false }));
          }}
          companies={localCatalogs.company || []}
        />
      ) : (() => {
        const selectedWorkplace = localCatalogs.workplace?.find(w => String(w.id) === formData.workplaceId);
        const selectedWorkplaceType = selectedWorkplace?.type || undefined;
        
        return (
          <TypedCatalogAddDialog
            catalogType={quickAddDialog.type}
            title={quickAddDialog.title}
            open={quickAddDialog.open}
            allowAll={quickAddDialog.type === "jobPosition" || quickAddDialog.type === "workArea"}
            initialType={selectedWorkplaceType}
            onOpenChange={(open) => setQuickAddDialog((prev) => ({ ...prev, open }))}
            onSuccess={(item) => {
              setLocalCatalogs((prev) => ({
                ...prev,
                [quickAddDialog.type]: [...(prev[quickAddDialog.type] || []), item],
              }));
              handleChange(quickAddDialog.field, String(item.id));
            }}
          />
        );
      })()}
    </form>
  );
}
