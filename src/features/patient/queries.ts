import { cache } from "react";
import { patientRepository } from "./repository";
import { patientFilterSchema } from "./schemas";
import { paginationSchema, PaginatedResponse } from "@/shared/schemas/pagination";
import { PatientListItem, PatientWithRelations } from "./types";

export const getPatients = cache(
  async (
    filtersData: unknown,
    paginationData: unknown
  ): Promise<PaginatedResponse<PatientListItem>> => {
    const filters = patientFilterSchema.parse(filtersData || {});
    const pagination = paginationSchema.parse(paginationData || {});

    const skip = (pagination.page - 1) * pagination.pageSize;
    const { items, totalCount } = await patientRepository.findAll(filters, {
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

export const getPatientById = cache(async (id: number): Promise<PatientWithRelations | null> => {
  return patientRepository.findById(id);
});

export const searchPatients = cache(async (query: string, limit: number = 10) => {
  if (!query || query.length < 2) return [];
  const { items } = await patientRepository.findAll({ search: query, active: true }, { skip: 0, take: limit });
  return items;
});
