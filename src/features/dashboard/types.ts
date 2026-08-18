export interface TodayEncounter {
  id: number;
  createdAt: Date;
  patientId: number;
  patientName: string;
  patientDocument: string;
  encounterTypeName: string;
  practitionerName: string;
  medicalAptitudeName: string | null;
}

export interface PendingFollowUp {
  id: number;
  followUpDate: Date;
  patientId: number;
  patientName: string;
  encounterTypeName: string;
}

export interface RecentPatient {
  id: number;
  patientId: number;
  patientName: string;
  companyName: string | null;
  updatedAt: Date;
}

export interface TopDiagnosis {
  icd10Code: string;
  description: string;
  count: number;
  percentage: number;
}

export interface MetricWithChange {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface DashboardAdminStats {
  totalEncounters: MetricWithChange;
  newPatients: MetricWithChange;
  activeDisabilities: MetricWithChange;
  pendingFollowUpsMonth: MetricWithChange;
}

export interface PatientsByWorkplace {
  workplaceName: string;
  count: number;
  fill: string; // for the pie chart
}

export interface EncountersByTypeChartData {
  month: string;
  [encounterType: string]: string | number; // dynamic keys for types
}

export interface RecentEncounterItem {
  id: number;
  createdAt: Date;
  patientId: number;
  patientName: string;
  encounterTypeName: string;
  practitionerName: string;
}
