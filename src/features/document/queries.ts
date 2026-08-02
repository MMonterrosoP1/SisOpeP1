import { cache } from "react";
import { documentRepository } from "./repository";

export const getDocumentByEncounterAndType = cache(async (encounterId: number, documentTypeCode: string) => {
  return documentRepository.findByEncounterAndType(encounterId, documentTypeCode);
});

export const getDocumentStatusByEncounterIdsAndType = cache(async (encounterIds: number[], documentTypeCode: string) => {
  if (!encounterIds.length) return [];
  return documentRepository.findByEncounterIdsAndType(encounterIds, documentTypeCode);
});

import { paginationSchema, PaginatedResponse } from "@/shared/schemas/pagination";
import { z } from "zod";

const documentFilterSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
});

export const getDocuments = cache(
  async (
    filtersData: unknown,
    paginationData: unknown
  ): Promise<PaginatedResponse<any>> => {
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
);
