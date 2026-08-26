import { cacheLife, cacheTag } from "next/cache";
import { reportRepository } from "./repository";
import { ReportFilters, SociodemographicReport, MorbidityReport, SuspensionReport, IndicatorsSummary } from "./types";

export async function getSociodemographicReport(filters: ReportFilters): Promise<SociodemographicReport> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports", "encounters", "patients");

  const [attendedByWorkplace, attendedBySex, attendedByAgeGroup, encountersByType] = await Promise.all([
    reportRepository.getAttendedByWorkplace(filters),
    reportRepository.getAttendedBySex(filters),
    reportRepository.getAttendedByAgeGroup(filters),
    reportRepository.getEncountersByType(filters),
  ]);

  const totalAttended = attendedByWorkplace.reduce((sum, item) => sum + item.count, 0);

  return {
    attendedByWorkplace,
    attendedBySex,
    attendedByAgeGroup,
    encountersByType,
    totalAttended,
  };
}

export async function getMorbidityReport(filters: ReportFilters): Promise<MorbidityReport> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports", "encounters", "patients", "diagnoses");

  const [
    chronicPrevalence,
    chronicIncidence,
    occupationalDiseasePrevalence,
    occupationalAccidentPrevalence,
    medicalHistory,
    topDiagnoses,
    referralsToIGSS
  ] = await Promise.all([
    reportRepository.getDiagnosesByDiseaseType("ENFERMEDAD CRÓNICA", filters, false),
    reportRepository.getDiagnosesByDiseaseType("ENFERMEDAD CRÓNICA", filters, true),
    reportRepository.getDiagnosesByDiseaseType("ENFERMEDAD LABORAL", filters, false),
    reportRepository.getDiagnosesByDiseaseType("ACCIDENTE LABORAL", filters, false),
    reportRepository.getMedicalHistoryCount(filters),
    reportRepository.getTopDiagnoses(filters, false, 10),
    reportRepository.getReferralsToIGSS(filters),
  ]);

  return {
    chronicPrevalence,
    chronicIncidence,
    occupationalDiseasePrevalence,
    occupationalAccidentPrevalence,
    medicalHistory,
    topDiagnoses,
    referralsToIGSS,
  };
}

export async function getSuspensionReport(filters: ReportFilters): Promise<SuspensionReport> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports", "encounters", "patients", "diagnoses");

  const [
    topDiagnosesWithSuspension,
    suspensionsByDiseaseType,
    totalSuspensionHoursObj
  ] = await Promise.all([
    reportRepository.getTopDiagnoses(filters, true, 10),
    reportRepository.getSuspensionsByDiseaseType(filters),
    reportRepository.getTotalSuspensionHours(filters),
  ]);

  return {
    topDiagnosesWithSuspension,
    suspensionsByDiseaseType,
    totalSuspensionHours: totalSuspensionHoursObj.total,
  };
}

export async function getIndicatorsReport(filters: ReportFilters, totalAttended: number, attendedBySex: { male: number, female: number }): Promise<IndicatorsSummary> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports", "workforce");

  const snapshot = await reportRepository.getWorkforceSnapshotTotals(filters);

  if (!snapshot) {
    return {
      totalAttended,
      coveragePercentage: null,
      consultationRateBySex: { male: null, female: null },
      consultationRateByAge: {},
      absenteeismRate: null
    };
  }

  // Cálculos de indicadores
  const coveragePercentage = snapshot.totalWorkers > 0 ? (totalAttended / snapshot.totalWorkers) * 100 : 0;
  
  const maleRate = snapshot.maleWorkers > 0 ? (attendedBySex.male / snapshot.maleWorkers) * 100 : 0;
  const femaleRate = snapshot.femaleWorkers > 0 ? (attendedBySex.female / snapshot.femaleWorkers) * 100 : 0;

  // Ausentismo: Días perdidos / Días programados (total)
  const suspensionHoursObj = await reportRepository.getTotalSuspensionHours(filters);
  const totalDaysLost = suspensionHoursObj.total / 8; // asumiendo jornada de 8 hrs
  // Los días laborables programados son por trabajador o total empresa? La fórmula usual es:
  // (Días perdidos / (Días laborables programados * Trabajadores activos)) * 100
  const totalScheduledDays = snapshot.scheduledDays * snapshot.totalWorkers;
  const absenteeismRate = totalScheduledDays > 0 ? (totalDaysLost / totalScheduledDays) * 100 : 0;

  return {
    totalAttended,
    coveragePercentage,
    consultationRateBySex: { male: maleRate, female: femaleRate },
    consultationRateByAge: {}, // Pendiente si no tenemos total trabajadores por edad
    absenteeismRate
  };
}
