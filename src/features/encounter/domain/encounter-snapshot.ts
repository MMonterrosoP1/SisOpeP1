export function mapEncounterToFormDefaults(encounter: any, patientId: number): any {
  if (!encounter) return null;

  return {
    patientId,
    encounterTypeId: encounter.encounterTypeId ? String(encounter.encounterTypeId) : "",
    isFirstVisit: false,
    symptomatology: encounter.symptomatology || "",
    illnessHistory: encounter.illnessHistory || "",
    gynecologicalHistory: encounter.gynecologicalHistory || "",
    pregnancyStatus: encounter.pregnancyStatus || "NOT_APPLICABLE",
    sleepHours: encounter.sleepHours?.toString() || "",
    medicationsAdministered: encounter.medicationsAdministered || "",
    suspensionHourId: encounter.suspensionHourId ? String(encounter.suspensionHourId) : "",
    referralLevelId: encounter.referralLevelId ? String(encounter.referralLevelId) : "",
    medicalAptitudeId: encounter.medicalAptitudeId ? String(encounter.medicalAptitudeId) : "",
    internalObservation: encounter.internalObservation || "",
    employerObservation: encounter.employerObservation || "",
    followUpDate: encounter.followUpDate ? new Date(encounter.followUpDate).toISOString().split('T')[0] : "",

    vitalSign: encounter.vitalSign ? {
      systolicBP: encounter.vitalSign.systolicBP?.toString() || "",
      diastolicBP: encounter.vitalSign.diastolicBP?.toString() || "",
      heartRate: encounter.vitalSign.heartRate?.toString() || "",
      respiratoryRate: encounter.vitalSign.respiratoryRate?.toString() || "",
      oxygenSaturation: encounter.vitalSign.oxygenSaturation?.toString() || "",
      glucose: encounter.vitalSign.glucose?.toString() || "",
      temperature: encounter.vitalSign.temperature?.toString() || "",
    } : { systolicBP: "", diastolicBP: "", heartRate: "", respiratoryRate: "", oxygenSaturation: "", glucose: "", temperature: "" },

    anthropometry: encounter.anthropometry ? {
      weight: encounter.anthropometry.weight?.toString() || "",
      height: encounter.anthropometry.height?.toString() || "",
      abdominalCircumference: encounter.anthropometry.abdominalCircumference?.toString() || "",
    } : { weight: "", height: "", abdominalCircumference: "" },

    diagnoses: encounter.diagnoses?.length > 0 ? encounter.diagnoses.map((d: any) => ({
      icd10CodeId: d.icd10CodeId,
      diseaseTypeId: d.diseaseTypeId ? String(d.diseaseTypeId) : "",
      observations: d.observations || "",
      isPrimary: d.isPrimary || false,
    })) : [{ icd10CodeId: null, diseaseTypeId: "", observations: "", isPrimary: true }],

    allergies: encounter.allergies?.map((a: any) => ({
      allergenCatalogId: String(a.allergenCatalogId),
      detail: a.detail || "",
    })) || [],

    habits: encounter.habits?.map((h: any) => ({
      habitCatalogId: String(h.habitCatalogId),
      duration: h.duration || "",
      quantity: h.quantity?.toString() || "",
      frequency: h.frequency || "",
      observations: h.observations || "",
    })) || [],

    exercises: encounter.exercises?.length > 0 ? encounter.exercises.map((e: any) => ({
      doesExercise: e.doesExercise || false,
      sportType: e.sportType || "",
      timesPerWeek: e.timesPerWeek?.toString() || "",
    })) : [{ doesExercise: false, sportType: "", timesPerWeek: "" }],

    medicalHistory: encounter.medicalHistoryEntries?.map((h: any) => ({
      icd10CodeId: h.icd10CodeId,
      observations: h.observations || "",
    })) || [],

    surgicalHistory: encounter.surgicalHistoryEntries?.map((s: any) => ({
      surgicalProcedureId: String(s.surgicalProcedureId),
      observations: s.observations || "",
    })) || [],

    traumaHistory: encounter.traumaHistoryEntries?.map((h: any) => ({
      icd10CodeId: h.icd10CodeId,
      observations: h.observations || "",
    })) || [],

    familyHistory: encounter.familyHistoryEntries?.map((h: any) => ({
      icd10CodeId: h.icd10CodeId,
      observations: h.observations || "",
    })) || [],

    occupationalExposures: encounter.occupationalExposureEntries?.map((e: any) => ({
      occupationalExposureId: String(e.occupationalExposureId),
      observations: e.observations || "",
    })) || [],

    workDisabilities: encounter.workDisabilityEntries?.map((w: any) => ({
      workDisabilityId: String(w.workDisabilityId),
      observations: w.observations || "",
    })) || [],
  };
}
