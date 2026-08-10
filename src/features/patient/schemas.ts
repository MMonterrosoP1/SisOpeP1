import { z } from "zod";
import { DocumentTypeSchema, SexSchema } from "@/shared/schemas/enums";
import { idParamSchema } from "@/shared/utils/zod-helpers";

export const emergencyContactSchema = z.object({
  id: z.number().int().optional(),
  fullName: z.string().trim().min(1, "El nombre completo es obligatorio").max(255),
  phone: z.string().trim().min(1, "El teléfono es obligatorio").max(20),
  relationshipTypeId: idParamSchema,
  isPrimary: z.boolean().default(false),
});

export const basePatientSchema = z.object({
  givenNames: z.string().trim().min(1, "Los nombres son obligatorios").max(255),
  familyNames: z.string().trim().min(1, "Los apellidos son obligatorios").max(255),
  documentType: DocumentTypeSchema,
  identityDocument: z.string().trim().min(1, "El documento de identidad es obligatorio").max(50),
  birthDate: z.coerce.date().refine((date) => date <= new Date(), {
    message: "La fecha de nacimiento no puede estar en el futuro",
  }),
  sex: SexSchema,
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email("Debe ser un correo válido").optional().or(z.literal("")),
  maritalStatusId: idParamSchema,
  companyId: idParamSchema,
  workplaceId: idParamSchema,
  workAreaId: idParamSchema.optional(),
  jobPositionId: idParamSchema,
  bloodTypeId: idParamSchema.optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
});

export const createPatientSchema = basePatientSchema.superRefine((data, ctx) => {
  if (data.documentType === "DPI" && !/^\d{13}$/.test(data.identityDocument)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El DPI debe tener exactamente 13 dígitos numéricos",
      path: ["identityDocument"],
    });
  }
});

export const updatePatientSchema = basePatientSchema.partial().extend({
  active: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.documentType === "DPI" && data.identityDocument && !/^\d{13}$/.test(data.identityDocument)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El DPI debe tener exactamente 13 dígitos numéricos",
      path: ["identityDocument"],
    });
  }
});

export const patientFilterSchema = z.object({
  search: z.string().optional(),
  active: z.boolean().optional(),
  companyId: idParamSchema.optional(),
  workplaceId: idParamSchema.optional(),
  workAreaId: idParamSchema.optional(),
  jobPositionId: idParamSchema.optional(),
});
