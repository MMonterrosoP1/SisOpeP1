import { patientHistoryService } from "./service";

export async function getPatientHistory(patientId: number) {
  // In Next.js App Router we would use cache/cacheLife, but for Next.js 14 unstable_cache
  // As this might be dynamically used in pages, we just call the service directly
  // and rely on Next.js fetch caching if applicable, or just pure DB queries.
  return patientHistoryService.getByPatientId(patientId);
}
