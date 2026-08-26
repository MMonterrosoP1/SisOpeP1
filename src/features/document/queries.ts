import { cacheLife, cacheTag } from "next/cache";
import { documentRepository } from "./repository";

export async function getDocumentByEncounterAndType(encounterId: number, documentTypeCode: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("documents", `encounter-${encounterId}`);
  return documentRepository.findByEncounterAndType(encounterId, documentTypeCode);
}

export async function getDocumentStatusByEncounterIdsAndType(encounterIds: number[], documentTypeCode: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("documents");
  if (!encounterIds.length) return [];
  return documentRepository.findByEncounterIdsAndType(encounterIds, documentTypeCode);
}

import { paginationSchema, PaginatedResponse } from "@/shared/schemas/pagination";
import { z } from "zod";

const documentFilterSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  practitionerId: z.number().int().optional(),
});

export async function getDocuments(
  filtersData: unknown,
  paginationData: unknown
): Promise<PaginatedResponse<any>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("documents");
    const filters = documentFilterSchema.parse(filtersData || {});
    const pagination = paginationSchema.parse(paginationData || {});

    const skip = (pagination.page - 1) * pagination.pageSize;
    const { items, totalCount } = await documentRepository.findAll(filters, {
      skip,
      take: pagination.pageSize,
    });

    return {
      data: items,
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pagination.pageSize),
      },
    };
}
