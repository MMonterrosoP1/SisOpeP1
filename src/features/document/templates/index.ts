import { MedicalCertificatePDF } from "./medical-certificate-pdf";
import { IllnessCertificatePDF } from "./illness-certificate-pdf";
import { DocumentTemplateType, CertificateData, IllnessCertificateData } from "../types";
import { format, differenceInYears } from "date-fns";
import { es } from "date-fns/locale";

function mapAptitude(name: string | undefined | null): CertificateData['aptitude'] {
  if (!name) return null;
  const upperName = name.toUpperCase();
  if (upperName.includes('CON RECOMENDACIÓN') || upperName.includes('CON RECOMENDACION')) return 'APTO_REC';
  if (upperName.includes('CON RESTRICCIÓN') || upperName.includes('CON RESTRICCION')) return 'APTO_RES';
  if (upperName.includes('NO APTO TEMPORAL')) return 'NO_APTO_TEMP';
  if (upperName.includes('NO APTO')) return 'NO_APTO';
  if (upperName.includes('APTO')) return 'APTO';
  return null;
}

export function mapEncounterToCertificateData(encounter: any): CertificateData {
  const patient = encounter.patient;
  
  // Calculate age dynamically
  const age = patient.person?.birthDate 
    ? differenceInYears(new Date(encounter.createdAt), new Date(patient.person.birthDate))
    : 0;
    
  // Format date: dd/MM/yyyy
  const dateFormatted = format(new Date(encounter.createdAt), "dd/MM/yyyy", { locale: es });

  return {
    date: dateFormatted,
    workplaceName: patient.workplace?.name || "",
    fullName: `${patient.person?.givenNames} ${patient.person?.familyNames}`,
    age,
    employeeCode: "", // Dejalo vacio por el momento
    identityDocument: patient.person?.identityDocument || "",
    sex: patient.person?.sex === 'MALE' ? 'Masculino' : 'Femenino',
    jobPositionName: patient.jobPosition?.name || "",
    aptitude: mapAptitude(encounter.medicalAptitude?.name),
    employerObservation: encounter.employerObservation || "",
    practitionerPreamble: encounter.practitioner?.preamble || "El/La infrascrito/a Médico/a y Cirujano/a hace constar:",
    practitionerName: encounter.practitioner ? `${encounter.practitioner.givenNames} ${encounter.practitioner.familyNames}` : "",
    practitionerSex: encounter.practitioner?.sex || null,
  };
}

export function mapEncounterToIllnessCertificateData(encounter: any): IllnessCertificateData {
  const baseData = mapEncounterToCertificateData(encounter);
  
  const diagnoses = encounter.diagnoses?.map((diag: any) => ({
    name: diag.icd10Code ? `${diag.icd10Code.code} - ${diag.icd10Code.description}` : "Sin diagnóstico",
    observations: diag.observations || "",
  })) || [];

  return {
    ...baseData,
    symptomatology: encounter.symptomatology || "",
    diagnoses,
    suspensionHour: encounter.suspensionHour?.name || null,
  };
}

export const templateRegistry: Partial<Record<DocumentTemplateType, { component: any; mapData: any }>> = {
  MEDICAL_CERTIFICATE: {
    component: MedicalCertificatePDF,
    mapData: mapEncounterToCertificateData,
  },
  ILLNESS_CERTIFICATE: {
    component: IllnessCertificatePDF,
    mapData: mapEncounterToIllnessCertificateData,
  }
};
