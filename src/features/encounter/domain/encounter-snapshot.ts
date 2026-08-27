type EncounterData = NonNullable<Awaited<ReturnType<typeof import("../repository").encounterRepository.findLatestByPatient>>>;

/**
 * Mapea los datos de la última consulta a los valores por defecto del formulario de reconsulta.
 *
 * Copia TODOS los campos clínicos de la consulta anterior:
 * - Datos generales: tipo, sintomatología, historia de enfermedad, ginecología, etc.
 * - Plan y observaciones: nivel de referencia, aptitud médica, observación interna/patronal,
 *   horas de suspensión, horas de sueño, medicamentos, fecha de seguimiento.
 * - Signos vitales y antropometría.
 * - Diagnósticos, exposiciones laborales y discapacidades.
 *
 * Los antecedentes (alergias, hábitos, ejercicios, historial médico/quirúrgico/traumático/familiar)
 * provienen siempre del historial actualizado del paciente (patientHistory), no de la consulta.
 */
export function mapEncounterToFormDefaults(encounter: EncounterData, patientId: number) {

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

    diagnoses: encounter.diagnoses?.length > 0 ? encounter.diagnoses.map((d) => ({
      icd10CodeId: d.icd10CodeId,
      diseaseTypeId: d.diseaseTypeId ? String(d.diseaseTypeId) : "",
      observations: d.observations || "",
      isPrimary: d.isPrimary || false,
    })) : [{ icd10CodeId: null, diseaseTypeId: "", observations: "", isPrimary: true }],

    occupationalExposures: encounter.occupationalExposureEntries?.map((e) => ({
      occupationalExposureId: String(e.occupationalExposureId),
      observations: e.observations || "",
    })) || [],

    workDisabilities: encounter.workDisabilityEntries?.map((w) => ({
      workDisabilityId: String(w.workDisabilityId),
      observations: w.observations || "",
    })) || [],
  };
}

/**
 * Mapea los datos de una consulta existente a los valores iniciales para el formulario de EDICIÓN.
 * Incluye todos los datos clínicos de la consulta actual.
 * Los antecedentes se deben pasar por separado desde el patientHistory.
 */
export function mapEncounterToEditFormState(encounter: EncounterData, patientId: number) {
  return {
    ...mapEncounterToFormDefaults(encounter, patientId),
    isFirstVisit: encounter.isFirstVisit || false,
  };
}
