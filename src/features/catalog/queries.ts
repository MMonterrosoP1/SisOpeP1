import { cache } from "react";
import { getCatalogRepo } from "./repository";
import { CatalogType } from "./types";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData } from "@/lib/cache";

const ONE_HOUR = 3600;
const THIRTY_DAYS = 2592000;

export const getCatalogs = cache(async (type: CatalogType, activeOnly: boolean = true) => {
  const key = `catalog:${type}:list:${activeOnly}`;
  const cached = await getCachedData<any[]>(key);
  if (cached) return cached;

  const repo = getCatalogRepo(type);
  if (!repo) return [];
  
  const data = await repo.findAll(activeOnly ? { active: true } : undefined);
  await setCachedData(key, data, ONE_HOUR);
  return data;
});

export const getCatalogById = cache(async (type: CatalogType, id: number) => {
  const key = `catalog:${type}:id:${id}`;
  const cached = await getCachedData<any>(key);
  if (cached) return cached;

  const repo = getCatalogRepo(type);
  if (!repo) return null;
  
  const data = await repo.findById(id);
  if (data) {
    await setCachedData(key, data, ONE_HOUR);
  }
  return data;
});

export async function searchIcd10(query: string, page: number = 1, pageSize: number = 50) {
  const normalizedQuery = (query ?? "").trim();
  const key = `catalog:icd10:search:${normalizedQuery || "all"}:${page}:${pageSize}`;
  const cached = await getCachedData<any>(key);
  if (cached !== null) return cached;
  const skip = (page - 1) * pageSize;
  let items, totalCount;

  if (!query || query.trim() === "") {
    [items, totalCount] = await Promise.all([
      prisma.icd10Code.findMany({
        where: { active: true },
        take: pageSize,
        skip,
        orderBy: { code: "asc" },
      }),
      prisma.icd10Code.count({ where: { active: true } }),
    ]);
  } else {
    const trimmed = query.trim();
    const isCodeSearch = /^[A-Za-z]\d/i.test(trimmed);

    if (isCodeSearch) {
      const where = { active: true, code: { startsWith: trimmed.toUpperCase() } };
      [items, totalCount] = await Promise.all([
        prisma.icd10Code.findMany({ where, take: pageSize, skip, orderBy: { code: "asc" } }),
        prisma.icd10Code.count({ where }),
      ]);
    } else {
      const fullTextQuery = trimmed.split(/\\s+/).map(w => `+${w}*`).join(" ");
      const where = {
        active: true,
        OR: [
          { code: { contains: trimmed } },
          { description: { search: fullTextQuery } },
        ],
      };
      [items, totalCount] = await Promise.all([
        prisma.icd10Code.findMany({ where, take: pageSize, skip, orderBy: { code: "asc" } }),
        prisma.icd10Code.count({ where }),
      ]);
    }
  }

  const result = { items, totalCount, page, pageSize };
  await setCachedData(key, result, THIRTY_DAYS);
  return result;
});
