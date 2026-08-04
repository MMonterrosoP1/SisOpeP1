import { cache } from "react";
import { patientRepository } from "./repository";
import { patientFilterSchema } from "./schemas";
import { paginationSchema, PaginatedResponse } from "@/shared/schemas/pagination";
import { PatientListItem, PatientWithRelations } from "./types";
import { requireActiveUser } from "@/shared/auth/auth-guard";

export const getPatients = cache(
  async (
    filtersData: unknown,
    paginationData: unknown
  ): Promise<PaginatedResponse<PatientListItem>> => {
    await requireActiveUser();

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
  await requireActiveUser();
  return patientRepository.findById(id);
});

export const searchPatients = cache(async (query: string, limit: number = 10) => {
  await requireActiveUser();
  if (!query || query.length < 3) return [];
  const { items } = await patientRepository.findAll({ search: query, active: true }, { skip: 0, take: limit });
  return items;
});
