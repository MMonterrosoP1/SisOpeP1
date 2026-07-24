"use client";

import { useState } from "react";
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

type CatalogItem = {
  id: number;
  name: string;
  acronym?: string | null;
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
  maritalStatusId: string;
  bloodTypeId: string;
  companyId: string;
  workplaceId: string;
  workAreaId: string;
  jobPositionId: string;
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

interface PatientFormProps {
  initialData?: PatientWithRelations;
  catalogs: Record<string, CatalogItem[]>;
}

export function PatientForm({ initialData, catalogs }: PatientFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<PatientFormData>({
    givenNames: initialData?.givenNames || "",
    familyNames: initialData?.familyNames || "",
    documentType: initialData?.documentType || "DPI",
    identityDocument: initialData?.identityDocument || "",
    birthDate: formatDateInputValue(initialData?.birthDate),
    sex: initialData?.sex || "MALE",
    phone: initialData?.phone || "",
    maritalStatusId: initialData?.maritalStatusId ? String(initialData.maritalStatusId) : "",
    bloodTypeId: initialData?.bloodTypeId ? String(initialData.bloodTypeId) : "",
    companyId: initialData?.companyId ? String(initialData.companyId) : "",
    workplaceId: initialData?.workplaceId ? String(initialData.workplaceId) : "",
    workAreaId: initialData?.workAreaId ? String(initialData.workAreaId) : "",
    jobPositionId: initialData?.jobPositionId ? String(initialData.jobPositionId) : "",
    emergencyContacts:
      initialData?.emergencyContacts?.map((contact) => ({
        id: contact.id,
        fullName: contact.fullName,
        phone: contact.phone,
        relationshipTypeId: String(contact.relationshipTypeId),
      })) || [],
  });

  const getFieldError = (path: string): string | undefined => fieldErrors[path]?.join(", ");

  const getCatalogOptions = (catalogKey: string): SelectOption[] => {
    const items = (catalogs[catalogKey] ?? []) as CatalogItem[];
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

  const handleChange = <K extends keyof PatientFormData>(field: K, value: PatientFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        maritalStatusId: toOptionalNumber(formData.maritalStatusId),
        bloodTypeId: toOptionalNumber(formData.bloodTypeId),
        companyId: toOptionalNumber(formData.companyId),
        workplaceId: toOptionalNumber(formData.workplaceId),
        workAreaId: toOptionalNumber(formData.workAreaId),
        jobPositionId: toOptionalNumber(formData.jobPositionId),
        emergencyContacts: normalizedEmergencyContacts.length > 0 ? normalizedEmergencyContacts : undefined,
      };

      const res = initialData
        ? await updatePatient(initialData.id, payload)
        : await createPatient(payload);

      if (res.success) {
        toast.success(`Paciente ${initialData ? "actualizado" : "creado"} correctamente`);
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
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className={getFieldError("birthDate") ? "border-destructive" : ""}
                required
              />
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
              <CatalogSelectField
                name="maritalStatusId"
                label="Estado civil"
                value={formData.maritalStatusId}
                options={getCatalogOptions("maritalStatus")}
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

            <CatalogSelectField
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
            <CatalogSelectField
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
              <CatalogSelectField
                name="workplaceId"
                label="Lugar de trabajo"
                value={formData.workplaceId}
                options={getCatalogOptions("workplace")}
                placeholder="Seleccione lugar"
                isRequired
                error={getFieldError("workplaceId")}
                onChange={(value) => handleChange("workplaceId", value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <CatalogSelectField
                name="workAreaId"
                label="Área de trabajo"
                value={formData.workAreaId}
                options={getCatalogOptions("workArea")}
                placeholder="Seleccione área"
                isRequired
                error={getFieldError("workAreaId")}
                onChange={(value) => handleChange("workAreaId", value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <CatalogSelectField
                name="jobPositionId"
                label="Puesto laboral"
                value={formData.jobPositionId}
                options={getCatalogOptions("jobPosition")}
                placeholder="Seleccione puesto"
                isRequired
                error={getFieldError("jobPositionId")}
                onChange={(value) => handleChange("jobPositionId", value)}
              />
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
                        <CatalogSelectField
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
    </form>
  );
}
