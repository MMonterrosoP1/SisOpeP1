import { cache } from "react";
import { getCatalogRepo } from "./repository";
import { CatalogType } from "./types";
import { prisma } from "@/lib/prisma";

export const getCatalogs = cache(async (type: CatalogType, activeOnly: boolean = true) => {
  const repo = getCatalogRepo(type);
  if (!repo) return [];
  return repo.findAll(activeOnly ? { active: true } : undefined);
});

export const getCatalogById = cache(async (type: CatalogType, id: number) => {
  const repo = getCatalogRepo(type);
  if (!repo) return null;
  return repo.findById(id);
});

export const searchIcd10 = cache(async (query: string, limit: number = 300) => {
  if (!query || query.trim() === '') {
    return prisma.icd10Code.findMany({
      where: { active: true },
      take: limit,
      orderBy: { code: 'asc' },
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
    orderBy: { code: 'asc' },
  });
});
