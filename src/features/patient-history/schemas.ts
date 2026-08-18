import { z } from "zod";
import { idParamSchema } from "@/shared/utils/zod-helpers";

export const patientAllergySchema = z.object({
  allergenCatalogId: idParamSchema,
  detail: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const patientHabitSchema = z.object({
  habitCatalogId: idParamSchema,
  duration: z.string().max(255, "Máximo 255 caracteres").optional().nullable(),
  quantity: z.number({ message: "Debe ser un número" }).optional().nullable(),
  frequency: z.string().optional().nullable(),
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const patientExerciseSchema = z.object({
  exerciseCatalogId: idParamSchema,
  timesPerWeek: z.number({ message: "Debe ser un número" }).int("Debe ser un número entero").min(0, "Debe ser al menos 0").max(28, "Máximo 28").optional().nullable(),
});

export const patientHistoryEntrySchema = z.object({
  icd10CodeId: idParamSchema.optional().nullable(),
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const patientSurgicalHistorySchema = z.object({
  surgicalProcedureId: idParamSchema,
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const upsertPatientHistorySchema = z.object({
  patientId: idParamSchema,
  
  allergies: z.array(patientAllergySchema).optional().default([]),
  habits: z.array(patientHabitSchema).optional().default([]),
  exercises: z.array(patientExerciseSchema).optional().default([]),
  medicalHistory: z.array(patientHistoryEntrySchema).optional().default([]),
  surgicalHistory: z.array(patientSurgicalHistorySchema).optional().default([]),
  traumaHistory: z.array(patientHistoryEntrySchema).optional().default([]),
  familyHistory: z.array(patientHistoryEntrySchema).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.exercises && data.exercises.some(e => e.timesPerWeek === undefined || e.timesPerWeek === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Si realiza ejercicio, debe especificar las veces por semana",
      path: ["exercises"],
    });
  }
});

export type UpsertPatientHistoryInput = z.infer<typeof upsertPatientHistorySchema>;
