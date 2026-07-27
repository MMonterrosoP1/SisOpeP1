import { z } from "zod";
import { PregnancyStatusSchema } from "@/shared/schemas/enums";
import { idParamSchema } from "@/shared/utils/zod-helpers";
import { VITAL_SIGN_RANGES } from "./domain/vital-sign-ranges";

export const vitalSignSchema = z.object({
  systolicBP: z.number().min(VITAL_SIGN_RANGES.systolicBP.min).max(VITAL_SIGN_RANGES.systolicBP.max).optional().nullable(),
  diastolicBP: z.number().min(VITAL_SIGN_RANGES.diastolicBP.min).max(VITAL_SIGN_RANGES.diastolicBP.max).optional().nullable(),
  heartRate: z.number().min(VITAL_SIGN_RANGES.heartRate.min).max(VITAL_SIGN_RANGES.heartRate.max).optional().nullable(),
  respiratoryRate: z.number().min(VITAL_SIGN_RANGES.respiratoryRate.min).max(VITAL_SIGN_RANGES.respiratoryRate.max).optional().nullable(),
  oxygenSaturation: z.number().min(VITAL_SIGN_RANGES.oxygenSaturation.min).max(VITAL_SIGN_RANGES.oxygenSaturation.max).optional().nullable(),
  glucose: z.number().min(VITAL_SIGN_RANGES.glucose.min).max(VITAL_SIGN_RANGES.glucose.max).optional().nullable(),
  temperature: z.number().min(VITAL_SIGN_RANGES.temperature.min).max(VITAL_SIGN_RANGES.temperature.max).optional().nullable(),
});

export const anthropometrySchema = z.object({
  weight: z.number().min(0.5).max(500).optional().nullable(),
  height: z.number().min(20).max(300).optional().nullable(),
  abdominalCircumference: z.number().min(10).max(300).optional().nullable(),
});

export const diagnosisSchema = z.object({
  icd10CodeId: idParamSchema,
  diseaseTypeId: idParamSchema.optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
  isPrimary: z.boolean().default(false),
});

export const allergySchema = z.object({
  allergenCatalogId: idParamSchema,
  detail: z.string().max(2000).optional().nullable(),
});

export const habitSchema = z.object({
  name: z.string().min(1).max(255),
  duration: z.string().max(255).optional().nullable(),
  quantity: z.number().optional().nullable(),
  frequency: z.string().optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
});

export const exerciseSchema = z.object({
  doesExercise: z.boolean(),
  sportType: z.string().max(255).optional().nullable(),
  timesPerWeek: z.number().int().min(0).max(28).optional().nullable(),
});

export const historyEntrySchema = z.object({
  icd10CodeId: idParamSchema.optional().nullable(),
  observations: z.string().max(2000).optional().nullable(),
});

export const surgicalHistorySchema = z.object({
  surgicalProcedureId: idParamSchema,
  observations: z.string().max(2000).optional().nullable(),
});

export const occupationalExposureSchema = z.object({
  occupationalExposureId: idParamSchema,
  observations: z.string().max(2000).optional().nullable(),
});

export const workDisabilitySchema = z.object({
  workDisabilityId: idParamSchema,
  observations: z.string().max(2000).optional().nullable(),
});

export const createEncounterSchema = z.object({
  patientId: idParamSchema,
  practitionerId: z.string().cuid().optional(),
  encounterTypeId: idParamSchema,
  isFirstVisit: z.boolean().default(false),
  symptomatology: z.string().max(5000).optional().nullable(),
  illnessHistory: z.string().max(5000).optional().nullable(),
  gynecologicalHistory: z.string().max(5000).optional().nullable(),
  pregnancyStatus: PregnancyStatusSchema.default("NOT_APPLICABLE"),
  sleepHours: z.number().min(0).max(24).optional().nullable(),
  medicationsAdministered: z.string().max(5000).optional().nullable(),
  suspensionHours: z.number().int().min(0).optional().nullable(),
  referralLevelId: idParamSchema.optional().nullable(),
  medicalAptitudeId: idParamSchema.optional().nullable(),
  internalObservation: z.string().max(5000).optional().nullable(),
  employerObservation: z.string().max(5000).optional().nullable(),
  followUpDate: z.coerce.date().optional().nullable(),

  vitalSign: vitalSignSchema.optional().nullable(),
  anthropometry: anthropometrySchema.optional().nullable(),
  diagnoses: z.array(diagnosisSchema).min(1, "At least one diagnosis is required"),
  
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
  const hasPrimaryDiagnosis = data.diagnoses.some(d => d.isPrimary);
  if (!hasPrimaryDiagnosis) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one diagnosis must be marked as primary",
      path: ["diagnoses"],
    });
  }

  if (data.exercises && data.exercises.some(e => e.doesExercise && (!e.sportType || !e.timesPerWeek))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "If exercise is done, sport type and times per week are required",
      path: ["exercises"],
    });
  }
});
