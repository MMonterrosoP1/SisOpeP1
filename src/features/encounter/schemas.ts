import { z } from "zod";
import { BmiCategorySchema, PregnancyStatusSchema } from "@/shared/schemas/enums";
import { idParamSchema } from "@/shared/utils/zod-helpers";
import { VITAL_SIGN_RANGES } from "./domain/vital-sign-ranges";

export const vitalSignSchema = z.object({
  systolicBP: z.number({ message: "Debe ser un número" }).min(VITAL_SIGN_RANGES.systolicBP.min, `Debe ser al menos ${VITAL_SIGN_RANGES.systolicBP.min}`).max(VITAL_SIGN_RANGES.systolicBP.max, `Debe ser máximo ${VITAL_SIGN_RANGES.systolicBP.max}`).optional().nullable(),
  diastolicBP: z.number({ message: "Debe ser un número" }).min(VITAL_SIGN_RANGES.diastolicBP.min, `Debe ser al menos ${VITAL_SIGN_RANGES.diastolicBP.min}`).max(VITAL_SIGN_RANGES.diastolicBP.max, `Debe ser máximo ${VITAL_SIGN_RANGES.diastolicBP.max}`).optional().nullable(),
  heartRate: z.number({ message: "Debe ser un número" }).min(VITAL_SIGN_RANGES.heartRate.min, `Debe ser al menos ${VITAL_SIGN_RANGES.heartRate.min}`).max(VITAL_SIGN_RANGES.heartRate.max, `Debe ser máximo ${VITAL_SIGN_RANGES.heartRate.max}`).optional().nullable(),
  respiratoryRate: z.number({ message: "Debe ser un número" }).min(VITAL_SIGN_RANGES.respiratoryRate.min, `Debe ser al menos ${VITAL_SIGN_RANGES.respiratoryRate.min}`).max(VITAL_SIGN_RANGES.respiratoryRate.max, `Debe ser máximo ${VITAL_SIGN_RANGES.respiratoryRate.max}`).optional().nullable(),
  oxygenSaturation: z.number({ message: "Debe ser un número" }).min(VITAL_SIGN_RANGES.oxygenSaturation.min, `Debe ser al menos ${VITAL_SIGN_RANGES.oxygenSaturation.min}`).max(VITAL_SIGN_RANGES.oxygenSaturation.max, `Debe ser máximo ${VITAL_SIGN_RANGES.oxygenSaturation.max}`).optional().nullable(),
  glucose: z.number({ message: "Debe ser un número" }).min(VITAL_SIGN_RANGES.glucose.min, `Debe ser al menos ${VITAL_SIGN_RANGES.glucose.min}`).max(VITAL_SIGN_RANGES.glucose.max, `Debe ser máximo ${VITAL_SIGN_RANGES.glucose.max}`).optional().nullable(),
  temperature: z.number({ message: "Debe ser un número" }).min(VITAL_SIGN_RANGES.temperature.min, `Debe ser al menos ${VITAL_SIGN_RANGES.temperature.min}`).max(VITAL_SIGN_RANGES.temperature.max, `Debe ser máximo ${VITAL_SIGN_RANGES.temperature.max}`).optional().nullable(),
});

export const anthropometrySchema = z.object({
  weight: z.number({ message: "Debe ser un número" }).min(0.5, "Debe ser al menos 0.5").max(500, "Debe ser máximo 500").optional().nullable(),
  height: z.number({ message: "Debe ser un número" }).min(0.5, "Debe ser al menos 0.5").max(300, "Debe ser máximo 300").optional().nullable(),
  abdominalCircumference: z.number({ message: "Debe ser un número" }).min(10, "Debe ser al menos 10").max(300, "Debe ser máximo 300").optional().nullable(),
  bmi: z.number({ message: "Debe ser un número" }).optional().nullable(),
  bmiCategory: BmiCategorySchema.optional().nullable(),
});

export const diagnosisSchema = z.object({
  icd10CodeId: idParamSchema,
  diseaseTypeId: idParamSchema.optional().nullable(),
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
  isPrimary: z.boolean().default(false),
});

export const allergySchema = z.object({
  allergenCatalogId: idParamSchema,
  detail: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const habitSchema = z.object({
  habitCatalogId: idParamSchema,
  duration: z.string().max(255, "Máximo 255 caracteres").optional().nullable(),
  quantity: z.number({ message: "Debe ser un número" }).optional().nullable(),
  frequency: z.string().optional().nullable(),
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const exerciseSchema = z.object({
  doesExercise: z.boolean(),
  exerciseCatalogId: idParamSchema.optional().nullable(),
  timesPerWeek: z.number({ message: "Debe ser un número" }).int("Debe ser un número entero").min(0, "Debe ser al menos 0").max(28, "Máximo 28").optional().nullable(),
});

export const historyEntrySchema = z.object({
  icd10CodeId: idParamSchema.optional().nullable(),
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const surgicalHistorySchema = z.object({
  surgicalProcedureId: idParamSchema,
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const occupationalExposureSchema = z.object({
  occupationalExposureId: idParamSchema,
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const workDisabilitySchema = z.object({
  workDisabilityId: idParamSchema,
  observations: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export const createEncounterSchema = z.object({
  patientId: idParamSchema,
  practitionerId: z.string().cuid().optional(),
  encounterTypeId: idParamSchema,
  isFirstVisit: z.boolean().default(false),
  symptomatology: z.string().max(5000, "Máximo 5000 caracteres").optional().nullable(),
  illnessHistory: z.string().max(5000, "Máximo 5000 caracteres").optional().nullable(),
  gynecologicalHistory: z.string().max(5000, "Máximo 5000 caracteres").optional().nullable(),
  pregnancyStatus: PregnancyStatusSchema.default("NOT_APPLICABLE"),
  sleepHours: z.number({ message: "Debe ser un número" }).min(0, "No puede ser menor a 0").max(24, "Máximo 24").optional().nullable(),
  medicationsAdministered: z.string().max(5000, "Máximo 5000 caracteres").optional().nullable(),
  suspensionHourId: idParamSchema.optional().nullable(),
  referralLevelId: idParamSchema.optional().nullable(),
  medicalAptitudeId: idParamSchema.optional().nullable(),
  internalObservation: z.string().max(5000, "Máximo 5000 caracteres").optional().nullable(),
  employerObservation: z.string().max(5000, "Máximo 5000 caracteres").optional().nullable(),
  followUpDate: z.coerce.date({ message: "Fecha inválida" }).optional().nullable(),

  vitalSign: vitalSignSchema.optional().nullable(),
  anthropometry: anthropometrySchema.optional().nullable(),
  diagnoses: z.array(diagnosisSchema).optional().default([]),
  
  allergies: z.array(allergySchema).optional(),
  habits: z.array(habitSchema).optional(),
  exercises: z.array(exerciseSchema).optional(),
  medicalHistory: z.array(historyEntrySchema).optional(),
  surgicalHistory: z.array(surgicalHistorySchema).optional(),
  traumaHistory: z.array(historyEntrySchema).optional(),
  familyHistory: z.array(historyEntrySchema).optional(),
  occupationalExposures: z.array(occupationalExposureSchema).optional(),
  workDisabilities: z.array(workDisabilitySchema).optional(),
}).superRefine((data, ctx) => {
  if (data.diagnoses && data.diagnoses.length > 0) {
    const hasPrimaryDiagnosis = data.diagnoses.some(d => d.isPrimary);
    if (!hasPrimaryDiagnosis) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Al menos un diagnóstico debe estar marcado como principal",
        path: ["diagnoses"],
      });
    }
  }

  if (data.exercises && data.exercises.some(e => e.doesExercise && (!e.exerciseCatalogId || e.timesPerWeek === undefined || e.timesPerWeek === null))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Si realiza ejercicio, debe especificar el tipo de deporte y las veces por semana",
      path: ["exercises"],
    });
  }

  // Validar duplicados en occupationalExposures
  if (data.occupationalExposures) {
    const ids = data.occupationalExposures.map(e => e.occupationalExposureId);
    const hasDuplicates = new Set(ids).size !== ids.length;
    if (hasDuplicates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puede agregar exposiciones laborales duplicadas",
        path: ["occupationalExposures"],
      });
    }
  }

  // Validar duplicados en workDisabilities
  if (data.workDisabilities) {
    const ids = data.workDisabilities.map(w => w.workDisabilityId);
    const hasDuplicates = new Set(ids).size !== ids.length;
    if (hasDuplicates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puede agregar incapacidades laborales duplicadas",
        path: ["workDisabilities"],
      });
    }
  }
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type EncounterFilters = { patientId?: number; practitionerId?: string; encounterTypeId?: number; search?: string; };