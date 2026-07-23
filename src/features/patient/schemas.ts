import { z } from "zod";
import { DocumentTypeSchema, SexSchema } from "@/shared/schemas/enums";
import { idParamSchema } from "@/shared/utils/zod-helpers";

export const emergencyContactSchema = z.object({
  id: z.number().int().optional(),
  fullName: z.string().trim().min(1, "Name is required").max(255),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  relationshipTypeId: idParamSchema,
  isPrimary: z.boolean().default(false),
});

export const basePatientSchema = z.object({
  givenNames: z.string().trim().min(1, "Given names are required").max(255),
  familyNames: z.string().trim().min(1, "Family names are required").max(255),
  documentType: DocumentTypeSchema,
  identityDocument: z.string().trim().min(1, "Document is required").max(50),
  birthDate: z.coerce.date().refine((date) => date <= new Date(), {
    message: "Birth date cannot be in the future",
  }),
  sex: SexSchema,
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  maritalStatusId: idParamSchema,
  companyId: idParamSchema,
  workplaceId: idParamSchema,
  workAreaId: idParamSchema,
  jobPositionId: idParamSchema,
  bloodTypeId: idParamSchema.optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
});

export const createPatientSchema = basePatientSchema.superRefine((data, ctx) => {
  if (data.documentType === "DPI" && !/^\d{13}$/.test(data.identityDocument)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "DPI must be exactly 13 digits",
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
      message: "DPI must be exactly 13 digits",
      path: ["identityDocument"],
    });
  }
});

export const patientFilterSchema = z.object({
  search: z.string().optional(),
  active: z.boolean().optional(),
  companyId: idParamSchema.optional(),
  workplaceId: idParamSchema.optional(),
});
