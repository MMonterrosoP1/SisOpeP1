"use server";

import { CatalogType } from "./types";
import { catalogService } from "./service";
import { createCatalogSchema, updateCatalogSchema, allergenCatalogSchema, exerciseCatalogSchema, maritalStatusSchema, companySchema, companyUpdateSchema, workplaceSchema, workAreaSchema, jobPositionSchema, workplaceUpdateSchema, workAreaUpdateSchema, jobPositionUpdateSchema } from "./schemas";
import { safeParseAction } from "@/shared/utils/zod-helpers";
import { handleActionError } from "@/shared/errors/app-error";
import { withAuth } from "@/shared/auth/auth-guard";
import { ActionResponse } from "@/shared/schemas/action-response";
import { updateTag, revalidatePath } from "next/cache";
import { invalidateCatalogCache } from "@/lib/cache";



export async function createCatalogItem(
  type: CatalogType,
  data: unknown
): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const schema =
      type === 'allergenCatalog' ? allergenCatalogSchema :
      type === 'exerciseCatalog' ? exerciseCatalogSchema :
      type === 'maritalStatus'   ? maritalStatusSchema   :
      type === 'company'         ? companySchema         :
      type === 'workplace'       ? workplaceSchema       :
      type === 'workArea'        ? workAreaSchema        :
      type === 'jobPosition'     ? jobPositionSchema     :
      createCatalogSchema;
    const parseResult = safeParseAction(schema, data);
    if (!parseResult.success) return parseResult;

    const created = await catalogService.create(type, parseResult.data, { id: session.user.id, email: session.user.email });
    updateTag(`catalog-${type}`);
    await invalidateCatalogCache(type);
    revalidatePath("/catalogs");
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

    const updateSchema = 
      type === 'company' ? companyUpdateSchema :
      type === 'workplace' ? workplaceUpdateSchema :
      type === 'workArea' ? workAreaUpdateSchema :
      type === 'jobPosition' ? jobPositionUpdateSchema :
      updateCatalogSchema;
    const parseResult = safeParseAction(updateSchema, data);
    if (!parseResult.success) return parseResult;

    const updated = await catalogService.update(type, id, parseResult.data, { id: session.user.id, email: session.user.email });
    updateTag(`catalog-${type}`);
    await invalidateCatalogCache(type, id);
    revalidatePath("/catalogs");
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

    const toggled = await catalogService.toggleActive(type, id, { id: session.user.id, email: session.user.email });
    updateTag(`catalog-${type}`);
    await invalidateCatalogCache(type, id);
    revalidatePath("/catalogs");
    return { success: true, data: toggled };
  } catch (error) {
    return handleActionError(error);
  }
}
