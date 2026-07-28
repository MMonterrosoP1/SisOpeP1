"use server";

import { CatalogType } from "./types";
import { catalogService } from "./service";
import { createCatalogSchema, updateCatalogSchema, allergenCatalogSchema } from "./schemas";
import { safeParseAction } from "@/shared/utils/zod-helpers";
import { handleActionError } from "@/shared/errors/app-error";
import { withAuth } from "@/shared/auth/auth-guard";
import { ActionResponse } from "@/shared/schemas/action-response";
import { searchIcd10, getCatalogs } from "./queries";

function normalizeCatalogName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')           // múltiples espacios → uno
    .normalize('NFD')                // descomponer acentos
    .replace(/[\u0300-\u036f]/g, '') // remover diacríticos
    .toLowerCase();
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export async function findSimilarCatalogItemsAction(
  type: CatalogType,
  name: string
): Promise<ActionResponse<any[]>> {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const normalized = normalizeCatalogName(name);
    const allItems = await getCatalogs(type);
    
    const similar = allItems.filter((item: any) => {
      const itemNormalized = normalizeCatalogName(item.name);
      return (
        itemNormalized === normalized ||
        itemNormalized.includes(normalized) ||
        normalized.includes(itemNormalized) ||
        levenshteinDistance(itemNormalized, normalized) <= 2
      );
    });

    return { success: true, data: similar };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createCatalogItem(
  type: CatalogType,
  data: unknown
): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const schema = type === 'allergenCatalog' ? allergenCatalogSchema : createCatalogSchema;
    const parseResult = safeParseAction(schema, data);
    if (!parseResult.success) return parseResult;

    const created = await catalogService.create(type, parseResult.data, session.user.id);
    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateCatalogItem(
  type: CatalogType,
  id: number,
  data: unknown
): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(updateCatalogSchema, data);
    if (!parseResult.success) return parseResult;

    const updated = await catalogService.update(type, id, parseResult.data, session.user.id);
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleCatalogActive(
  type: CatalogType,
  id: number
): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const updated = await catalogService.toggleActive(type, id, session.user.id);
    return { success: true, data: updated };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function searchIcd10Action(query: string): Promise<ActionResponse<any>> {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const results = await searchIcd10(query);
    return { success: true, data: results };
  } catch (error) {
    return handleActionError(error);
  }
}
