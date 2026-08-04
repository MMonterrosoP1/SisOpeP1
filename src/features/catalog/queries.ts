import { cacheLife, cacheTag } from "next/cache";
import { getCatalogRepo } from "./repository";
import { CatalogType } from "./types";
import { prisma } from "@/lib/prisma";

export async function getCatalogs(type: CatalogType, activeOnly: boolean = true) {
  "use cache";
  cacheLife("days");
  cacheTag(`catalog-${type}`);
  
  const repo = getCatalogRepo(type);
  if (!repo) return [];
  return repo.findAll(activeOnly ? { active: true } : undefined);
}

export async function getCatalogById(type: CatalogType, id: number) {
  "use cache";
  cacheLife("days");
  cacheTag(`catalog-${type}`, `catalog-${type}-${id}`);

  const repo = getCatalogRepo(type);
  if (!repo) return null;
  return repo.findById(id);
}

export async function searchIcd10(query: string, page: number = 1, pageSize: number = 50) {
  "use cache";
  cacheLife("max");
  cacheTag("icd10");

  const skip = (page - 1) * pageSize;

  if (!query || query.trim() === "") {
    const [items, totalCount] = await Promise.all([
      prisma.icd10Code.findMany({
        where: { active: true },
        take: pageSize,
        skip,
        orderBy: { code: "asc" },
      }),
      prisma.icd10Code.count({ where: { active: true } }),
    ]);
    return { items, totalCount, page, pageSize };
  }
  
  const trimmed = query.trim();
  const isCodeSearch = /^[A-Za-z]\d/i.test(trimmed);
  
  if (isCodeSearch) {
    const where = { active: true, code: { startsWith: trimmed.toUpperCase() } };
    const [items, totalCount] = await Promise.all([
      prisma.icd10Code.findMany({ where, take: pageSize, skip, orderBy: { code: "asc" } }),
      prisma.icd10Code.count({ where }),
    ]);
    return { items, totalCount, page, pageSize };
  }

  const fullTextQuery = trimmed.split(/\s+/).map(w => `+${w}*`).join(" ");
  const where = {
    active: true,
    OR: [
      { code: { contains: trimmed } },
      { description: { search: fullTextQuery } },
    ],
  };
  const [items, totalCount] = await Promise.all([
    prisma.icd10Code.findMany({ where, take: pageSize, skip, orderBy: { code: "asc" } }),
    prisma.icd10Code.count({ where }),
  ]);
  return { items, totalCount, page, pageSize };
}
