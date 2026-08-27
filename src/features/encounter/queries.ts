import { cacheLife, cacheTag } from "next/cache";
import { encounterRepository } from "./repository";
import { encounterService } from "./service";
import { paginationSchema, PaginatedResponse } from "@/shared/schemas/pagination";
import { z } from "zod";
import { idParamSchema } from "@/shared/utils/zod-helpers";

const encounterFilterSchema = z.object({
  patientId: idParamSchema.optional(),
  practitionerId: z.coerce.number().int().optional(),
  encounterTypeId: idParamSchema.optional(),
  search: z.string().optional(),
});

export async function getEncounters(
  filtersData: unknown,
  paginationData: unknown
): Promise<PaginatedResponse<unknown>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters");
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

export async function getEncounterById(id: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters", `encounter-${id}`);
  return encounterService.getDetail(id);
}

export async function getEncountersByPatient(patientId: number, paginationData: unknown) {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters", `patient-${patientId}`);
  return getEncounters({ patientId }, paginationData);
}

export async function getLatestEncounterByPatient(patientId: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("encounters", `patient-${patientId}`);
  return encounterRepository.findLatestByPatient(patientId);
}
