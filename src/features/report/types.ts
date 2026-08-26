export interface ReportFilters {
  year: number;
  month?: number | null;
  workplaceId?: number | null;
}

export interface AttendedByWorkplace {
  workplaceName: string;
  count: number;
  month?: number;
}

export interface AttendedBySex {
  workplaceName: string;
  male: number;
  female: number;
  month?: number;
}

export interface AttendedByAgeGroup {
  ageGroup: string;
  count: number;
  workplaceName?: string;
}

export interface EncountersByType {
  encounterTypeName: string;
  count: number;
}

export interface DiseasePrevalence {
  icd10Code: string;
  description: string;
  count: number;
  workplaceName?: string;
}

export interface TopDiagnosis {
  rank: number;
  icd10Code: string;
  description: string;
  count: number;
}

export interface SuspensionSummary {
  diseaseType: string;
  count: number;
  totalHours: number;
  workplaceName?: string;
}

export interface ReferralSummary {
  referralLevelName: string;
  count: number;
  workplaceName?: string;
}

export interface MedicalHistorySummary {
  icd10Code: string;
  description: string;
  count: number;
  workplaceName?: string;
  workAreaName?: string;
}

export interface IndicatorsSummary {
  totalAttended: number;
  coveragePercentage: number | null; // null si no hay datos de workforce
  consultationRateBySex: {
    male: number | null;
    female: number | null;
  };
  consultationRateByAge: Record<string, number | null>;
  absenteeismRate: number | null;
}

export interface SociodemographicReport {
  attendedByWorkplace: AttendedByWorkplace[];
  attendedBySex: AttendedBySex[];
  attendedByAgeGroup: AttendedByAgeGroup[];
  encountersByType: EncountersByType[];
  totalAttended: number;
}

export interface MorbidityReport {
  chronicPrevalence: DiseasePrevalence[];
  chronicIncidence: DiseasePrevalence[]; // solo isFirstVisit = true
  occupationalDiseasePrevalence: DiseasePrevalence[];
  occupationalAccidentPrevalence: DiseasePrevalence[];
  medicalHistory: MedicalHistorySummary[];
  topDiagnoses: TopDiagnosis[];
  referralsToIGSS: ReferralSummary[];
}

export interface SuspensionReport {
  topDiagnosesWithSuspension: TopDiagnosis[];
  suspensionsByDiseaseType: SuspensionSummary[];
  totalSuspensionHours: number;
}
