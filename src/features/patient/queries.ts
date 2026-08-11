import { cacheLife, cacheTag } from "next/cache";
import { patientRepository } from "./repository";
import { patientFilterSchema } from "./schemas";
import { paginationSchema, PaginatedResponse } from "@/shared/schemas/pagination";
import { PatientListItem, PatientWithRelations } from "./types";


export async function getPatients(
  filtersData: unknown,
  paginationData: unknown
): Promise<PaginatedResponse<PatientListItem>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("patients");
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

export async function getPatientById(id: number): Promise<PatientWithRelations | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("patients", `patient-${id}`);
  return patientRepository.findById(id);
}

export async function searchPatients(query: string, limit: number = 10) {
  "use cache";
  cacheLife("minutes");
  cacheTag("patients", "patients-search");
  if (!query || query.length < 3) return [];
  const { items } = await patientRepository.findAll({ search: query, active: true }, { skip: 0, take: limit });
  return items;
}
