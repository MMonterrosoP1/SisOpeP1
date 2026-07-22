"use server";

import { CatalogType } from "./types";
import { catalogService } from "./service";
import { createCatalogSchema, updateCatalogSchema } from "./schemas";
import { safeParseAction } from "@/shared/utils/zod-helpers";
import { handleActionError } from "@/shared/errors/app-error";
import { withAuth } from "@/shared/auth/auth-guard";
import { ActionResponse } from "@/shared/schemas/action-response";

export async function createCatalogItem(
  type: CatalogType,
  data: unknown
): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(createCatalogSchema, data);
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
