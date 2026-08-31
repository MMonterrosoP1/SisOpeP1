export type DocumentTemplateType = "MEDICAL_CERTIFICATE" | "ILLNESS_CERTIFICATE";

export interface CertificateData {
  date: string;
  workplaceName: string;
  fullName: string;
  age: number;
  employeeCode: string;
  identityDocument: string;
  sex: string;
  jobPositionName: string;
  aptitude: 'APTO' | 'APTO_REC' | 'APTO_RES' | 'NO_APTO' | 'NO_APTO_TEMP' | null;
  employerObservation: string;
  practitionerPreamble?: string;
  practitionerName?: string;
  practitionerSex?: string;
}

export interface IllnessCertificateData extends CertificateData {
  symptomatology: string;
  diagnoses: { name: string; observations: string; isPrimary?: boolean }[];
  suspensionHour: string | null;
}
