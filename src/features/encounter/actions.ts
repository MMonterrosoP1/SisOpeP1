"use server";

import { safeParseAction } from "@/shared/utils/zod-helpers";
import { createEncounterSchema } from "./schemas";
import { encounterService } from "./service";
import { withAuth } from "@/shared/auth/auth-guard";
import { handleActionError } from "@/shared/errors/app-error";
import { ActionResponse } from "@/shared/schemas/action-response";

export async function createEncounter(data: unknown): Promise<ActionResponse<unknown>> {
  try {
    const session = await withAuth(["ADMIN", "DOCTOR"], async (s) => s);

    const parseResult = safeParseAction(createEncounterSchema, data);
    if (!parseResult.success) return parseResult;

    const created = await encounterService.create(parseResult.data, session.user.id);
    return { success: true, data: created };
  } catch (error) {
    return handleActionError(error);
  }
}

import { getEncountersByPatient } from "./queries";

export async function getRecentEncountersAction(patientId: number): Promise<ActionResponse<unknown>> {
  try {
    await withAuth(["ADMIN", "DOCTOR"], async (s) => s);
    const result = await getEncountersByPatient(patientId, { page: 1, pageSize: 15 });
    return { success: true, data: result.data };
  } catch (error) {
    return handleActionError(error);
  }
}
