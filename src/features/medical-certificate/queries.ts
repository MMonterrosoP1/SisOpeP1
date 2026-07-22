import { cache } from "react";
import { medicalCertificateRepository } from "./repository";

export const getCertificateByEncounter = cache(async (encounterId: number) => {
  return medicalCertificateRepository.findByEncounter(encounterId);
});
