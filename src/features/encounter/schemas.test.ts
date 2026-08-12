import { describe, expect, it } from "vitest";
import { createEncounterSchema, vitalSignSchema } from "./schemas";
import { VITAL_SIGN_RANGES } from "./domain/vital-sign-ranges";

const validEncounterPayload = {
  patientId: 1,
  encounterTypeId: 1,
  diagnoses: [{ icd10CodeId: 1, isPrimary: true }],
} as const;

describe("vitalSignSchema", () => {
  it("accepts min and max limits for all vital signs", () => {
    const result = vitalSignSchema.safeParse({
      systolicBP: VITAL_SIGN_RANGES.systolicBP.min,
      diastolicBP: VITAL_SIGN_RANGES.diastolicBP.max,
      heartRate: VITAL_SIGN_RANGES.heartRate.min,
      respiratoryRate: VITAL_SIGN_RANGES.respiratoryRate.max,
      oxygenSaturation: VITAL_SIGN_RANGES.oxygenSaturation.min,
      glucose: VITAL_SIGN_RANGES.glucose.max,
      temperature: VITAL_SIGN_RANGES.temperature.min,
    });

    expect(result.success).toBe(true);
  });

  it("rejects values below the minimum for each vital sign", () => {
    const cases = Object.entries(VITAL_SIGN_RANGES) as Array<[
      keyof typeof VITAL_SIGN_RANGES,
      { min: number; max: number }
    ]>;

    for (const [field, range] of cases) {
      const result = vitalSignSchema.safeParse({ [field]: range.min - 1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.join(".") === field);
        expect(issue).toBeDefined();
      }
    }
  });

  it("rejects values above the maximum for each vital sign", () => {
    const cases = Object.entries(VITAL_SIGN_RANGES) as Array<[
      keyof typeof VITAL_SIGN_RANGES,
      { min: number; max: number }
    ]>;

    for (const [field, range] of cases) {
      const result = vitalSignSchema.safeParse({ [field]: range.max + 1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.join(".") === field);
        expect(issue).toBeDefined();
      }
    }
  });
});

describe("createEncounterSchema", () => {
  it("accepts a valid minimal encounter payload", () => {
    const result = createEncounterSchema.safeParse(validEncounterPayload);
    expect(result.success).toBe(true);
  });

  it("accepts an encounter payload without diagnoses", () => {
    const result = createEncounterSchema.safeParse({
      patientId: 1,
      encounterTypeId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one primary diagnosis", () => {
    const result = createEncounterSchema.safeParse({
      ...validEncounterPayload,
      diagnoses: [{ icd10CodeId: 1, isPrimary: false }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "diagnoses");
      expect(issue?.message).toBe("Al menos un diagnóstico debe estar marcado como principal");
    }
  });

  it("requires exercise type and frequency when doesExercise is true", () => {
    const result = createEncounterSchema.safeParse({
      ...validEncounterPayload,
      exercises: [{ doesExercise: true }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "exercises");
      expect(issue?.message).toBe("Si realiza ejercicio, debe especificar el tipo de deporte y las veces por semana");
    }
  });

  it("rejects duplicated occupational exposures", () => {
    const result = createEncounterSchema.safeParse({
      ...validEncounterPayload,
      occupationalExposures: [
        { occupationalExposureId: 1 },
        { occupationalExposureId: 1 },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "occupationalExposures");
      expect(issue?.message).toBe("No puede agregar exposiciones laborales duplicadas");
    }
  });

  it("rejects duplicated work disabilities", () => {
    const result = createEncounterSchema.safeParse({
      ...validEncounterPayload,
      workDisabilities: [{ workDisabilityId: 2 }, { workDisabilityId: 2 }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "workDisabilities");
      expect(issue?.message).toBe("No puede agregar incapacidades laborales duplicadas");
    }
  });
});