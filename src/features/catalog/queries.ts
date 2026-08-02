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

export async function searchIcd10(query: string, limit: number = 300) {
  "use cache";
  cacheLife("max");
  cacheTag("icd10");

  if (!query || query.trim() === "") {
    return prisma.icd10Code.findMany({
      where: { active: true },
      take: limit,
      orderBy: { code: "asc" },
    });
  }
  
  return prisma.icd10Code.findMany({
    where: {
      active: true,
      OR: [
        { code: { contains: query } },
        { description: { contains: query } },
      ],
    },
    take: limit,
    orderBy: { code: "asc" },
  });
}
