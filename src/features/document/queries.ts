import { cache } from "react";
import { documentRepository } from "./repository";

export const getDocumentByEncounterAndType = cache(async (encounterId: number, documentTypeCode: string) => {
  return documentRepository.findByEncounterAndType(encounterId, documentTypeCode);
});

export const getDocumentStatusByEncounterIdsAndType = cache(async (encounterIds: number[], documentTypeCode: string) => {
  if (!encounterIds.length) return [];
  return documentRepository.findByEncounterIdsAndType(encounterIds, documentTypeCode);
});
