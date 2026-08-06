import { cache } from "react";
import { encounterRepository } from "./repository";
import { encounterService } from "./service";
import { paginationSchema, PaginatedResponse } from "@/shared/schemas/pagination";
import { z } from "zod";
import { idParamSchema } from "@/shared/utils/zod-helpers";

const encounterFilterSchema = z.object({
  patientId: idParamSchema.optional(),
  practitionerId: z.string().optional(),
  encounterTypeId: idParamSchema.optional(),
  search: z.string().optional(),
});

export const getEncounters = cache(
  async (
    filtersData: unknown,
    paginationData: unknown
  ): Promise<PaginatedResponse<unknown>> => {
    const filters = encounterFilterSchema.parse(filtersData || {});
    const pagination = paginationSchema.parse(paginationData || {});

    const skip = (pagination.page - 1) * pagination.pageSize;
    const { items, totalCount } = await encounterRepository.findAll(filters, {
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

export const getEncounterById = cache(async (id: number) => {
  return encounterService.getDetail(id);
});

export const getEncountersByPatient = cache(async (patientId: number, paginationData: unknown) => {
  return getEncounters({ patientId }, paginationData);
});

export const getLatestEncounterByPatient = cache(async (patientId: number) => {
  return encounterRepository.findLatestByPatient(patientId);
});
