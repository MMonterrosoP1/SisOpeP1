"use client";

import { useMemo, useState } from "react";
import { Button, Card, FieldError, Input, Label, ListBox, Select, TextField } from "@heroui/react";
import { PatientWithRelations } from "../types";
import { createPatient, updatePatient } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type CatalogItem = {
  id: number;
  name: string;
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

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;

  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  if (date > today) return null;

  let years = today.getFullYear() - date.getFullYear();
  const hasNotHadBirthdayThisYear =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());

  if (hasNotHadBirthdayThisYear) {
    years -= 1;
  }

  return years;
}

function toOptionalNumber(value: string): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
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
    <Select
      name={name}
      selectedKey={value || null}
      onSelectionChange={(key) => onChange(key ? String(key) : "")}
      placeholder={placeholder}
      isRequired={isRequired}
      isInvalid={Boolean(error)}
      fullWidth
      variant="secondary"
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <FieldError>{error}</FieldError>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.key} id={option.key} textValue={option.label}>
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
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

  const age = useMemo(() => calculateAge(formData.birthDate), [formData.birthDate]);

  const getFieldError = (path: string): string | undefined => fieldErrors[path]?.join(", ");

  const getCatalogOptions = (catalogKey: string): SelectOption[] => {
    const items = (catalogs[catalogKey] ?? []) as CatalogItem[];
    return items.map((item) => ({
      key: String(item.id),
      label: item.name,
    }));
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
        router.refresh();
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
      <Card className="p-6 border border-default-200 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Datos personales</h2>
          <p className="text-sm text-default-500">Información básica de identificación del paciente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField name="givenNames" isRequired isInvalid={Boolean(getFieldError("givenNames"))}>
            <Label>Nombres</Label>
            <Input
              value={formData.givenNames}
              onChange={(e) => handleChange("givenNames", e.target.value)}
              placeholder="Ej. Juan Carlos"
            />
            <FieldError>{getFieldError("givenNames")}</FieldError>
          </TextField>

          <TextField name="familyNames" isRequired isInvalid={Boolean(getFieldError("familyNames"))}>
            <Label>Apellidos</Label>
            <Input
              value={formData.familyNames}
              onChange={(e) => handleChange("familyNames", e.target.value)}
              placeholder="Ej. Pérez López"
            />
            <FieldError>{getFieldError("familyNames")}</FieldError>
          </TextField>

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

          <TextField
            name="identityDocument"
            isRequired
            isInvalid={Boolean(getFieldError("identityDocument"))}
          >
            <Label>Documento de identidad</Label>
            <Input
              value={formData.identityDocument}
              onChange={(e) => handleChange("identityDocument", e.target.value)}
              placeholder="Ej. 1234567890123"
            />
            <FieldError>{getFieldError("identityDocument")}</FieldError>
          </TextField>

          <TextField name="birthDate" isRequired isInvalid={Boolean(getFieldError("birthDate"))}>
            <Label>Fecha de nacimiento</Label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
            <FieldError>{getFieldError("birthDate")}</FieldError>
          </TextField>

          <TextField name="age">
            <Label>Edad</Label>
            <Input
              value={age !== null ? `${age} años` : "Se calcula automáticamente"}
              readOnly
            />
          </TextField>

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

          <TextField name="phone" isInvalid={Boolean(getFieldError("phone"))}>
            <Label>Teléfono</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Ej. 5555-5555"
            />
            <FieldError>{getFieldError("phone")}</FieldError>
          </TextField>

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
      </Card>

      <Card className="p-6 border border-default-200 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Datos laborales</h2>
          <p className="text-sm text-default-500">Empresa, sede y puesto actual del paciente.</p>
        </div>

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
      </Card>

      <Card className="p-6 border border-default-200 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Contactos de emergencia</h2>
            <p className="text-sm text-default-500">Agrega uno o más contactos con parentesco.</p>
          </div>
          <Button type="button" variant="outline" onPress={addEmergencyContact}>
            Agregar contacto
          </Button>
        </div>

        {formData.emergencyContacts.length === 0 ? (
          <p className="text-sm text-default-500">No hay contactos agregados.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {formData.emergencyContacts.map((contact, index) => (
              <Card key={`contact-${index}`} className="p-4 border border-default-200 bg-default-50 shadow-none">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm font-semibold">Contacto #{index + 1}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    color="danger"
                    onPress={() => removeEmergencyContact(index)}
                  >
                    Quitar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    name={`emergencyContacts.${index}.fullName`}
                    isInvalid={Boolean(getFieldError(`emergencyContacts.${index}.fullName`))}
                  >
                    <Label>Nombre del contacto</Label>
                    <Input
                      value={contact.fullName}
                      onChange={(e) => handleEmergencyChange(index, "fullName", e.target.value)}
                      placeholder="Ej. Ana Pérez"
                    />
                    <FieldError>{getFieldError(`emergencyContacts.${index}.fullName`)}</FieldError>
                  </TextField>

                  <TextField
                    name={`emergencyContacts.${index}.phone`}
                    isInvalid={Boolean(getFieldError(`emergencyContacts.${index}.phone`))}
                  >
                    <Label>Teléfono</Label>
                    <Input
                      value={contact.phone}
                      onChange={(e) => handleEmergencyChange(index, "phone", e.target.value)}
                      placeholder="Ej. 4444-4444"
                    />
                    <FieldError>{getFieldError(`emergencyContacts.${index}.phone`)}</FieldError>
                  </TextField>

                  <CatalogSelectField
                    name={`emergencyContacts.${index}.relationshipTypeId`}
                    label="Parentesco"
                    value={contact.relationshipTypeId}
                    options={getCatalogOptions("relationshipType")}
                    placeholder="Seleccione parentesco"
                    error={getFieldError(`emergencyContacts.${index}.relationshipTypeId`)}
                    onChange={(value) => handleEmergencyChange(index, "relationshipTypeId", value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onPress={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isDisabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Paciente"}
        </Button>
      </div>
    </form>
  );
}
